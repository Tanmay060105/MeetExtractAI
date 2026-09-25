import re
import uuid
import datetime
import traceback
from typing import List, Dict, Any, Tuple, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update

from app.models.evaluation import EvaluationRun, EvaluationRunStatus, EvaluationResult, EvaluationSample
from app.models.action_item import ActionItem
from app.services.extraction import ExtractionService
from app.services.validation import ValidationService
from app.core.config import settings

def normalize_text(text: str) -> set:
    if not text:
        return set()
    cleaned = re.sub(r'[^a-z0-9\s]', '', text.lower())
    return set(cleaned.split())

def calculate_jaccard(set1: set, set2: set) -> float:
    if not set1 and not set2:
        return 0.0
    intersection = set1.intersection(set2)
    union = set1.union(set2)
    return len(intersection) / len(union) if union else 0.0

class DeterministicMatcher:
    def __init__(self, threshold: float = 0.6):
        self.threshold = threshold

    def match(self, predictions: List[Dict[str, Any]], ground_truths: List[Dict[str, Any]]) -> Tuple[List[Tuple[Dict, Dict]], List[Dict], List[Dict]]:
        """
        Matches predictions against ground truth using greedy Jaccard similarity on the task string.
        Returns:
            - matches: list of (prediction, ground_truth)
            - unmatched_predictions: list of prediction dicts
            - unmatched_ground_truths: list of ground_truth dicts
        """
        pred_tokens = [normalize_text(p.get("task", "")) for p in predictions]
        gt_tokens = [normalize_text(g.get("task", "")) for g in ground_truths]

        potential_matches = []
        for i, p_set in enumerate(pred_tokens):
            for j, g_set in enumerate(gt_tokens):
                score = calculate_jaccard(p_set, g_set)
                if score >= self.threshold:
                    potential_matches.append((score, i, j))

        # Sort descending by score
        potential_matches.sort(key=lambda x: x[0], reverse=True)

        matched_p = set()
        matched_g = set()
        matches = []

        for score, i, j in potential_matches:
            if i not in matched_p and j not in matched_g:
                matched_p.add(i)
                matched_g.add(j)
                matches.append((predictions[i], ground_truths[j]))

        unmatched_predictions = [p for i, p in enumerate(predictions) if i not in matched_p]
        unmatched_ground_truths = [g for j, g in enumerate(ground_truths) if j not in matched_g]

        return matches, unmatched_predictions, unmatched_ground_truths

