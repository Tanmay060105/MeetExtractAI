# MeetExtract AI — AI Evaluation Specification

**Document:** `docs/06-evaluation.md`  
**Version:** 1.0  
**Status:** Draft  
**Project:** MeetExtract AI

---

# 1. Purpose

The purpose of this document is to define a reproducible evaluation system for measuring the quality of MeetExtract AI's meeting-to-action-item extraction pipeline.

The evaluation system must answer:

1. Did the system identify the correct action items?
2. Did it avoid extracting non-actions?
3. Did it identify the correct owner?
4. Did it identify the correct deadline?
5. Did it identify the correct status?
6. Did it provide valid supporting evidence?
7. Did it correctly identify uncertain cases?
8. Did changes to the model or prompt improve or reduce quality?
9. Which failure modes occur most frequently?

The evaluation system is a core part of the product, not an optional analytics feature.

---

# 2. Evaluation Philosophy

MeetExtract AI must not evaluate AI quality using subjective impressions alone.

The evaluation process should be:

```text
Dataset
   ↓
Ground Truth
   ↓
AI Extraction
   ↓
Normalization
   ↓
Comparison
   ↓
Metrics
   ↓
Failure Analysis
   ↓
Regression Tracking
```

---

# 3. Evaluation Principles

## 3.1 Reproducibility

The same:

```text
Dataset
+
Model
+
Prompt Version
+
Configuration
```

should produce a comparable evaluation result.

---

## 3.2 Ground Truth First

Evaluation must compare AI output against human-defined expected results.

The AI must not define its own ground truth.

---

## 3.3 Component-Level Evaluation

Overall extraction quality is not enough.

Measure individual components:

```text
Action Detection
Task
Owner
Deadline
Status
Evidence
```

---

## 3.4 Failure Analysis

A score alone does not explain why the system failed.

Every important failure should be classified.

---

## 3.5 Regression Protection

A prompt or model change must not silently degrade previously working cases.

---

# 4. Evaluation Scope

The initial evaluation system covers:

```text
Action-item detection
Task extraction
Owner extraction
Deadline extraction
Status extraction
Evidence extraction
Duplicate detection
Non-action filtering
Validation behavior
Review triggering
```

---

# 5. Evaluation Dataset

The evaluation dataset is a collection of meeting transcript samples with manually verified expected outputs.

Each dataset should contain:

```text
Transcript
Ground Truth
Metadata
Dataset Version
```

---

# 6. Dataset Categories

The dataset must contain multiple difficulty categories.

## Category A — Explicit Assignments

Example:

```text
"Rahul, please prepare the deployment report by Friday."
```

Expected:

```text
Task: Prepare deployment report
Owner: Rahul
Deadline: Friday
```

---

## Category B — Implicit Commitments

Example:

```text
"I'll send the updated design tomorrow."
```

Expected:

```text
Task: Send updated design
Owner: Speaker
Deadline: Tomorrow
```

---

## Category C — Relative Deadlines

Examples:

```text
Tomorrow
Friday
Next week
By EOD
Next month
```

The evaluation must verify whether the system correctly interprets the temporal expression given the available meeting context.

---

## Category D — Missing Owner

Example:

```text
"The API documentation needs to be updated before release."
```

Expected:

```text
Task: Update API documentation
Owner: Unknown
```

The system should not invent an owner.

---

## Category E — Ambiguous Owner

Example:

```text
"We should probably get this fixed."
```

If the transcript does not establish responsibility, the system should flag the item appropriately rather than guessing.

---

## Category F — Multiple Speakers

The dataset should contain conversations involving several participants.

Evaluation should verify speaker attribution.

---

## Category G — Duplicate Actions

Example:

```text
Speaker A:
"I'll update the documentation."

Speaker B:
"Yes, Rahul will update the documentation."
```

The evaluation should determine whether the system recognizes the potential duplicate.

---

## Category H — Non-Actions

Examples:

```text
"The deployment was successful."

"We discussed the new API."

"Does everyone agree with the proposal?"
```

These should not automatically become action items.

---

## Category I — Ambiguous Statements

Examples:

```text
"Maybe we should update this."

"We can look at it later."

"Someone should check the report."
```

These cases are important for evaluating uncertainty handling.

---

## Category J — Multiple Actions

