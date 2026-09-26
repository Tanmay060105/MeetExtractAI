# MeetExtract AI — Software Requirements Specification

**Document:** `docs/02-srs.md`  
**Version:** 1.0  
**Status:** Draft  
**Product:** MeetExtract AI  
**Related Document:** `docs/01-prd.md`

---

# 1. Introduction

## 1.1 Purpose

This Software Requirements Specification defines the functional, technical, data, API, AI, validation, security, performance, testing, and operational requirements for MeetExtract AI.

The SRS converts the product requirements defined in the PRD into implementation-ready specifications.

The system's primary purpose is to transform meeting transcripts into structured, validated, explainable, and reviewable action items.

---

# 2. Product Scope

MeetExtract AI consists of:

```text
Web Application
      ↓
Backend API
      ↓
Meeting Processing Pipeline
      ↓
Transcript Processing
      ↓
AI Extraction
      ↓
Structured Validation
      ↓
Business Validation
      ↓
Persistence
      ↓
Review / Analytics / Evaluation
```

The initial implementation is intended for internship-scale workloads rather than large enterprise deployment.

---

# 3. System Actors

## 3.1 User

The primary application user.

Capabilities:

* Upload transcripts
* Create meetings
* View meetings
* View action items
* Review AI results
* Edit action items
* Approve results
* Reject results
* Export data
* View analytics
* Run evaluations

---

## 3.2 AI Extraction Service

Responsible for:

* Understanding transcript content
* Identifying action items
* Extracting task information
* Extracting owners
* Extracting deadlines
* Determining status
* Producing evidence
* Producing extraction confidence

---

## 3.3 Validation Engine

Responsible for:

* Schema validation
* Date validation
* Owner validation
* Duplicate detection
* Confidence validation
* Review classification

---

## 3.4 Database

Responsible for persistent storage of:

* Users
* Meetings
* Transcripts
* Participants
* Action items
* Reviews
* Evaluation datasets
* Evaluation runs
* Evaluation results

---

## 3.5 AI Provider

External model provider responsible for generating structured AI output.

The provider must be accessed through an internal abstraction layer.

---

# 4. Functional Requirements

---

# FR-001 — Application Access

The system shall provide a web interface through which users can interact with MeetExtract AI.

The interface shall provide navigation to:

* Dashboard
* Meetings
* Action Items
* Review Queue
* Insights
* Evaluation
* Settings

---

# FR-002 — Meeting Creation

The system shall allow a user to create a meeting.

A meeting should contain at minimum:

```text
id
title
meeting_date
created_at
updated_at
```

Optional metadata:

```text
description
participants
source_filename
```

---

# FR-003 — Transcript Input

The system shall accept transcript content through:

* Direct text input
* TXT upload
* PDF upload
* DOCX upload

---

# FR-004 — File Validation

Uploaded files shall be validated before processing.

Validation shall include:

* File extension
* MIME type where available
* File size
* Empty file detection
* Text extraction capability

Unsupported files shall be rejected with a user-readable error.

---

# FR-005 — Text Extraction

The system shall extract readable text from supported files.

The extraction layer shall:

* Preserve readable content
* Preserve speaker information where available
* Preserve timestamps where available
* Normalize unnecessary formatting
* Detect empty extracted text

---

# FR-006 — Transcript Normalization

The system shall normalize transcript content before sending it to the AI extraction layer.

Normalization may include:

* Removing repeated whitespace
* Normalizing line breaks
* Preserving speaker boundaries
* Preserving timestamps
* Removing irrelevant formatting artifacts

The system must not intentionally remove information required for action-item extraction.

---

# FR-007 — Transcript Storage

The original or normalized transcript shall be associated with the meeting.

The system should preserve sufficient source information to support explainability.

---

# FR-008 — AI Processing

The system shall process a transcript through the AI extraction pipeline.

Processing shall follow:

```text
Transcript
    ↓
Preprocessing
    ↓
Prompt Construction
    ↓
LLM
    ↓
Structured Output
    ↓
Schema Validation
    ↓
Business Validation
```

---

# FR-009 — Action-Item Extraction

The AI system shall identify actionable commitments contained in the transcript.

The extraction system shall distinguish between:

```text
Actionable statement
Non-actionable statement
Ambiguous statement
```

---

# FR-010 — Task Extraction

Each identified action item shall contain a task description.

The task should represent the actual work that needs to be performed.

The task should not unnecessarily reproduce the entire transcript sentence.

---

# FR-011 — Owner Extraction

The system shall attempt to identify the person responsible for each action.

Possible outcomes:

```text
Known owner
Unknown owner
Ambiguous owner
Unassigned
```

---

# FR-012 — Deadline Extraction

The system shall attempt to identify deadlines.

Supported forms may include:

```text
October 5
5 October
Friday
next Friday
tomorrow
by end of month
next week
```

---

# FR-013 — Relative Date Resolution

Relative deadlines shall be interpreted using the meeting date where sufficient information is available.

Example:

```text
Meeting Date:
September 20, 2026

Transcript:
"I'll finish this by Friday."
```

The system should resolve the relative deadline to the relevant calendar date when possible.

If the date cannot be resolved reliably, the item should be flagged for review.

---

# FR-014 — Status Extraction

The system shall assign an action-item status.

Supported initial statuses:

```text
Pending
In Progress
Completed
Blocked
Needs Review
```

---

# FR-015 — Confidence

Every extracted action item shall contain confidence information.

The confidence value shall be represented numerically internally.

Recommended range:

```text
0.0 - 1.0
```

The frontend may display it as:

```text
0% - 100%
```

---

# FR-016 — Evidence Extraction

The system shall preserve supporting transcript evidence for extracted action items where possible.

Evidence should identify the text that caused the model to extract the action.

---

# FR-017 — Source Location

Where transcript metadata permits, the system should preserve:

```text
speaker
timestamp
line / segment
text span
```

This information shall be used by the UI to help users verify AI output.

---

# FR-018 — Structured AI Output

The AI extraction service shall return structured data.

Conceptual schema:

```json
{
  "action_items": [
    {
      "task": "string",
      "owner": "string | null",
      "deadline": "string | null",
      "status": "pending | in_progress | completed | blocked",
      "confidence": 0.0,
      "evidence": "string",
      "source_location": {}
    }
  ]
}
```

The final Pydantic schema will be defined during implementation.

---

# FR-019 — AI Output Validation

AI output shall be validated before persistence.

Validation shall verify:

* Required fields
* Data types
* Enum values
* Confidence range
* String limits
* Nested object structure

Invalid output shall not be directly persisted.

---

# FR-020 — AI Failure Handling

The system shall handle:

* Provider unavailable
* Timeout
* Rate limit
* Invalid response
* Malformed structured output
* Empty response
* Authentication failure

The user shall receive a meaningful error state.

---

# FR-021 — Date Validation

The validation engine shall inspect extracted deadlines.

Possible validation states:

```text
Valid
Invalid
Ambiguous
Missing
Relative
Overdue
Needs Review
```

---

# FR-022 — Missing Owner Detection

The system shall identify action items where a responsible owner could not be reliably determined.

Example:

```text
Task:
Update dashboard

Owner:
Unknown

Review:
Required
```

---

# FR-023 — Duplicate Detection

The system shall identify potentially duplicate action items.

Duplicate detection should compare semantic similarity rather than only exact string equality.

Potential duplicate results should be flagged for review.

The system shall not automatically delete duplicate candidates.

---

# FR-024 — Review Classification

Each action item shall receive a review classification.

Possible values:

```text
Ready
Needs Review
Reviewed
Rejected
```

---

# FR-025 — Review Queue

The system shall provide a dedicated review queue.

The queue shall contain items requiring human attention.

---

# FR-026 — Review Item Detail

The review interface shall display:

```text
Task
Owner
Deadline
Status
Confidence
Evidence
Validation Results
Source Location
```

---

# FR-027 — Edit Action Item

Users shall be able to edit:

* Task
* Owner
* Deadline
* Status

---

# FR-028 — Approve Action Item

A user shall be able to approve an extracted action item.

Approval shall change the item's review state.

---

# FR-029 — Reject Action Item

A user shall be able to reject an extracted action item.

Rejected items should remain available for audit/evaluation where appropriate.

---

# FR-030 — Review Audit Information

The system should retain:

```text
reviewed_by
reviewed_at
previous_values
updated_values
review_action
```

where appropriate.

---

# FR-031 — Meeting List

The system shall provide a list of meetings.

Each meeting row/card should display:

* Meeting title
* Meeting date
* Action-item count
* Review count
* Processing state

---

# FR-032 — Meeting Detail

The meeting detail page shall contain:

```text
Overview
Transcript
Action Items
Review Items
Insights
```

---

# FR-033 — Meeting Overview

The overview shall display:

* Meeting title
* Date
* Participants
* Processing state
* Action-item count
* Completed count
* Pending count
* Review count
* Average confidence

---

# FR-034 — Transcript Viewer

The system shall allow the user to inspect the transcript.

Where source locations are available, the interface should allow an action item to reference its transcript evidence.

---

# FR-035 — Action Item List

The system shall provide a centralized action-item page.

The page shall support:

* Search
* Filtering
* Sorting
* Status display
* Owner display
* Deadline display
* Confidence display

---

# FR-036 — Action Item Search

Users shall be able to search by:

* Task
* Owner
* Meeting

---

# FR-037 — Action Item Filtering

The system shall support filtering by:

```text
Status
Owner
Meeting
Review state
Confidence
Deadline
```

---

# FR-038 — Action Item Sorting

The system shall support sorting by:

```text
Deadline
Confidence
Created date
Updated date
Status
```

---

# FR-039 — Dashboard Metrics

The dashboard shall display:

```text
Total Meetings
Total Action Items
Completed
Pending
Needs Review
Average Confidence
```

---

# FR-040 — Recent Meetings