class EvaluationService:
    def __init__(self):
        self.matcher = DeterministicMatcher()
        self.extraction_service = ExtractionService()
        self.validation_service = ValidationService()

    async def execute_run(self, db: AsyncSession, run_id: uuid.UUID, dataset_id: uuid.UUID):
        """
        Executes an evaluation run sequentially over all samples in the dataset.
        Should be called as a BackgroundTask.
        """
        try:
            # Mark as running
            await db.execute(
                update(EvaluationRun)
                .where(EvaluationRun.id == run_id)
                .values(status=EvaluationRunStatus.RUNNING)
            )
            await db.commit()

            # Load samples
            samples_result = await db.execute(
                select(EvaluationSample).where(EvaluationSample.dataset_id == dataset_id)
            )
            samples = samples_result.scalars().all()

            for sample in samples:
                await self._process_sample(db, run_id, sample)

            # Mark as completed
            await db.execute(
                update(EvaluationRun)
                .where(EvaluationRun.id == run_id)
                .values(status=EvaluationRunStatus.COMPLETED, completed_at=datetime.datetime.now(datetime.timezone.utc))
            )
            await db.commit()

        except Exception as e:
            traceback.print_exc()
            await db.execute(
                update(EvaluationRun)
                .where(EvaluationRun.id == run_id)
                .values(status=EvaluationRunStatus.FAILED, completed_at=datetime.datetime.now(datetime.timezone.utc))
            )
            await db.commit()

    async def _process_sample(self, db: AsyncSession, run_id: uuid.UUID, sample: EvaluationSample):
        # 1. Run Extraction
        prediction_result = None
        failure_type = None
        metrics = {}
        
        try:
            # We must NOT create Meeting or ActionItem records.
            # We call the provider directly.
            ref_date = datetime.date.today()
            
            # The extraction service uses provider.extract_action_items
            ai_result = await self.extraction_service.provider.extract_action_items(sample.transcript, ref_date)
            import json
            prediction_result = json.loads(ai_result.model_dump_json())
            predictions = prediction_result.get("actions", [])
        except Exception as e:
            traceback.print_exc()
            failure_type = "PROCESSING_FAILURE"
            predictions = []

        gt_data = sample.ground_truth
        ground_truths = gt_data.get("action_items", [])

        # 2. Match
        matches, unmatched_preds, unmatched_gts = self.matcher.match(predictions, ground_truths)
        
        # 3. Evaluate Review state using pure ValidationService
        # We need to map dicts to ActionItem models purely for ValidationService
        action_item_models = []
        for p in predictions:
            try:
                # Provide dummy IDs, we won't persist them
                ai_model = ActionItem(
                    id=uuid.uuid4(),
                    task=p.get("task", ""),
                    owner_name=p.get("owner", ""),
                    deadline=p.get("deadline"),
                    status=p.get("status", "PENDING"),
                    confidence=p.get("confidence", 1.0),
                    evidence=p.get("evidence", "")
                )
                action_item_models.append(ai_model)
            except:
                pass
                
        # Pure in-memory validation (no DB calls)
        self.validation_service.validate_in_memory(action_item_models, [], sample.transcript)
        
        # Build mapping of predicted task to requires_review flag
        review_flags = {}
        for ai_model in action_item_models:
            norm = " ".join(normalize_text(ai_model.task))
            # NEEDS_REVIEW means requires_review = True
            review_flags[norm] = ai_model.review_status == "NEEDS_REVIEW"

        # 4. Field-level Evaluation & Taxonomy
        sample_failures = []
        
        # Unmatched GT -> MISSED_ACTION
        for g in unmatched_gts:
            sample_failures.append({"category": "MISSED_ACTION", "expected": g.get("task", "")})
            
        # Unmatched Pred -> FALSE_ACTION
        for p in unmatched_preds:
            sample_failures.append({"category": "FALSE_ACTION", "predicted": p.get("task", "")})
            
        # Matched field comparisons
        owner_evaluated = 0
        owner_correct = 0
        deadline_evaluated = 0
        deadline_correct = 0
        
        tp_review = 0
        fp_review = 0
        fn_review = 0
        tn_review = 0

        for p, g in matches:
            p_task_norm = " ".join(normalize_text(p.get("task", "")))
            
            # Review Evaluation
            pred_review = review_flags.get(p_task_norm, False)
            gt_review = g.get("requires_review", False)
            
            if gt_review and pred_review: tp_review += 1
            elif not gt_review and pred_review: fp_review += 1
            elif gt_review and not pred_review: fn_review += 1
            elif not gt_review and not pred_review: tn_review += 1
            
            if gt_review != pred_review:
                sample_failures.append({"category": "WRONG_REVIEW_DECISION", "expected": gt_review, "predicted": pred_review, "task": p.get("task")})

            # Owner
            p_owner = (p.get("owner") or "").strip().lower()
            g_owner = (g.get("owner") or "").strip().lower()
            if g_owner:
                owner_evaluated += 1
                if p_owner == g_owner:
                    owner_correct += 1
                else:
                    cat = "MISSING_OWNER" if not p_owner else "WRONG_OWNER"
                    sample_failures.append({"category": cat, "expected": g_owner, "predicted": p_owner, "task": p.get("task")})
            
            # Deadline
            p_dead = p.get("deadline")
            g_dead = g.get("deadline")
            if g_dead:
                deadline_evaluated += 1
                # Parse to date for semantic equivalence
                try:
                    p_date = datetime.datetime.fromisoformat(str(p_dead).replace("Z", "+00:00")).date() if p_dead else None
                except ValueError:
                    p_date = str(p_dead)
                    
                try:
                    g_date = datetime.datetime.fromisoformat(str(g_dead).replace("Z", "+00:00")).date() if g_dead else None
                except ValueError:
                    g_date = str(g_dead)
                
                if str(p_date) == str(g_date):
                    deadline_correct += 1
                else:
                    sample_failures.append({"category": "WRONG_DEADLINE", "expected": str(g_dead), "predicted": str(p_dead), "parsed_p": str(p_date), "parsed_g": str(g_date), "task": p.get("task")})
                    
            # Status
            p_stat = p.get("status")
            g_stat = g.get("status")
            if g_stat:
                if str(p_stat) != str(g_stat):
                    sample_failures.append({"category": "WRONG_STATUS", "expected": str(g_stat), "predicted": str(p_stat), "task": p.get("task")})

        # 5. Metrics calculation
        tp = len(matches)
        fp = len(unmatched_preds)
        fn = len(unmatched_gts)
        
        # Base precision/recall
        if tp + fp == 0 and tp + fn == 0:
            # 0 GT + 0 predictions
            precision, recall, f1 = 1.0, 1.0, 1.0
        elif tp + fn > 0 and tp + fp == 0:
            # GT > 0 + 0 predictions
            precision, recall, f1 = 0.0, 0.0, 0.0
        elif tp + fn == 0 and tp + fp > 0:
            # 0 GT + predictions > 0
            precision, recall, f1 = 0.0, 0.0, 0.0
        else:
            precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
            recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
            f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0

        # Review precision/recall
        rev_precision = tp_review / (tp_review + fp_review) if (tp_review + fp_review) > 0 else 0.0
        rev_recall = tp_review / (tp_review + fn_review) if (tp_review + fn_review) > 0 else 0.0
        
        metrics = {
            "precision": precision,
            "recall": recall,
            "f1": f1,
            "review_precision": rev_precision,
            "review_recall": rev_recall,
            "owner_accuracy": owner_correct / owner_evaluated if owner_evaluated > 0 else None,
            "deadline_accuracy": deadline_correct / deadline_evaluated if deadline_evaluated > 0 else None,
            "failures": sample_failures
        }

        # Primary failure_type
        if not failure_type and sample_failures:
            # Just take the first for the high-level column
            failure_type = sample_failures[0]["category"]
            
        result = EvaluationResult(
            run_id=run_id,
            sample_id=sample.id,
            prediction=prediction_result,
            ground_truth=gt_data,
            metrics=metrics,
            failure_type=failure_type
        )
        db.add(result)
        await db.commit()