A single transcript may contain several independent action items.

The system must identify each valid action separately.

---

# 7. Dataset Difficulty Levels

Each evaluation sample should optionally have a difficulty level:

```text
Easy
Medium
Hard
```

---

## Easy

Clear:

* Action
* Owner
* Deadline

---

## Medium

Contains one or more uncertainties.

Examples:

* Relative deadline
* Missing owner
* Multiple speakers

---

## Hard

Contains:

* Ambiguity
* Multiple related actions
* Duplicates
* Non-actions
* Conflicting evidence
* Complex temporal expressions

---

# 8. Ground Truth Structure

Each transcript must have manually defined ground truth.

Conceptual structure:

```json
{
  "transcript_id": "sample-001",
  "actions": [
    {
      "task": "Prepare deployment report",
      "owner": "Rahul",
      "deadline": "2026-09-25",
      "status": "Pending",
      "evidence": {
        "speaker": "Amit",
        "text": "Rahul, please prepare the deployment report by Friday."
      }
    }
  ]
}
```

The exact persisted schema must follow the SRS/database schema.

---

# 9. Ground Truth Rules

Human annotators must follow consistent rules.

## Rule 1

Do not infer information that is not supported by the transcript.

---

## Rule 2

Unknown owner must remain unknown.

---

## Rule 3

Ambiguous deadline must remain ambiguous unless context clearly resolves it.

---

## Rule 4

A discussion is not automatically an action.

---

## Rule 5

A question is not automatically an action.

---

## Rule 6

Potential duplicates should be explicitly annotated.

---

# 10. Annotation Guidelines

Annotators should answer:

```text
Is this an action?
Who owns it?
What is the task?
When is it due?
What is its current status?
What evidence supports it?
Is the statement ambiguous?
Is another action equivalent to it?
```

---

# 11. Annotation Consistency

Where possible, difficult samples should be reviewed by more than one annotator.

Disagreements should be documented.

The project should not force artificial certainty when the transcript itself is ambiguous.

---

# 12. Evaluation Run

An evaluation run represents one execution of a specific model/prompt configuration against a dataset.

Conceptually:

```text
Evaluation Dataset
       ↓
Evaluation Run
       ↓
AI Extraction
       ↓
Comparison
       ↓
Metrics
       ↓
Failure Analysis
```

---

# 13. Evaluation Run Metadata

Store:

```text
Dataset ID
Dataset Version
Model Name
Model Version where available
Prompt Version
Configuration
Run Timestamp
Number of Samples
Run Status
```

---

# 14. Evaluation Run States

Use:

```text
PENDING
RUNNING
COMPLETED
FAILED
```

---

# 15. Evaluation Result

Each sample should produce an evaluation result.

Conceptually:

```text
Sample
 ↓
Ground Truth
 ↓
Prediction
 ↓
Comparison
 ↓
Metrics
 ↓
Failures
```

---

# 16. Action Detection Evaluation

The first question is:

> Did the system correctly identify which statements represent actionable work?

For every expected action:

```text
True Positive
False Negative
```

For every incorrectly extracted action:

```text
False Positive
```

---

# 17. Precision

Precision measures how many predicted actions were actually valid actions.

```text
Precision = TP / (TP + FP)
```

High precision means the system does not generate excessive false action items.

---

# 18. Recall

Recall measures how many expected actions were successfully identified.

```text
Recall = TP / (TP + FN)
```

High recall means the system misses fewer valid actions.

---

# 19. F1 Score

F1 combines precision and recall.

```text
F1 = 2 × (Precision × Recall)
     / (Precision + Recall)
```

F1 should be used as one evaluation metric, not the only metric.

---

# 20. Task Evaluation

Task text should be compared using normalized comparison.

Normalization may include:

```text
Whitespace normalization
Case normalization
Punctuation normalization
Minor formatting normalization
```

The evaluation should distinguish:

```text
Exact Match
Partial / Semantic Match
Incorrect Task
Missing Task
```

---

# 21. Exact Task Match

The predicted task is considered an exact match when it corresponds closely enough to the normalized ground-truth task according to the defined matching rule.

The exact matching implementation must be deterministic.

---

# 22. Partial Task Match

A partial match may occur when:

```text
Core action is correct
But wording differs
```

Example:

Ground truth:

```text
Update API documentation
```