The dashboard shall display recently processed meetings.

---

# FR-041 — Recent Action Items

The dashboard shall display recently extracted or updated action items.

---

# FR-042 — Review Alerts

The dashboard shall clearly communicate the number of action items requiring review.

---

# FR-043 — Insights

The system shall provide meeting/action-item insights.

Possible metrics:

```text
Assigned Actions
Unassigned Actions
Completion Rate
Review Rate
Average Confidence
Deadline Distribution
Actions by Owner
```

---

# FR-044 — Analytics

The system shall provide aggregated analytics across available meetings.

---

# FR-045 — Evaluation Dataset

The system shall support evaluation datasets containing:

```text
Transcript
Ground Truth
Expected Action Items
Expected Owners
Expected Deadlines
Expected Statuses
```

---

# FR-046 — Evaluation Run

A user shall be able to execute an evaluation run against a dataset.

---

# FR-047 — Evaluation Comparison

The system shall compare:

```text
Predicted Output
vs
Ground Truth
```

---

# FR-048 — Evaluation Metrics

The evaluation system shall calculate appropriate metrics.

Potential metrics:

```text
Precision
Recall
F1
Field Accuracy
Exact Match
Partial Match
```

---

# FR-049 — Failure Analysis

The system shall categorize extraction failures.

Examples:

```text
Missing Owner
Incorrect Deadline
Wrong Task
False Action
Duplicate Action
Incorrect Status
```

---

# FR-050 — Evaluation History

The system should retain evaluation runs.

Each run should contain:

```text
dataset
timestamp
model/prompt version
metrics
failure counts
```

---

# FR-051 — Export

Users shall be able to export finalized action items.

Required formats:

```text
CSV
JSON
```

---

# FR-052 — Export Filtering

Exports should respect currently selected filters where appropriate.

---

# FR-053 — Loading States

The frontend shall provide loading states for:

* Upload
* Processing
* Extraction
* Validation
* Evaluation
* Export

---

# FR-054 — Empty States

The frontend shall provide meaningful empty states.

Example:

```text
No meetings yet.

Upload your first transcript to begin.
```

---

# FR-055 — Error States

The frontend shall display user-readable error messages.

Technical stack traces shall not be shown to normal users.

---

# FR-056 — Success States

The frontend shall communicate successful operations.

Example:

```text
Meeting processed successfully.

12 action items extracted.
```

---

# FR-057 — Responsive Interface

The application shall support:

* Desktop
* Laptop
* Tablet

Desktop is the primary target.

---

# FR-058 — Accessibility

The frontend should provide:

* Keyboard navigation
* Focus states
* Semantic controls
* Accessible labels
* Sufficient contrast
* Status indicators that do not rely exclusively on color

---

# FR-059 — Settings

The application shall provide a settings area.

Initial settings may include:

* Profile information
* AI configuration status
* Application preferences

---

# 5. Non-Functional Requirements

---

# NFR-001 — Performance

Normal application interactions should feel responsive.

The frontend shall provide immediate feedback when long-running operations begin.

---

# NFR-002 — Processing Feedback

Long-running transcript processing shall expose a visible processing state.

Example:

```text
Uploading
Processing
Extracting
Validating
Completed
```

---

# NFR-003 — Reliability

A failure in AI processing shall not corrupt previously stored meeting data.

---

# NFR-004 — Maintainability

The system shall use modular components.

Responsibilities shall be separated between:

```text
API
Business Logic
AI
Validation
Persistence
Frontend
```

---

# NFR-005 — Testability

Core business logic shall be testable without requiring a live external AI provider.

AI providers should be mockable.

---

# NFR-006 — Configuration

Configuration shall be provided through environment variables.

Secrets shall never be hard-coded.

---

# NFR-007 — Security

The application shall:

* Protect API credentials
* Validate uploaded files
* Validate user input
* Validate AI output
* Avoid unnecessary sensitive logging
* Keep secrets outside source control

---

# NFR-008 — Error Isolation

Failures in one processing stage should be represented explicitly rather than causing silent data corruption.

---

# NFR-009 — Observability

The backend shall provide structured application logs for important processing events.

---

# NFR-010 — Documentation

The repository shall document:

* Setup
* Architecture
* Environment variables
* API
* Development process
* Testing
* Evaluation

---

# 6. AI System Requirements

---

# AI-001 — Model Abstraction

The application shall communicate with AI models through an abstraction layer.

Conceptually:

```text
ExtractionService
       ↓
ModelProvider
       ↓
ProviderImplementation
```

This prevents the business logic from being tightly coupled to a specific model provider.

---

# AI-002 — Prompt Versioning

Extraction prompts should be versioned.

Example:

```text
prompt_version = "v1"
```

The evaluation system should record the prompt version used for each run.

---

# AI-003 — Structured Generation

The extraction model should be instructed to produce structured output.

The application shall validate that output independently.

---

# AI-004 — Deterministic Configuration

Where supported, generation parameters should be configured to improve reproducibility.

---

