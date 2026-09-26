# Phase 11 — Evaluation Center (Final Implementation Plan)

## 1. Phase 11 Objective
The objective is to implement the "Evaluate" stage of the MeetExtract AI core loop. This involves creating a structured Evaluation Center allowing authenticated users to manage datasets of meeting transcripts and their corresponding ground truth, execute evaluation runs using the existing AI extraction pipeline, compare AI predictions against expectations, calculate precision/recall metrics, and explore specific extraction failures across multiple categories.

## 2. Current Repository Findings
- The core data models (`EvaluationDataset`, `EvaluationSample`, `EvaluationRun`, `EvaluationResult`) exist in `backend/app/models/evaluation.py`.
- **None of these models have a `user_id`**. Only the `Meeting` model currently correctly enforces user boundaries via `user_id`.
- The `ExtractionService` delegates AI calls to `self.provider.extract_action_items(transcript, reference_date)`. This provider abstraction is perfect for evaluation, as it returns structured data without persisting production `ActionItem` records itself.
- `ActionItem.owner_name` stores the AI-extracted text, while `ActionItem.owner_id` links to the resolved `Participant`. Evaluation must focus on `owner_name`.
- `backend/app/core/config.py` contains `AI_PROVIDER` and `AI_MODEL`, but no explicit `PROMPT_VERSION`.
- Existing API router placeholder exists at `backend/app/api/v1/endpoints/evaluations.py`.
- The database connection could not be successfully queried during planning due to stopped Docker containers, but a migration strategy has been formulated to safely handle any pre-existing evaluation data.
- The `ValidationService` is currently tightly coupled to `AsyncSession`, making database queries for `Participant` and `Transcript`, and calling `db.add(item)`. It cannot currently evaluate predictions purely in-memory.

## 3. Relevant Documentation Findings
- `docs/06-evaluation.md` strictly defines the evaluation philosophy: "The AI must not define its own ground truth," "Implement component-level evaluation," and a specific **Failure Taxonomy**.
- The docs specifically endorse deterministic matching for tasks (exact/partial string matching post-normalization).
- The evaluation API endpoints specified in docs are strictly limited to Creation and Retrieval (no Update or Delete operations are mandated for MVP).

## 4. Existing Evaluation Model Assessment
The existing schema is mostly sufficient, storing `prediction` and `ground_truth` as `JSONB`, alongside a `metrics` `JSONB` column. 
- **Requirement:** User isolation must be enforced.
- **Change:** `EvaluationDataset` and `EvaluationRun` require a `user_id` Foreign Key.

## 5. Ownership and Authorization Design
- **Strict User Scoping:** Every query regarding datasets, samples, runs, or results will include a `.where(user_id == current_user.id)` condition.
- **Backend Enforcement:** The `Depends(deps.get_current_active_user)` dependency will be applied to all evaluation endpoints.
- **No Multi-Tenancy:** The system remains single-user-owned per account. There are no global datasets, workspaces, or leaderboards.

## 6. Dataset/Sample Operations
Following the strict requirements from `docs/06-evaluation.md`, only the following operations are required and will be implemented. Unnecessary CRUD (Update/Delete) will be excluded to maintain MVP scope:
- **Create Dataset**
- **List Datasets**
- **Get Dataset (with samples)**
- **Add Sample to Dataset**

## 7. Evaluation Run Design
- An `EvaluationRun` acts as a snapshot container linking a dataset, model config, and results.
- **Triggering:** Triggered via `POST /api/v1/evaluations/runs`.
- **Status Flow:** `PENDING` -> `RUNNING` -> `COMPLETED` (or `FAILED` if the orchestrator crashes).

## 8. Prediction Generation Strategy
Evaluation predictions **MUST NOT** pollute production data.
- The `EvaluationService` will directly call `AIProvider.extract_action_items(sample.transcript, reference_date)`.
- It will **not** create a `Meeting` record.
- It will **not** save to the `ActionItem` table.
- The resulting `ExtractionResult` structure will be serialized directly into `EvaluationResult.prediction`.