Prediction:

```text
Update the API docs
```

These may be treated as equivalent after normalization.

---

# 23. Owner Evaluation

Owner evaluation should classify predictions as:

```text
Correct
Incorrect
Missing
Unknown
Ambiguous
```

---

# 24. Owner Accuracy

Initial metric:

```text
Owner Accuracy =
Correct Owner Predictions / Evaluated Owner Cases
```

The denominator must be explicitly documented.

Unknown-owner cases must not be incorrectly counted as correct merely because the system produced a value.

---

# 25. Deadline Evaluation

Deadline evaluation must consider:

```text
Exact Date
Relative Expression
Ambiguous Date
Missing Deadline
Incorrect Deadline
```

---

# 26. Deadline Accuracy

For resolved deadlines:

```text
Deadline Accuracy =
Correct Deadline Predictions
/
Evaluated Resolvable Deadlines
```

Ambiguous cases should be evaluated separately.

---

# 27. Relative Date Evaluation

Example:

Meeting date:

```text
September 20, 2026
```

Transcript:

```text
"Finish this tomorrow."
```

Expected normalized deadline:

```text
September 21, 2026
```

The evaluation system must only resolve relative dates when the required context is available.

---

# 28. Status Evaluation

Evaluate:

```text
Pending
In Progress
Completed
Blocked
Needs Review
```

against the defined ground truth.

---

# 29. Status Accuracy

```text
Status Accuracy =
Correct Status Predictions
/
Evaluated Status Cases
```

---

# 30. Evidence Evaluation

Evidence quality should be evaluated separately from extraction correctness.

Check:

```text
Evidence exists
Evidence is relevant
Evidence supports the action
Speaker is correct where available
Location is correct where available
```

---

# 31. Evidence Categories

```text
VALID
PARTIALLY_VALID
INVALID
MISSING
```

---

# 32. Evidence Precision

The system should avoid attaching unrelated transcript text as evidence.

An evidence prediction is valid only when it supports the extracted action.

---

# 33. Duplicate Detection Evaluation

Duplicate detection should measure:

```text
Correct Duplicate Detection
Missed Duplicate
False Duplicate
```

---

# 34. Non-Action Evaluation

The evaluation dataset must contain non-action statements.

Examples:

```text
Discussion
Question
Information
Status update
Decision without assignment
```

The system should avoid turning these into actions.

---

# 35. Non-Action Precision

Measure:

```text
Correctly rejected non-actions
/
Total non-action cases
```

This metric should be tracked separately.

---

# 36. Confidence Evaluation

Confidence must not be treated as correct simply because the LLM reports a high number.

Confidence should be compared with actual correctness.

---

# 37. Confidence Bands

Initial bands:

```text
High:   90–100
Medium: 70–89
Low:     0–69
```

These thresholds are provisional.

They should be revised if evaluation results show that the bands do not meaningfully distinguish reliable from unreliable outputs.

---

# 38. Confidence Quality

Evaluate whether:

```text
High-confidence predictions
```

are actually more reliable than:

```text
Medium-confidence predictions
```

and whether low-confidence cases appropriately identify difficult outputs.

---

# 39. Review Trigger Evaluation

Evaluate whether the system correctly identifies cases requiring human review.

Review triggers include:

```text
Missing owner
Ambiguous owner
Ambiguous deadline
Low confidence
Duplicate candidate
Validation failure
Evidence conflict
Insufficient evidence
```

---

# 40. Review Precision

Measure how many review-triggered items genuinely require review according to the evaluation rules.

---

# 41. Review Recall

Measure how many cases that genuinely require review were successfully flagged.

---

# 42. Over-Review Analysis

Excessive review requirements reduce automation value.

Track:

```text
Total Actions
Review-Required Actions
Review Rate
```

---

# 43. Under-Review Analysis

Missing a case that should have been reviewed can create more serious reliability problems.

Track:

```text
Cases Requiring Review
Cases Correctly Flagged
Cases Incorrectly Finalized
```

---

# 44. Overall Evaluation Metrics

Each evaluation run should provide a summary similar to:

```text
Action Precision
Action Recall
Action F1
Task Accuracy
Owner Accuracy
Deadline Accuracy
Status Accuracy
Evidence Validity
Duplicate Detection
Non-Action Precision
Review Precision
Review Recall
```