# AI-005 — Context Preservation

The extraction pipeline should preserve sufficient transcript context to correctly interpret:

* Pronouns
* Speaker references
* Relative dates
* Follow-up commitments
* Conversational context

---

# AI-006 — Evidence Requirement

Whenever possible, the model should return evidence supporting each extracted action item.

---

# AI-007 — Hallucination Protection

The system shall avoid persisting unsupported information as confirmed facts.

If the model cannot reliably determine a field, the value should be:

```text
null
```

or flagged for review.

---

# AI-008 — Non-Action Filtering

The model should avoid converting ordinary statements into action items.

Example:

```text
"The marketing campaign performed well."

```

should not automatically become an action item.

---

# AI-009 — Ambiguity Handling

Ambiguous statements should be flagged rather than silently converted into high-confidence actions.

---

# 7. Validation Requirements

---

# VAL-001 — Schema Validation

All AI output must pass schema validation.

---

# VAL-002 — Confidence Validation

Confidence must remain within:

```text
0.0 <= confidence <= 1.0
```

---

# VAL-003 — Status Validation

Status must belong to the supported status vocabulary.

---

# VAL-004 — Date Validation

Dates shall be checked for:

* Parseability
* Ambiguity
* Meeting-date consistency
* Relative-date resolution

---

# VAL-005 — Owner Validation

Owners shall be checked against available participant information where possible.

---

# VAL-006 — Duplicate Detection

Action items should be compared using semantic similarity.

Potential duplicates shall be marked rather than silently removed.

---

# VAL-007 — Review Trigger

The validation engine shall determine whether an action item requires review.

---

# 8. Data Requirements

---

# 8.1 User Entity

Conceptual fields:

```text
id
name
email
created_at
updated_at
```

---

# 8.2 Meeting Entity

Conceptual fields:

```text
id
user_id
title
meeting_date
source_type
processing_status
created_at
updated_at
```

---

# 8.3 Transcript Entity

Conceptual fields:

```text
id
meeting_id
raw_text
normalized_text
source_filename
created_at
```

---

# 8.4 Participant Entity

Conceptual fields:

```text
id
meeting_id
name
email
created_at
```

---

# 8.5 ActionItem Entity

Conceptual fields:

```text
id
meeting_id
task
owner_id
owner_name
deadline
status
confidence
evidence
source_location
validation_status
review_status
created_at
updated_at
```

---

# 8.6 Review Entity

Conceptual fields:

```text
id
action_item_id
reviewer_id
decision
notes
previous_value
new_value
created_at
```

---

# 8.7 EvaluationDataset Entity

Conceptual fields:

```text
id
name
description
version
created_at
```

---

# 8.8 EvaluationRun Entity

Conceptual fields:

```text
id
dataset_id
model_version
prompt_version
status
started_at
completed_at
```

---

# 8.9 EvaluationResult Entity

Conceptual fields:

```text
id
evaluation_run_id
sample_id
predicted_output
ground_truth
metrics
failure_type
created_at
```

---

# 9. Processing State Model

Meetings shall have explicit processing states.

Recommended states:

```text
created
uploaded
processing
extracting
validating
completed
failed
```

---

# 10. Action Item State Model

Recommended states:

```text
pending
in_progress
completed
blocked
needs_review
```

---

# 11. Review State Model

Recommended states:

```text
ready
needs_review
reviewing
approved
edited_approved
rejected
```

---

# 12. API Requirements

The backend shall expose a REST-style API.

Base path:

```text
/api/v1
```

---

# 12.1 Meeting Endpoints

```text
POST   /api/v1/meetings
GET    /api/v1/meetings
GET    /api/v1/meetings/{meeting_id}
DELETE /api/v1/meetings/{meeting_id}
```

---

# 12.2 Transcript Endpoints

```text
POST /api/v1/meetings/{meeting_id}/transcript
GET  /api/v1/meetings/{meeting_id}/transcript
```

---

# 12.3 Processing Endpoint

```text
POST /api/v1/meetings/{meeting_id}/process
```

---

# 12.4 Action Item Endpoints

```text
GET   /api/v1/action-items
GET   /api/v1/action-items/{action_item_id}
PATCH /api/v1/action-items/{action_item_id}
```

---

# 12.5 Review Endpoints

```text
GET  /api/v1/reviews
POST /api/v1/action-items/{action_item_id}/approve
POST /api/v1/action-items/{action_item_id}/reject
```

---

# 12.6 Analytics Endpoints

```text
GET /api/v1/analytics/overview
GET /api/v1/analytics/actions
```

---

# 12.7 Evaluation Endpoints

```text
GET  /api/v1/evaluations/datasets
POST /api/v1/evaluations/datasets
POST /api/v1/evaluations/runs
GET  /api/v1/evaluations/runs
GET  /api/v1/evaluations/runs/{run_id}
```

---

# 12.8 Export Endpoints

```text
POST /api/v1/export/action-items
```

---

# 13. API Response Standards

Successful responses should use predictable structures.