## 9. Deterministic Matching Algorithm
To avoid unpredictable LLM judges or complex vector databases, the following deterministic MVP matching will be implemented as an isolated, testable utility function:
1. **Normalization:** Lowercase both predicted and ground-truth task strings. Remove all non-alphanumeric characters. Split into a set of tokens.
2. **Scoring:** Calculate the Jaccard Similarity (Intersection over Union of tokens).
3. **Threshold:** If similarity `>= 0.6`, the tasks are considered a potential match.
4. **Greedy Resolution:** Sort all potential matches descending by score. Assign 1:1 matches greedily to prevent multiple predictions claiming the same ground truth.
5. **Categorization:** 
   - Unmatched predictions = `FALSE_ACTION`
   - Unmatched ground truth = `MISSED_ACTION`

## 10. Field-Level Comparison Strategy
Once a task is successfully matched, its fields are evaluated for correctness:
- **Owner:**
  - *Ground Truth:* String name (or null).
  - *Prediction:* AI-extracted `owner_name` string (or null).
  - *Comparison:* Exact string match (case-insensitive).
- **Deadline:**
  - *Ground Truth:* Expected ISO date string (or null).
  - *Prediction:* AI-extracted `deadline` ISO string (or null).
  - *Comparison:* Exact match of the parsed Date.
- **Status:**
  - Exact string match against the `ActionStatus` enum.

## 11. Review Precision/Recall Strategy
To evaluate if the system correctly identifies cases requiring human review:
- **Prediction:** The predicted action item will be run through the refactored `ValidationService` (purely in-memory). If the service sets `review_status == NEEDS_REVIEW`, the prediction's `requires_review` flag is True.
- **Ground Truth:** Must explicitly contain a `requires_review` boolean flag.
- **True Positive (TP):** GT is True, Pred is True.
- **False Positive (FP):** GT is False, Pred is True.
- **False Negative (FN):** GT is True, Pred is False.
- **True Negative (TN):** GT is False, Pred is False.
- **Review Precision:** TP / (TP + FP)
- **Review Recall:** TP / (TP + FN)

## 12. Failure Taxonomy
The implementation will strictly utilize the taxonomy documented in `docs/06-evaluation.md`:
- `MISSED_ACTION`
- `FALSE_ACTION`
- `WRONG_TASK`
- `WRONG_OWNER`
- `MISSING_OWNER`
- `WRONG_DEADLINE`
- `AMBIGUOUS_DEADLINE`
- `WRONG_STATUS`
- `DUPLICATE`
- `MISSED_DUPLICATE`
- `INVALID_EVIDENCE`
- `MISSING_EVIDENCE`
- `WRONG_REVIEW_DECISION`
- `SCHEMA_FAILURE`
- `PROCESSING_FAILURE`

## 13. Metric Calculation
**Action Level & Metric Edge Cases:**
- Precision = TP / (TP + FP)
- Recall = TP / (TP + FN)
- F1 = 2 * (P * R) / (P + R)

*Project-Approved Edge Case Conventions (docs/06-evaluation.md):*
- 0 GT + 0 predictions: System correctly output nothing. Precision = 1.0, Recall = 1.0, F1 = 1.0.
- GT > 0 + 0 predictions: Missed all actions. Precision = 0.0, Recall = 0.0, F1 = 0.0.
- 0 GT + predictions > 0: Hallucinated actions. Precision = 0.0, Recall = 0.0, F1 = 0.0.
- Safe division: Division by zero will be safeguarded via these explicit fallback states.

**Field Level:**
- Owner Accuracy = Correct Owner / Evaluated Owner Cases
- Deadline Accuracy = Correct Deadline / Evaluated Deadline Cases

## 14. EvaluationResult Storage Design
The existing `EvaluationResult` model will be utilized as follows:
- `prediction`: JSONB array of the raw structured output from the AIProvider.
- `ground_truth`: JSONB object reflecting the sample's ground truth.
- `metrics`: JSONB object containing sample-level Precision, Recall, and F1.
- `failure_type`: In cases where multiple failures occur per sample, the most severe failure will be logged here for quick querying, while an array of detailed failures will be injected into the `metrics` JSONB (e.g. `metrics.failures = [{"category": "WRONG_OWNER", ...}]`).