---

# 45. Metric Aggregation

Metrics should be available at:

```text
Overall
Dataset
Difficulty
Category
Field
Model
Prompt Version
```

---

# 46. Category-Level Analysis

Example:

```text
Explicit Assignments
Implicit Commitments
Relative Deadlines
Missing Owners
Duplicates
Non-Actions
Ambiguous Statements
```

This helps identify specific weaknesses.

---

# 47. Difficulty-Level Analysis

Compare:

```text
Easy
Medium
Hard
```

The purpose is diagnostic rather than competitive.

---

# 48. Failure Taxonomy

Every meaningful failure should be classified.

Primary categories:

```text
MISSED_ACTION
FALSE_ACTION
WRONG_TASK
WRONG_OWNER
MISSING_OWNER
WRONG_DEADLINE
AMBIGUOUS_DEADLINE
WRONG_STATUS
DUPLICATE
MISSED_DUPLICATE
INVALID_EVIDENCE
MISSING_EVIDENCE
WRONG_REVIEW_DECISION
SCHEMA_FAILURE
PROCESSING_FAILURE
```

---

# 49. Failure Record

Conceptual structure:

```json
{
  "category": "WRONG_DEADLINE",
  "sample_id": "sample-021",
  "expected": "2026-09-25",
  "predicted": "2026-09-26",
  "severity": "medium",
  "notes": "Relative date interpreted incorrectly."
}
```

The final database schema must follow the SRS.

---

# 50. Failure Severity

Initial severity levels:

```text
LOW
MEDIUM
HIGH
CRITICAL
```

Severity definitions must be documented and applied consistently.

---

# 51. Critical Failures

Potential critical failures include:

```text
Fabricated owner
Fabricated deadline
Unsupported action
Incorrect evidence presented as fact
Silent processing failure
Corrupted persisted result
```

The exact classification should be refined during implementation.

---

# 52. Failure Analysis Dashboard

The Evaluation Center should display:

```text
Total Failures
Failure Categories
Failure Frequency
Failure Examples
Failure Trends
```

---

# 53. Failure Trend

Track failures across evaluation runs.

Example:

```text
Run 1 → 32 failures
Run 2 → 25 failures
Run 3 → 21 failures
```

The system should present the measurements without turning them into unsupported claims about overall model quality.

---

# 54. Prompt Versioning

Every production evaluation must identify the prompt version.

Example:

```text
prompt-v1
prompt-v2
prompt-v3
```

Prompt changes must not overwrite historical versions.

---

# 55. Model Versioning

Where provider information permits, record:

```text
Provider
Model
Model Version
Configuration
```

If a provider does not expose a model version, store the available identifier and note the limitation.

---

# 56. Evaluation Configuration

Store relevant configuration such as:

```text
Temperature where applicable
Max output tokens where applicable
Structured output configuration
Prompt version
Model
```

Only configuration that materially affects output should be stored.

---

# 57. Regression Dataset

A fixed regression dataset should contain representative high-value cases.

It should include:

```text
Normal cases
Edge cases
Previously failed cases
Previously corrected cases
Critical cases
```

---

# 58. Regression Trigger

Run regression evaluation after changes to:

```text
Prompt
Model
Output Schema
Extraction Logic
Validation Logic
Confidence Logic
Date Parsing
Owner Resolution
Duplicate Detection
```

---

# 59. Regression Comparison

For every regression run compare:

```text
Previous Run
Current Run
Metric Difference
New Failures
Resolved Failures
```

---

# 60. Regression Safety

A change should be investigated when it causes:

```text
Meaningful metric degradation
New critical failures
Large increase in false actions
Large increase in missed actions
Incorrect fabricated fields
```

No arbitrary universal threshold should be assumed before sufficient project evaluation data exists.

---

# 61. Model Comparison

The system may support comparing multiple models.

Example:

```text
Model A
Model B
```

Compare using the same:

```text
Dataset
Ground Truth
Prompt Version
Evaluation Rules
```

---

# 62. Prompt Comparison

Similarly:

```text
Prompt A
Prompt B
```

should be evaluated against the same dataset.

---

# 63. Controlled Comparison

When comparing configurations, change as few variables as possible.

For example:

```text
Same Dataset
Same Ground Truth
Same Prompt
Different Model
```