Example:

```json
{
  "data": {},
  "error": null
}
```

Error response:

```json
{
  "data": null,
  "error": {
    "code": "INVALID_FILE",
    "message": "The uploaded file type is not supported."
  }
}
```

---

# 14. HTTP Status Requirements

The API should use standard HTTP status codes.

Examples:

```text
200 OK
201 Created
204 No Content
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Unprocessable Entity
429 Too Many Requests
500 Internal Server Error
```

---

# 15. Frontend Requirements

The frontend shall use:

```text
Next.js
TypeScript
Tailwind CSS
```

The frontend shall communicate with the backend through the defined API.

---

# 15.1 Frontend Pages

Required pages:

```text
/dashboard
/meetings
/meetings/new
/meetings/[id]
/action-items
/reviews
/insights
/evaluation
/settings
```

---

# 15.2 Dashboard Components

The dashboard should contain:

```text
Header
Metric Cards
Recent Meetings
Action Item Summary
Review Queue
Activity / Insights
```

---

# 15.3 Meeting Components

Meeting detail should contain:

```text
Meeting Header
Processing Status
Summary
Transcript Viewer
Action Items
Review Items
Insights
```

---

# 15.4 Action Item Components

Each action item should display:

```text
Task
Owner
Deadline
Status
Confidence
Review State
```

Expandable detail should show:

```text
Evidence
Source Location
Validation Results
```

---

# 15.5 Review Components

The review interface should emphasize:

```text
AI Result
Evidence
Validation
Editable Fields
Decision Controls
```

---

# 16. UI State Requirements

Every API-backed component must support:

```text
Loading
Success
Empty
Error
Retry
```

---

# 17. File Processing Requirements

Supported extensions:

```text
.txt
.pdf
.docx
```

The backend shall validate files before parsing.

---

# 17.1 File Size

A configurable maximum file size shall be enforced.

The exact limit shall be defined through application configuration.

---

# 17.2 File Security

Uploaded files shall:

* Be validated
* Not be executed
* Not be trusted based solely on extension
* Be processed through safe parsing libraries

---

# 18. AI Processing Pipeline

The complete processing pipeline shall be:

```text
1. Receive Transcript
        ↓
2. Validate Input
        ↓
3. Normalize Text
        ↓
4. Identify Meeting Context
        ↓
5. Construct AI Prompt
        ↓
6. Call Model
        ↓
7. Parse Structured Output
        ↓
8. Schema Validation
        ↓
9. Date Validation
        ↓
10. Owner Validation
        ↓
11. Duplicate Detection
        ↓
12. Confidence Classification
        ↓
13. Review Classification
        ↓
14. Persist Results
        ↓
15. Return Results
```

---

# 19. Error Handling Strategy

The application shall distinguish between:

```text
User Error
System Error
AI Error
Validation Error
External Provider Error
Database Error
```

---

# 19.1 User Errors

Examples:

```text
Invalid file
Empty transcript
Missing required field
Invalid input
```

---

# 19.2 AI Errors

Examples:

```text
Provider timeout
Invalid response
Rate limit
Malformed JSON
Model unavailable
```

---

# 19.3 Validation Errors

Examples:

```text
Invalid date
Missing owner
Invalid status
Duplicate candidate
```

---

# 20. Logging Requirements

Logs should include structured metadata such as:

```text
event
timestamp
request_id
meeting_id
action_item_id
processing_stage
status
error_code
```

Transcript content should not be logged unnecessarily.

---

# 21. Request Correlation

Requests should support a correlation/request ID.

This allows processing failures to be traced across application logs.

---

# 22. Security Requirements

---

# SEC-001

Secrets shall never be committed to Git.

---

# SEC-002

AI provider credentials shall be loaded through environment configuration.

---

# SEC-003

Database credentials shall be loaded through environment configuration.

---

# SEC-004

Uploaded files shall be validated before processing.

---

# SEC-005

User-provided text shall be validated and safely handled.

---

# SEC-006

The application shall avoid exposing internal stack traces through API responses.

---

# SEC-007

Sensitive transcript content shall not be unnecessarily exposed through logs.

---

# 23. Testing Requirements

---

# TEST-001 — Unit Testing

Unit tests shall cover:

* Date parser
* Date validation
* Duplicate detector
* Owner validation
* Confidence classification
* Schema validation
* Text normalization
* AI response parser

---

# TEST-002 — API Testing

API tests shall cover:

* Meeting creation
* Transcript upload
* Processing
* Action retrieval
* Editing
* Approval
* Rejection
* Export
* Evaluation

---

# TEST-003 — Integration Testing

The system shall test the complete workflow:

```text
Input
 ↓
Processing
 ↓
AI
 ↓
Validation
 ↓
Database
 ↓
API
```

---

# TEST-004 — AI Mocking

AI provider calls shall be mockable during automated tests.

Automated tests should not require live AI API access.

---

# TEST-005 — Regression Tests

Known AI extraction failures should become regression test cases.

---

# 24. Evaluation Requirements