## 15. Model/Prompt Version Tracking
- **Model Version:** Captured from `settings.AI_MODEL`.
- **Prompt Version:** Since a dynamic prompt management system does not exist, this will default to `"v1-hardcoded"` to track the current static codebase prompt. If the prompt is modified in code later, this string can be updated. We will **not** build a prompt management UI.

## 16. Background Execution and Failure Handling
- **Mechanism:** FastAPI `BackgroundTasks`.
- **Handling:** Samples will be processed sequentially. 
- **Sample Failure:** If the AI provider fails (e.g. timeout) for a specific sample, that `EvaluationResult` will receive a `PROCESSING_FAILURE` and metrics will reflect 0% extraction. The overall run will **continue** to the next sample.
- **Run Failure:** If the background orchestrator itself crashes unrecoverably, a generic exception handler will mark the `EvaluationRun.status` as `FAILED`.

## 17. Backend Files to Create
- `backend/alembic/versions/<hash>_add_evaluation_user_ownership.py`: Adds `user_id` to evaluation datasets/runs to guarantee data isolation.
- `backend/app/schemas/evaluation.py`: Pydantic definitions for Datasets, Samples, Runs, and Results.
- `backend/app/services/evaluation.py`: Houses the deterministic matcher, metric calculators, and the run orchestrator.
- `backend/tests/test_evaluation_matching.py`: Unit tests specifically asserting the deterministic matching edge cases (exact, partial, different, duplicates, unmatched).

## 18. Backend Files to Modify
- `backend/app/models/evaluation.py`: Add `user_id` foreign key columns to `EvaluationDataset` and `EvaluationRun`.
- `backend/app/api/v1/endpoints/evaluations.py`: Implement the restricted endpoints (Create/List Dataset, Add Sample, Create/Get Run, Get Results).
- `backend/app/api/v1/api.py`: Ensure the router is properly registered.
- `backend/app/services/validation.py`: Extract the core validation logic into a pure, in-memory function (`validate_in_memory`) to evaluate predictions without database queries (`Participant`/`Transcript`) or persistence (`db.add(item)`).

## 19. Frontend Files to Create
- `frontend/src/app/dashboard/evaluation/runs/[id]/page.tsx`: The Run Details page displaying metrics, failure charts, and a side-by-side Ground Truth vs. Prediction comparison interface.

## 20. Frontend Files to Modify
- `frontend/src/lib/api.ts`: Add `EvaluationDataset`, `EvaluationRun`, `EvaluationResult` types and standard fetch wrappers. **(Using existing architecture, not splitting into a new file)**.
- `frontend/src/app/dashboard/evaluation/page.tsx`: Build the Evaluation Center Overview (Datasets list, Recent Runs list, and high-level KPI cards) utilizing the existing professional MeetExtract design language.

## 21. API Endpoint Specification
- `GET /api/v1/evaluations/datasets`
- `POST /api/v1/evaluations/datasets`
- `GET /api/v1/evaluations/datasets/{id}`
- `POST /api/v1/evaluations/datasets/{id}/samples`
- `GET /api/v1/evaluations/runs`
- `POST /api/v1/evaluations/runs`
- `GET /api/v1/evaluations/runs/{id}`
- `GET /api/v1/evaluations/runs/{id}/results`

## 22. Frontend Evaluation Center Structure
Following the MeetExtract professional design language (restrained, high information density, accessible, minimal animation):
1. **Overview View (`/dashboard/evaluation`)**:
   - Header: Title and Top-level Run F1 Trend.
     - **F1 Trend Explicit Definition**:
       - X-axis = chronological evaluation runs
       - Y-axis = run-level F1
       - Zero runs = appropriate empty state
       - One run = show the metric without pretending a trend exists
       - Multiple runs = chronological trend using CSS/SVG primitives (no external chart library)
   - Main Split: Left pane for "Evaluation Datasets", Right pane for "Recent Runs".
