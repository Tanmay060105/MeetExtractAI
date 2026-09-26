import uuid
import re
from typing import List, Dict, Any, Optional
# pyrefly: ignore [missing-import]
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.action_item import ActionItem, ValidationStatus, ReviewStatus
from app.models.participant import Participant
from app.models.transcript import Transcript

class ValidationService:
    async def validate_action_items(self, db: AsyncSession, meeting_id: uuid.UUID, action_items: List[ActionItem]) -> dict:
        """
        Validates a list of extracted action items for a given meeting (with database persistence).
        """
        # Load participants
        participants_result = await db.execute(select(Participant).where(Participant.meeting_id == meeting_id))
        participants = participants_result.scalars().all()
        
        # Load transcript
        transcript_result = await db.execute(select(Transcript).where(Transcript.meeting_id == meeting_id))
        transcript = transcript_result.scalar_one_or_none()
        transcript_text = transcript.normalized_text.lower() if transcript and transcript.normalized_text else ""
        
        summary = self.validate_in_memory(action_items, participants, transcript_text)
        
        for item in action_items:
            db.add(item)
            
        return summary

    def validate_in_memory(self, action_items: List[ActionItem], participants: List[Participant], transcript_text: str) -> dict:
        """
        Pure in-memory validation of action items. Modifies the action_items objects in place.
        Does not query or persist to the database.
        """
        summary = {
            "total": len(action_items),
            "valid": 0,
            "invalid": 0,
            "ambiguous": 0,
            "unknown": 0,
            "needs_review": 0,
            "duplicates": 0,
            "confidence_distribution": {"high": 0, "medium": 0, "low": 0}
        }
        
        seen_tasks = []
        
        for item in action_items:
            reasons = []
            needs_review = False
            
            # Confidence is based on AI's initial confidence, then modified
            conf = item.confidence if item.confidence is not None else 1.0
            
            status_precedence = [] # to determine overall status
            
            # 1. Owner Validation
            if not item.owner_name or not item.owner_name.strip():
                reasons.append("MISSING_OWNER")
                needs_review = True
                status_precedence.append(ValidationStatus.UNKNOWN)
                conf -= 0.1
            else:
                if len(participants) == 0:
                    reasons.append("UNVERIFIED_OWNER")
                    needs_review = True
                    status_precedence.append(ValidationStatus.UNKNOWN)
                    conf -= 0.1
                else:
                    matched_participant = self._match_owner(item.owner_name, participants)
                    if matched_participant:
                        item.owner_id = matched_participant.id
                        status_precedence.append(ValidationStatus.VALID)
                    else:
                        reasons.append("INVALID_OWNER")
                        needs_review = True
                        status_precedence.append(ValidationStatus.INVALID)
                        conf -= 0.2
            
            # 2. Deadline Validation
            if item.deadline is None:
                # Missing deadline -> UNKNOWN, but not necessarily needs_review
                status_precedence.append(ValidationStatus.UNKNOWN)
            else:
                # Assumed valid if Pydantic parsed it successfully
                status_precedence.append(ValidationStatus.VALID)
            
            # 3. Evidence Validation
            if not item.evidence or not item.evidence.strip():
                reasons.append("MISSING_EVIDENCE")
                needs_review = True
                status_precedence.append(ValidationStatus.UNKNOWN)
                conf -= 0.3
            else:
                normalized_evidence = re.sub(r'\s+', ' ', item.evidence.lower().strip())
                if normalized_evidence and transcript_text:
                    words = normalized_evidence.split()
                    if len(words) > 3:
                        chunk = " ".join(words[:4])
                        if chunk not in transcript_text:
                            reasons.append("EVIDENCE_CONFLICT")
                            needs_review = True
                            status_precedence.append(ValidationStatus.INVALID)
                            conf -= 0.4
                    else:
                        if normalized_evidence not in transcript_text:
                            reasons.append("EVIDENCE_CONFLICT")
                            needs_review = True
                            status_precedence.append(ValidationStatus.INVALID)
                            conf -= 0.4
                elif not transcript_text:
                    reasons.append("EVIDENCE_CONFLICT")
                    needs_review = True
                    status_precedence.append(ValidationStatus.INVALID)
                    conf -= 0.4
            
            # 4. Duplicate Detection
            task_normalized = re.sub(r'\s+', ' ', item.task.lower().strip())
            is_duplicate = False
            owner_key = item.owner_id if getattr(item, "owner_id", None) else (item.owner_name.lower().strip() if item.owner_name else None)
            
            for seen in seen_tasks:
                if self._is_similar(task_normalized, owner_key, seen):
                    is_duplicate = True
                    break
            
            if is_duplicate:
                reasons.append("DUPLICATE_ACTION")
                needs_review = True
                conf -= 0.2
                summary["duplicates"] += 1
            else:
                seen_tasks.append({
                    "task": task_normalized,
                    "owner": owner_key
                })
            
            # 5. Calculate Final Confidence and Status
            item.confidence = max(0.0, min(1.0, conf))
            
            if item.confidence < 0.70:
                if "LOW_CONFIDENCE" not in reasons:
                    reasons.append("LOW_CONFIDENCE")
                needs_review = True
            
            if item.confidence >= 0.90:
                summary["confidence_distribution"]["high"] += 1
            elif item.confidence >= 0.70:
                summary["confidence_distribution"]["medium"] += 1
            else:
                summary["confidence_distribution"]["low"] += 1
            
            # Determine overall validation status
            if ValidationStatus.INVALID in status_precedence:
                item.validation_status = ValidationStatus.INVALID
                summary["invalid"] += 1
            elif ValidationStatus.AMBIGUOUS in status_precedence:
                item.validation_status = ValidationStatus.AMBIGUOUS
                summary["ambiguous"] += 1
            elif ValidationStatus.UNKNOWN in status_precedence:
                item.validation_status = ValidationStatus.UNKNOWN
                summary["unknown"] += 1
            else:
                item.validation_status = ValidationStatus.VALID
                summary["valid"] += 1
            
            if needs_review:
                item.review_status = ReviewStatus.NEEDS_REVIEW
                summary["needs_review"] += 1
            else:
                item.review_status = ReviewStatus.READY
            
            item.review_reasons = reasons if reasons else None
            
        return summary

    def _match_owner(self, owner_name: str, participants: List[Participant]) -> Optional[Participant]:
        normalized_name = owner_name.lower().strip()
        for p in participants:
            if p.name.lower().strip() == normalized_name:
                return p
        
        for p in participants:
            parts = p.name.lower().strip().split()
            if parts and normalized_name == parts[0]:
                return p
        
        return None

    def _is_similar(self, task1: str, owner_key: Any, seen: dict) -> bool:
        if task1 == seen["task"]:
            # owner_key is already normalized in the loop
            if owner_key == seen["owner"]:
                return True
        return False