The project shall maintain a representative evaluation dataset.

The dataset should contain different levels of complexity.

---

# 24.1 Evaluation Categories

```text
Direct assignment
Implicit assignment
Relative deadline
Missing owner
Ambiguous owner
Duplicate action
Multiple actions
No action
Completed action
Blocked action
```

---

# 24.2 Field-Level Evaluation

The system should separately evaluate:

```text
Task
Owner
Deadline
Status
```

This allows failure analysis to identify which field causes problems.

---

# 24.3 Evaluation Output

Each evaluation run should provide:

```text
Total Samples
Correct Actions
Incorrect Actions
Precision
Recall
F1
Field Accuracy
Failure Categories
```

---

# 25. Acceptance Criteria

---

# AC-001

A user can upload a valid transcript.

---

# AC-002

The system extracts transcript text successfully.

---

# AC-003

The system identifies action items from supported transcripts.

---

# AC-004

Each action item contains:

```text
Task
Owner
Deadline
Status
Confidence
Evidence
```

where available.

---

# AC-005

The system detects missing owners.

---

# AC-006

The system validates deadlines.

---

# AC-007

The system identifies potential duplicate tasks.

---

# AC-008

The system flags uncertain items for review.

---

# AC-009

A user can edit a flagged action item.

---

# AC-010

A user can approve an action item.

---

# AC-011

A user can reject an action item.

---

# AC-012

The meeting detail page displays extracted action items.

---

# AC-013

The dashboard displays aggregate metrics.

---

# AC-014

Users can search and filter action items.

---

# AC-015

Users can export finalized action items.

---

# AC-016

The evaluation system can compare predictions against ground truth.

---

# AC-017

The system produces measurable evaluation metrics.

---

# AC-018

The project contains automated tests for important business logic.

---

# AC-019

The project can be configured without hard-coded secrets.

---

# AC-020

The application presents a professional and consistent UI.

---

# 26. Project Structure Requirements

The expected high-level repository structure is:

```text
meetextract-ai/
│
├── frontend/
│
├── backend/
│
├── docs/
│
├── tests/
│
├── scripts/
│
├── .env.example
├── .gitignore
├── AGENTS.md
├── PROJECT_STATE.md
├── README.md
├── docker-compose.yml
└── LICENSE
```

The exact structure may be refined during architecture design.

---

# 27. Backend Structure

Recommended structure:

```text
backend/
│
├── app/
│   ├── api/
│   ├── core/
│   ├── models/
│   ├── schemas/
│   ├── services/
│   │   ├── ai/
│   │   ├── extraction/
│   │   ├── validation/
│   │   ├── evaluation/
│   │   └── export/
│   ├── repositories/
│   ├── db/
│   └── main.py
│
├── tests/
│
├── alembic/
│
├── pyproject.toml
└── Dockerfile
```

---

# 28. Frontend Structure

Recommended structure:

```text
frontend/
│
├── app/
│   ├── dashboard/
│   ├── meetings/
│   ├── action-items/
│   ├── reviews/
│   ├── insights/
│   ├── evaluation/
│   └── settings/
│
├── components/
│   ├── ui/
│   ├── dashboard/
│   ├── meetings/
│   ├── action-items/
│   ├── reviews/
│   └── evaluation/
│
├── lib/
│   ├── api/
│   ├── types/
│   └── utils/
│
└── package.json
```

---

# 29. Environment Configuration

The application should use environment variables for:

```text
DATABASE_URL
AI_API_KEY
AI_MODEL
API_BASE_URL
FRONTEND_URL
```

Additional variables may be added during implementation.

---

# 30. Database Requirements

The database shall use:

```text
PostgreSQL
```

ORM:

```text
SQLAlchemy
```

Migration system:

```text
Alembic
```

---

# 31. Database Integrity

The database should enforce:

* Primary keys
* Foreign keys
* Required fields
* Unique constraints where appropriate
* Indexes for common queries
* Timestamp fields

---

# 32. Transaction Requirements

Database writes involving multiple related records should use appropriate transactions.

Example:

```text
Meeting
+
Transcript
+
Action Items
```

should not leave the database in an inconsistent state if processing fails.

---

# 33. AI Provider Abstraction

The project shall define an internal interface similar to:

```text
AIProvider
├── extract_action_items()
├── summarize()
└── evaluate()
```

Only required methods should be implemented initially.

---

# 34. Prompt Engineering Requirements

The extraction prompt should explicitly define:

* Role
* Task
* Input format
* Output schema
* Extraction rules
* Date interpretation rules
* Owner rules
* Evidence requirements
* Non-action filtering
* Ambiguity behavior

---

# 35. Prompt Safety

The transcript shall be treated as untrusted input.

Transcript content must not be allowed to override system-level extraction instructions.

The AI prompt should clearly distinguish:

```text
System Instructions
Meeting Transcript
Required Output
```

---

# 36. Confidence Methodology

The project shall distinguish between:

```text
Model confidence
System confidence
Validation confidence
```