2. **Run Details View (`/dashboard/evaluation/runs/[id]`)**:
   - Info Header: Run ID, Model, Prompt Version, Date, Status.
   - Metrics Banner: Action Precision, Recall, F1, Review Precision, Owner Accuracy.
   - Failure Distribution: A simple CSS-based horizontal bar visualization counting failures by Taxonomy category. No external charting library.
   - Sample List: Accordions showing Transcript snippet. Inside, a clean side-by-side table: `Ground Truth Field | Predicted Field | Status (Match/Fail)`.

## 23. Security and Ownership
All endpoints will inject `current_user = Depends(deps.get_current_active_user)`.
All service methods will require `user_id` as a parameter and append `.where(Model.user_id == user_id)` to SQL statements.
No data will be visible across accounts.

## 24. Migration Strategy
Since I am currently unable to query the database to determine if existing evaluation data is present, the implementation step will begin with a strict check:
- **CASE A (Empty tables):** Generate the alembic migration with non-nullable `user_id`.
- **CASE B (Existing data):** Pause and prompt for a manual decision on how to handle existing un-owned data (e.g., delete it since it's development data, or assign it to a default user). **No destructive drops will occur silently.**

## 25. Testing and Verification
- **Matching Unit Tests:** Will cover the 12 specific matching scenarios requested (exact, case diffs, punctuation diffs, minor wording, completely different, duplicates, short tasks, empty text, greedy collision resolution, unmatched predictions, unmatched ground truth).
- **Run Verification:** Execute one realistic evaluation run with 2-3 samples.
- **Frontend Verification:** Next.js build compilation and successful rendering of the metrics.

## 26. Performance Considerations
- Background processing ensures API responsiveness.
- Evaluation runs are intended for validation (e.g. 5-30 samples), not bulk processing thousands of records at once.
- Fetching results will use optimized SQL rather than N+1 queries.

## 27. Risks and Edge Cases
- **Duplicate Prediction Collisions:** Greedy Jaccard matching ensures only one prediction maps to one ground truth.
- **AI Formatting Errors:** If the AI fails to return valid JSON, the `AIProvider` handles it via fallback or throws. The evaluation loop will catch the exception and log a `PROCESSING_FAILURE` for that specific sample.

## 28. Explicitly Out of Scope
- Dataset Update/Delete endpoints.
- Sample Update/Delete endpoints.
- Celery / Redis orchestration.
- Embedding/Vector/Semantic ML matching.
- Multi-tenancy and global analytics.
- Prompt editing UI.
- New frontend charting library dependencies.
- Modifications to the production `ExtractionService` or `ActionItem` persistence behavior.

## 29. Implementation Order
1. Check DB state for migration strategy.
2. Generate Alembic Migration for `user_id`.
3. Refactor `ValidationService` to expose pure in-memory validation.
4. Create `backend/tests/test_evaluation_matching.py` and implement the deterministic matcher in `services/evaluation.py`.
5. Implement the Run orchestrator.
6. Create Schemas and API endpoints.
7. Update `frontend/src/lib/api.ts`.
8. Build `page.tsx` and `runs/[id]/page.tsx` UIs.
9. Perform E2E Verification.

## 30. Acceptance Criteria
- EvaluationDataset/Run models successfully restrict access per user.
- The matcher correctly calculates Jaccard >= 0.6 and handles the 12 unit test cases.
- A run successfully invokes the AIProvider in the background and populates `EvaluationResult`.
- The frontend cleanly renders Precision, Recall, and F1 with correct handling of zero-GT/zero-Pred edge cases.
- The side-by-side comparison accurately flags field-level differences.
- No production `ActionItems` or `Meetings` are generated during evaluation.

## 31. Documentation Changes Required
- The implemented Evaluation API and any deviations discovered during implementation must remain consistent with the project's API/documentation structure.
- Upon completion and verification of Phase 11, the relevant documentation files (e.g., `06-evaluation.md`, `PROJECT_STATE.md`) will be updated to reflect the finalized MVP implementation.

## 32. Architecture Conflicts / Decisions Requiring Approval
- **None.** The revised plan strictly aligns with the existing documentation, UI design language, and isolation requirements. The `ValidationService` refactor ensures we reuse existing logic without breaking the "No Production Data Pollution" rule.