or:

```text
Same Dataset
Same Model
Different Prompt
```

---

# 64. Evaluation Reproducibility

An evaluation result should be reproducible enough to understand:

```text
What was evaluated
When it was evaluated
With which model
With which prompt
Against which dataset
Using which metric definitions
```

---

# 65. Evaluation Dataset Versioning

Dataset changes must create a new version.

Example:

```text
dataset-v1
dataset-v2
```

Do not silently modify historical evaluation data.

---

# 66. Annotation Versioning

If ground truth is corrected, record the dataset/annotation version.

Historical evaluation results should remain traceable.

---

# 67. Evaluation Storage

Store at minimum:

```text
EvaluationDataset
EvaluationRun
EvaluationResult
Failure Records
```

Exact fields should follow:

```text
docs/02-srs.md
docs/03-system-architecture.md
```

---

# 68. Evaluation API

The API should support operations equivalent to:

```text
Create Dataset
List Datasets
Get Dataset
Add Samples
Create Evaluation Run
Get Run
Get Results
Get Metrics
Get Failures
Compare Runs
```

Exact endpoint names must follow the SRS.

---

# 69. Evaluation UI

The Evaluation Center should provide:

```text
Dataset List
Dataset Details
Evaluation Runs
Run Details
Metric Summary
Failure Analysis
Run Comparison
```

---

# 70. Evaluation Run Page

A run should display:

```text
Dataset
Model
Prompt Version
Run Status
Sample Count
Overall Metrics
Failure Count
```

---

# 71. Metric Visualization

Useful visualizations include:

```text
Metric Summary
Metric by Category
Metric by Difficulty
Failure Distribution
Failure Trend
```

Charts must remain readable and should not overwhelm the interface.

---

# 72. Sample-Level Inspection

Users should be able to inspect a specific evaluation sample.

Show:

```text
Transcript
Ground Truth
AI Prediction
Comparison
Failures
Evidence
```

---

# 73. Side-by-Side Comparison

A useful evaluation view is:

```text
GROUND TRUTH        AI OUTPUT
--------------------------------
Task                Task
Owner               Owner
Deadline            Deadline
Status              Status
Evidence            Evidence
```

Differences should be clearly identified.

---

# 74. Evaluation Explainability

The Evaluation Center should answer:

```text
What did the AI predict?
What should it have predicted?
What was wrong?
What category was the failure?
```

---

# 75. Evaluation Data Privacy

Evaluation datasets may contain meeting information.

Therefore:

```text
Do not expose sensitive transcripts unnecessarily.
Do not log complete transcripts in application logs.
Use synthetic/anonymized datasets for public demonstrations where appropriate.
```

---

# 76. Public Demo Dataset

The repository should include a safe demonstration dataset that does not contain private real-world meeting information.

---

# 77. Synthetic Evaluation Data

Synthetic transcripts may be used for expanding coverage.

However, synthetic data should not completely replace realistic manually reviewed samples.

---

# 78. Human Review of Ground Truth

Important evaluation samples should be manually verified.

The evaluation system itself cannot guarantee that the ground truth is correct.

---

# 79. Evaluation Limitations

Evaluation results are limited by:

```text
Dataset size
Dataset diversity
Ground-truth quality
Annotation consistency
Model nondeterminism
Provider changes
Metric definitions
```

These limitations should be visible in technical documentation.

---

# 80. Minimum Evaluation Dataset

Before MVP completion, create at least:

```text
Explicit action cases
Implicit commitment cases
Relative date cases
Missing owner cases
Ambiguous owner cases
Multiple-speaker cases
Duplicate cases
Non-action cases
Ambiguous statement cases
Multiple-action cases
```

The exact number of samples should be determined based on available time and desired coverage rather than an arbitrary target.

---

# 81. Recommended Initial Dataset Structure

Example:

```text
data/
└── evaluation/
    ├── datasets/
    │   └── action-extraction-v1.json
    │
    ├── ground-truth/
    │   └── action-extraction-v1.json
    │
    └── regression/
        └── regression-v1.json
```

Actual storage location may change depending on implementation.

---

# 82. Evaluation Test Cases

Each test case should have:

```text
ID
Category
Difficulty
Transcript
Ground Truth
Expected Review State
Notes
```

---

# 83. Example Evaluation Case