The final displayed confidence should be determined by the documented confidence methodology.

A raw LLM-generated confidence value should not automatically be assumed to be statistically calibrated.

---

# 37. Explainability Requirements

Every action item should provide an explanation path:

```text
Action Item
    ↓
Evidence
    ↓
Transcript Location
    ↓
Validation Results
```

This should be accessible from the UI.

---

# 38. Human-in-the-Loop Requirements

Human review is an explicit part of the system.

The system shall allow humans to override AI-generated:

```text
Task
Owner
Deadline
Status
```

The human-approved result shall become the final application record.

---

# 39. Evaluation Feedback Loop

Human corrections should be usable as evaluation data.

Conceptually:

```text
AI Prediction
      ↓
Human Review
      ↓
Correction
      ↓
Ground Truth Candidate
      ↓
Evaluation Dataset
      ↓
Future Evaluation
```

This does not imply automatic model retraining.

---

# 40. UX Quality Requirements

The UI should communicate hierarchy clearly.

Primary actions should be visually prominent.

Secondary actions should not compete with primary workflows.

Important warnings should be visible without becoming visually overwhelming.

---

# 41. Interaction Requirements

Interactions should provide feedback.

Examples:

```text
Upload → Progress
Approve → Confirmation
Reject → Confirmation
Save → Success
Retry → Processing
```

---

# 42. Animation Requirements

Animations should be:

* Subtle
* Fast
* Functional

Animations should communicate state changes rather than exist purely for decoration.

---

# 43. Design Consistency

The application shall use a consistent:

```text
Typography System
Spacing System
Color System
Component System
Icon System
Status System
```

---

# 44. Responsive Layout

The layout shall adapt to available viewport width.

Data-heavy tables should support horizontal scrolling or responsive transformation when necessary.

---

# 45. Empty State Requirements

Each major page shall define an empty state.

Examples:

```text
No meetings
No action items
No review items
No evaluations
No search results
```

Each empty state should explain the next useful action.

---

# 46. Error Recovery

Recoverable errors should provide a retry or corrective action where appropriate.

Example:

```text
Processing failed.

[Retry Processing]
```

---

# 47. Deployment Requirements

The application should be containerizable.

Expected services:

```text
frontend
backend
database
```

Additional services should only be introduced when justified.

---

# 48. Local Development

The project should provide a reproducible local development workflow.

Expected setup:

```text
Clone repository
      ↓
Configure environment
      ↓
Start services
      ↓
Run migrations
      ↓
Start frontend/backend
      ↓
Open application
```

---

# 49. Documentation Requirements

The repository must include:

```text
README.md
docs/01-prd.md
docs/02-srs.md
docs/03-system-architecture.md
docs/04-ui-ux.md
docs/05-development-plan.md
docs/06-evaluation.md
AGENTS.md
PROJECT_STATE.md
```

---

# 50. Development Rules

The implementation shall follow these principles:

1. Do not silently change requirements.
2. Keep the PRD and SRS synchronized with major changes.
3. Validate AI output.
4. Test business logic.
5. Keep external providers abstracted.
6. Do not hard-code secrets.
7. Do not over-engineer.
8. Preserve explainability.
9. Preserve human review.
10. Refine UI progressively.
11. Keep documentation updated.
12. Verify each development phase before moving forward.

---

# 51. Definition of Done

A feature is considered complete only when:

```text
Requirement Defined
       ↓
Implementation Complete
       ↓
Unit Tests
       ↓
Integration Verification
       ↓
UI Verification
       ↓
Error States Verified
       ↓
Documentation Updated
       ↓
Project State Updated
```

---

# 52. MVP Definition of Done

The MVP is complete when a user can:

```text
Create Meeting
      ↓
Upload Transcript
      ↓
Process Transcript
      ↓
Extract Action Items
      ↓
Validate Results
      ↓
Review Uncertain Items
      ↓
Approve/Edit Results
      ↓
View Dashboard
      ↓
Search/Filter Actions
      ↓
Export Actions
      ↓
Run Evaluation
```

---

# 53. Internship Demonstration Requirements

The project demonstration should clearly show:

```text
1. Product Dashboard
2. Transcript Upload
3. AI Extraction
4. Structured Action Items
5. Confidence
6. Evidence
7. Validation
8. Duplicate Detection
9. Review Queue
10. Human Correction
11. Analytics
12. Evaluation
13. Export
```

---

# 54. Quality Gates

The project shall use quality gates before major milestones.

## Gate 1 — Foundation

```text
Repository
Configuration
Database
Basic API
Basic Frontend
```

## Gate 2 — AI Pipeline

```text
Transcript
Extraction
Structured Output
Validation
```

## Gate 3 — Product

```text
Dashboard
Meetings
Action Items
Review
Export
```

## Gate 4 — Evaluation

```text
Dataset
Evaluation
Metrics
Failure Analysis
```

## Gate 5 — Final

```text
Testing
UI/UX
Documentation
Demo
Deployment
```

---

# 55. Risk Requirements