```json
{
  "id": "case-001",
  "category": "explicit_assignment",
  "difficulty": "easy",
  "transcript": "Rahul, please update the API documentation by Friday.",
  "ground_truth": {
    "actions": [
      {
        "task": "Update the API documentation",
        "owner": "Rahul",
        "deadline": "Friday"
      }
    ]
  }
}
```

---

# 84. Example Ambiguous Case

```json
{
  "id": "case-002",
  "category": "missing_owner",
  "difficulty": "medium",
  "transcript": "The API documentation needs to be updated before release.",
  "ground_truth": {
    "actions": [
      {
        "task": "Update the API documentation",
        "owner": null,
        "deadline": null
      }
    ],
    "requires_review": true
  }
}
```

---

# 85. Evaluation Pipeline Implementation

Recommended service structure:

```text
evaluation/
├── dataset_service
├── runner
├── matcher
├── metrics
├── failure_analyzer
└── comparator
```

---

# 86. Matcher Responsibilities

The matcher compares:

```text
Ground Truth
vs
Prediction
```

It should determine:

```text
Matched Action
Unmatched Expected Action
Unmatched Predicted Action
```

---

# 87. Normalization Layer

Before comparison:

```text
Normalize text
Normalize whitespace
Normalize dates
Normalize status
Normalize owner representation
```

Normalization must not change the semantic meaning of the data.

---

# 88. Metric Engine

The metric engine receives comparison results and calculates:

```text
Precision
Recall
F1
Accuracy
Field-level metrics
Review metrics
Evidence metrics
```

---

# 89. Failure Analyzer

The failure analyzer converts comparison differences into meaningful failure categories.

Example:

```text
Expected owner = Rahul
Predicted owner = Amit

→ WRONG_OWNER
```

---

# 90. Run Comparator

The run comparator should compare two completed runs.

Output:

```text
Metric
Previous
Current
Difference
```

It should also identify:

```text
New failures
Resolved failures
Persistent failures
```

---

# 91. Evaluation Quality Gate

Before accepting a new model/prompt configuration:

```text
Run Evaluation
 ↓
Inspect Metrics
 ↓
Inspect Critical Failures
 ↓
Inspect Regression Dataset
 ↓
Review Differences
 ↓
Accept / Investigate
```

The system should not automatically declare a configuration superior without predefined evaluation criteria.

---

# 92. Production vs Evaluation

Production extraction and evaluation extraction should share the same core extraction pipeline where possible.

Avoid maintaining two completely different implementations.

---

# 93. Evaluation Environment

Evaluation should be runnable locally and in CI where practical.

Example conceptual command:

```text
uv run pytest
```

or a dedicated evaluation command defined by the implementation.

---

# 94. CI Evaluation

The CI pipeline should run lightweight regression tests for important AI logic.

Full LLM evaluation may be run separately when API cost, latency, or provider availability makes it unsuitable for every commit.

---

# 95. Cost Control

Evaluation should avoid unnecessary AI spending.

Use:

```text
Small regression set
Cached results where appropriate
Manual full evaluation runs
Deterministic tests for non-AI logic
```

---

# 96. Deterministic Testing

Do not use an LLM for tests that can be verified deterministically.

Examples:

```text
Date parsing
Schema validation
Status validation
Export formatting
Metric calculation
Duplicate matching logic
```

---

# 97. AI Testing Boundary

Use real model calls for:

```text
Extraction quality
Prompt behavior
Model behavior
Structured output behavior
```

Use mocked model responses for:

```text
API tests
Database tests
Error handling
Service logic
```

---

# 98. Evaluation Documentation

Every major evaluation change should document:

```text
What changed
Why it changed
Dataset used
Metrics affected
Failures affected
```

---

# 99. Evaluation Report

A completed evaluation run should be exportable or viewable as a structured report containing:

```text
Run Metadata
Dataset
Model
Prompt
Metrics
Failure Summary
Category Breakdown
Sample Results
```

---

# 100. Evaluation Acceptance Criteria

The evaluation system is considered functional when:

```text
[ ] Dataset can be created
[ ] Ground truth can be stored
[ ] Evaluation run can be started
[ ] AI extraction can be executed
[ ] Predictions can be compared
[ ] Precision is calculated
[ ] Recall is calculated
[ ] F1 is calculated
[ ] Field-level metrics are calculated
[ ] Failures are categorized
[ ] Results are persisted
[ ] Runs can be inspected
[ ] Historical runs remain available
[ ] Prompt/model metadata is recorded
[ ] Regression dataset exists
[ ] Regression comparisons work
```

---

# 101. MVP Evaluation Acceptance

Before calling the AI extraction MVP complete:

```text
[ ] Representative dataset exists
[ ] Ground truth is manually verified
[ ] Action detection is evaluated
[ ] Task extraction is evaluated
[ ] Owner extraction is evaluated
[ ] Deadline extraction is evaluated
[ ] Status extraction is evaluated
[ ] Evidence is evaluated
[ ] Non-actions are evaluated
[ ] Ambiguous cases are evaluated
[ ] Review triggers are evaluated
[ ] Failure categories are implemented
[ ] Regression cases exist
```

---

# 102. Evaluation Milestones

## Milestone 1 — Dataset

```text
Evaluation dataset created
Ground truth verified
```

## Milestone 2 — Runner

```text
Evaluation run executes successfully
```

## Milestone 3 — Metrics

```text
Core metrics calculated
```

## Milestone 4 — Failure Analysis

```text
Failures classified
```

## Milestone 5 — Regression

```text
Regression dataset operational
```

## Milestone 6 — Evaluation UI

```text
Results visible in application
```

---

# 103. Evaluation Development Order

Implement in this order:

```text
1. Dataset schema
2. Ground truth schema
3. Dataset storage
4. Evaluation runner
5. Prediction normalization
6. Action matcher
7. Field matchers
8. Metrics
9. Failure analyzer
10. Run persistence
11. Regression comparison
12. Evaluation API
13. Evaluation UI
14. Visualization
15. CI integration
```

---

# 104. Evaluation Risk Management

Potential risks:

```text
Small dataset
Poor annotations
Inconsistent ground truth
Unstable model output
Provider changes
Overly simplistic matching
Misleading metrics
Excessive evaluation cost
```

Mitigations:

```text
Increase dataset diversity
Review annotations
Version datasets
Record model/prompt versions
Use deterministic normalization
Document metric definitions
Separate model tests from deterministic tests
```

---

# 105. What Evaluation Must Not Do

The evaluation system must not:

```text
[ ] Treat LLM confidence as ground truth
[ ] Reward hallucinated information
[ ] Hide failures
[ ] Delete difficult samples
[ ] Change ground truth to match predictions
[ ] Compare models using different datasets
[ ] Compare runs using different metric definitions without disclosure
[ ] Claim reliability from a tiny dataset
```

---

# 106. Evaluation and Product Improvement Loop

Evaluation should feed directly back into development:

```text
Evaluation
    ↓
Failure Analysis
    ↓
Identify Root Cause
    ↓
Prompt / Logic / Validation Change
    ↓
Regression Test
    ↓
New Evaluation
    ↓
Document Result
```

---

# 107. Root Cause Categories

When a failure occurs, determine whether the root cause is:

```text
Prompt Problem
Model Problem
Preprocessing Problem
Schema Problem
Validation Problem
Matching Problem
Date Parsing Problem
Owner Resolution Problem
Evidence Mapping Problem
```

Do not automatically assume that every failure is an LLM failure.

---

# 108. AI Engineering Value

The evaluation system demonstrates that MeetExtract AI is more than:

```text
Transcript → LLM → UI
```

Instead:

```text
Transcript
 ↓
AI
 ↓
Structured Output
 ↓
Validation
 ↓
Confidence
 ↓
Evidence
 ↓
Human Review
 ↓
Evaluation
 ↓
Regression
 ↓
Continuous Improvement
```

This is a core engineering characteristic of the project.

---

# 109. Final Evaluation Principle

The objective is not to produce a single impressive number.

The objective is to understand:

```text
What the system does well
What the system gets wrong
Where uncertainty occurs
Why failures happen
Whether changes improve reliability
```

---

# 110. Document Status

**Document:** `docs/06-evaluation.md`

**Version:** 1.0

**Status:** Draft

**Depends On:**

```text
docs/01-prd.md
docs/02-srs.md
docs/03-system-architecture.md
docs/04-ui-ux.md
docs/05-development-plan.md
```