The following risks shall be monitored.

## Risk 1 — AI Extraction Errors

Mitigation:

* Structured output
* Validation
* Evidence
* Human review
* Evaluation

---

## Risk 2 — Ambiguous Dates

Mitigation:

* Meeting-date context
* Date parser
* Validation
* Review queue

---

## Risk 3 — Missing Owners

Mitigation:

* Participant matching
* Owner validation
* Human review

---

## Risk 4 — Duplicate Actions

Mitigation:

* Semantic similarity
* Duplicate warnings
* Human confirmation

---

## Risk 5 — AI Provider Failure

Mitigation:

* Error handling
* Retry where appropriate
* Clear UI state
* Provider abstraction

---

## Risk 6 — Scope Expansion

Mitigation:

* MVP-first development
* Explicit out-of-scope list
* Feature prioritization
* Phase gates

---

# 56. Performance Targets

Initial targets:

```text
API response for normal CRUD:
< 500 ms target where practical

Frontend interaction feedback:
< 200 ms perceived response where practical

Transcript processing:
Dependent on transcript size and AI provider

AI extraction:
Provider-dependent

Evaluation:
Dependent on dataset size and model latency
```

These are engineering targets rather than strict guarantees and may be refined after benchmarking.

---

# 57. Data Retention

The initial system should retain meeting data until explicitly deleted by the user or administrator functionality defined later.

The exact retention policy is outside the internship MVP and should not introduce unnecessary infrastructure.

---

# 58. Privacy Considerations

Meeting transcripts may contain sensitive information.

The application should:

* Avoid unnecessary transcript logging
* Restrict access to stored meeting data
* Avoid exposing transcript content in error messages
* Keep AI credentials private
* Clearly document external AI provider usage where applicable

---

# 59. Future Extensibility

The architecture should allow future additions without requiring a complete rewrite.

Potential future modules:

```text
Audio Transcription
Calendar Integration
Task Management
Team Collaboration
External Integrations
Advanced AI Evaluation
```

These must remain decoupled from the MVP implementation.

---

# 60. Final Technical Workflow

The complete system workflow is:

```text
                         ┌─────────────────────┐
                         │       User          │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │      Frontend       │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │     FastAPI API     │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ Meeting Processing  │
                         └──────────┬──────────┘
                                    │
                     ┌──────────────┴──────────────┐
                     ▼                             ▼
             ┌───────────────┐             ┌───────────────┐
             │ Text Parsing  │             │  AI Provider  │
             └───────┬───────┘             └───────┬───────┘
                     │                             │
                     └──────────────┬──────────────┘
                                    ▼
                         ┌─────────────────────┐
                         │ Structured Output   │
                         └──────────┬──────────┘
                                    ▼
                         ┌─────────────────────┐
                         │ Schema Validation   │
                         └──────────┬──────────┘
                                    ▼
                         ┌─────────────────────┐
                         │ Business Validation │
                         └──────────┬──────────┘
                                    │
                     ┌──────────────┴──────────────┐
                     ▼                             ▼
              ┌──────────────┐              ┌──────────────┐
              │ Ready Result │              │ Review Queue │
              └──────┬───────┘              └──────┬───────┘
                     │                             │
                     └──────────────┬──────────────┘
                                    ▼
                         ┌─────────────────────┐
                         │     PostgreSQL      │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ Analytics / Export  │
                         └─────────────────────┘
```

---

# 61. Final SRS Requirements Summary

MeetExtract AI must provide:

```text
MEETING MANAGEMENT
        +
TRANSCRIPT INGESTION
        +
AI ACTION EXTRACTION
        +
OWNER EXTRACTION
        +
DEADLINE EXTRACTION
        +
STATUS EXTRACTION
        +
CONFIDENCE
        +
EVIDENCE
        +
SCHEMA VALIDATION
        +
DATE VALIDATION
        +
OWNER VALIDATION
        +
DUPLICATE DETECTION
        +
HUMAN REVIEW
        +
ACTION MANAGEMENT
        +
ANALYTICS
        +
EXPORT
        +
AI EVALUATION
        +
FAILURE ANALYSIS
        +
PROFESSIONAL UI/UX
```

The system should prioritize reliability, explainability, human verification, measurable AI performance, and maintainable engineering over unnecessary feature breadth.

---

# 62. SRS Status

**Version:** 1.0

**Status:** Draft for Architecture

**Primary Product:** MeetExtract AI

**Primary Technical Objective:**

Build a production-style AI meeting intelligence application that converts meeting transcripts into structured, validated, explainable, and reviewable action items.

**Next Document:**

`docs/03-system-architecture.md`

The System Architecture document will define:

* Complete architecture
* Frontend architecture
* Backend architecture
* AI pipeline architecture
* Database architecture
* Service boundaries
* Data flow
* API flow
* File-processing flow
* Evaluation architecture
* Error-handling architecture
* Deployment architecture
* Security boundaries
* Folder structure
* Technology decisions
* Architecture trade-offs

```
