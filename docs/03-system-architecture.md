# MeetExtract AI — System Architecture

**Document:** `docs/03-system-architecture.md`  
**Version:** 1.0  
**Status:** Draft  
**Product:** MeetExtract AI  
**Related Documents:**
- `docs/01-prd.md`
- `docs/02-srs.md`

---

# 1. Architecture Overview

MeetExtract AI will use a modular full-stack architecture designed around one primary workflow:

```text
INGEST
   ↓
UNDERSTAND
   ↓
EXTRACT
   ↓
VALIDATE
   ↓
REVIEW
   ↓
FINALIZE
   ↓
EXPORT
   ↓
EVALUATE
```

The initial architecture intentionally avoids:

* Microservices
* Kubernetes
* Event-driven distributed infrastructure
* Multiple databases
* Complex agent systems
* LLM fine-tuning
* Real-time audio infrastructure

The goal is to create a production-style architecture that remains understandable, testable, and maintainable.

---

# 2. Architecture Principles

The project shall follow these principles.

## 2.1 Depth Over Breadth

The system should provide a small number of high-quality capabilities rather than many shallow features.

---

## 2.2 Separation of Concerns

Each major responsibility should have a clear boundary.

```text
Frontend
    ↓
API
    ↓
Application Services
    ↓
Domain Logic
    ↓
Repositories
    ↓
Database
```

AI functionality follows a separate abstraction:

```text
Application Service
        ↓
AI Extraction Service
        ↓
AI Provider Interface
        ↓
Provider Implementation
```

---

## 2.3 Validate at Boundaries

Data must be validated when crossing important boundaries.

Examples:

```text
File → Parser
Request → API
AI Output → Validation
Service → Database
Database → API
```

---

## 2.4 AI Is Not the Source of Truth

The AI model generates candidate information.

The application determines whether that information is valid enough to persist or requires review.

```text
AI Prediction
      ↓
Application Validation
      ↓
Human Review if Required
      ↓
Final Result
```

---

## 2.5 Explainability by Design

The system must preserve enough information to answer:

> "Why did MeetExtract AI create this action item?"

The answer should be traceable to:

```text
Action Item
     ↓
Evidence
     ↓
Transcript
     ↓
Source Location
```

---

## 2.6 Human-in-the-Loop

The system should not pretend that every AI prediction is correct.

Uncertain results should enter a review workflow.

---

## 2.7 Provider Independence

The business logic must not depend directly on a specific AI vendor.

---

## 2.8 Progressive UI Refinement

UI/UX refinement happens throughout development.

A feature should receive UI refinement after its functional implementation is stable enough to evaluate.

---

# 3. High-Level Architecture

```text
┌────────────────────────────────────────────────────────────┐
│                        USER                                │
└───────────────────────────┬────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────┐
│                    NEXT.JS FRONTEND                        │
│                                                            │
│ Dashboard │ Meetings │ Actions │ Reviews │ Insights       │
│ Evaluation │ Settings                                     │
└───────────────────────────┬────────────────────────────────┘
                            │
                            │ HTTP / JSON
                            ▼
┌────────────────────────────────────────────────────────────┐
│                    FASTAPI BACKEND                         │
│                                                            │
│ API Routes                                                 │
│      ↓                                                     │
│ Application Services                                       │
│      ↓                                                     │
│ Domain / Validation                                        │
│      ↓                                                     │
│ Repositories                                               │
└───────────────┬──────────────────────────────┬─────────────┘
                │                              │
                ▼                              ▼
┌───────────────────────────┐      ┌────────────────────────┐
│       PostgreSQL          │      │      AI Provider        │
│                           │      │                         │
│ Meetings                  │      │ Structured Extraction  │
│ Transcripts               │      │                         │
│ Action Items              │      └────────────────────────┘
│ Reviews                   │
│ Evaluations               │
└───────────────────────────┘
```

---

# 4. Technology Stack

## 4.1 Frontend

```text
Next.js
TypeScript
Tailwind CSS
```

Responsibilities:

* UI
* Routing
* User interactions
* API communication
* Loading states
* Error states
* Review workflow
* Data visualization

---

# 4.2 Backend

```text
Python
FastAPI
Pydantic
SQLAlchemy
Alembic
```

Responsibilities:

* API
* Business logic
* Validation
* AI orchestration
* File processing
* Persistence
* Analytics
* Evaluation

---

# 4.3 Database

```text
PostgreSQL
```

Responsibilities:

* Persistent application data
* Meeting records
* Transcript metadata/content
* Action items
* Review records
* Evaluation data
* Processing states

---

# 4.4 AI Layer

The AI layer will use an external LLM provider through an abstraction layer.

Conceptually:

```text
AIProvider
    │
    ├── Provider A
    │
    ├── Provider B
    │
    └── Mock Provider
```

Only the provider interface is exposed to application services.

---

# 4.5 Testing

```text
pytest
```

Frontend testing tools may be introduced when frontend complexity requires them.

---

# 4.6 Infrastructure

Initial development infrastructure:

```text
Docker
Docker Compose
Git
GitHub
```

---

# 5. Architecture Style

MeetExtract AI will use a modular monolith.

This means:

```text
One Backend
One Database
One Frontend
One Deployable Application Stack
```

while maintaining strong internal module boundaries.

---

# 6. Why Modular Monolith

A modular monolith is preferred because the project is:

* Internship-scale
* Early-stage
* AI-heavy
* Data-centric
* Primarily CRUD + processing
* Easier to test as one system

Microservices would introduce unnecessary complexity in:

* Deployment
* Networking
* Authentication
* Debugging
* Local development
* Data consistency
* Observability

The architecture should remain capable of extracting modules into services later if scale requires it.

---

# 7. Repository Architecture

Expected repository:

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

---

# 8. Backend Architecture

```text
backend/
│
├── app/
│   │
│   ├── api/
│   │   ├── routes/
│   │   └── dependencies.py
│   │
│   ├── core/
│   │   ├── config.py
│   │   ├── logging.py
│   │   └── errors.py
│   │
│   ├── db/
│   │   ├── session.py
│   │   └── base.py
│   │
│   ├── models/
│   │
│   ├── schemas/
│   │
│   ├── repositories/
│   │
│   ├── services/
│   │   ├── meetings/
│   │   ├── transcripts/
│   │   ├── extraction/
│   │   ├── validation/
│   │   ├── reviews/
│   │   ├── analytics/
│   │   ├── evaluations/
│   │   └── export/
│   │
│   ├── ai/
│   │   ├── provider.py
│   │   ├── prompts/
│   │   ├── schemas.py
│   │   └── providers/
│   │
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

# 9. Frontend Architecture

```text
frontend/
│
├── app/
│   ├── dashboard/
│   ├── meetings/
│   │   ├── page.tsx
│   │   ├── new/
│   │   └── [id]/
│   │
│   ├── action-items/
│   ├── reviews/
│   ├── insights/
│   ├── evaluation/
│   └── settings/
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── dashboard/
│   ├── meetings/
│   ├── action-items/
│   ├── reviews/
│   ├── insights/
│   └── evaluation/
│
├── lib/
│   ├── api/
│   ├── types/
│   ├── utils/
│   └── constants/
│
├── public/
│
├── package.json
└── Dockerfile
```

---

# 10. Layered Backend Architecture

The backend should follow:

```text
API Layer
    ↓
Application Service Layer
    ↓
Domain / Validation Layer
    ↓
Repository Layer
    ↓
Database
```

---

# 11. API Layer

The API layer is responsible for:

* HTTP routing
* Request validation
* Authentication if introduced
* Calling application services
* Response serialization
* HTTP error mapping

The API layer should not contain complex business logic.

---

# 12. Application Service Layer

Application services orchestrate workflows.

Examples:

```text
MeetingService
TranscriptService
ExtractionService
ReviewService
EvaluationService
AnalyticsService
ExportService
```

Example workflow:

```text
process_meeting()
       ↓
load transcript
       ↓
normalize transcript
       ↓
AI extraction
       ↓
validate extraction
       ↓
persist results
```

---

# 13. Repository Layer

Repositories abstract database access.

Examples:

```text
MeetingRepository
TranscriptRepository
ActionItemRepository
ReviewRepository
EvaluationRepository
```

Application services should not contain raw SQL throughout the codebase.

---

# 14. Database Architecture

The initial database contains:

```text
users
meetings
transcripts
participants
action_items
reviews
evaluation_datasets
evaluation_samples
evaluation_runs
evaluation_results
```

---

# 15. Core Relationships

```text
User
 │
 └──────< Meeting
             │
             ├──────< Transcript
             │
             ├──────< Participant
             │
             └──────< ActionItem
                         │
                         └──────< Review
```

Evaluation:

```text
EvaluationDataset
        │
        └──────< EvaluationSample
                       │
                       └──────< EvaluationResult

EvaluationDataset
        │
        └──────< EvaluationRun
```

---

# 16. Meeting Data Model

Conceptual model:

```text
Meeting
-------------------------
id
title
description
meeting_date
source_type
processing_status
created_at
updated_at
```

---

# 17. Transcript Data Model

```text
Transcript
-------------------------
id
meeting_id
raw_text
normalized_text
source_filename
created_at
updated_at
```

---

# 18. Participant Data Model

```text
Participant
-------------------------
id
meeting_id
name
email
created_at
```

---

# 19. Action Item Data Model

```text
ActionItem
-------------------------
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

# 20. Review Data Model

```text
Review
-------------------------
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

# 21. Evaluation Data Model

```text
EvaluationDataset
-------------------------
id
name
description
version
created_at
```

```text
EvaluationSample
-------------------------
id
dataset_id
transcript
ground_truth
created_at
```

```text
EvaluationRun
-------------------------
id
dataset_id
model_version
prompt_version
status
started_at
completed_at
```

```text
EvaluationResult
-------------------------
id
run_id
sample_id

prediction
ground_truth
metrics
failure_type

created_at
```

---

# 22. Meeting Processing Architecture

Meeting processing is the central workflow.

```text
                    Meeting
                       │
                       ▼
               Validate Input
                       │
                       ▼
              Extract Transcript
                       │
                       ▼
             Normalize Transcript
                       │
                       ▼
              AI Extraction Layer
                       │
                       ▼
             Structured AI Output
                       │
                       ▼
               Schema Validation
                       │
                       ▼
              Business Validation
                       │
              ┌────────┴────────┐
              │                 │
              ▼                 ▼
          Validated          Review
           Result            Required
              │                 │
              └────────┬────────┘
                       ▼
                  Persistence
                       │
                       ▼
                  UI / API
```

---

# 23. Transcript Processing Architecture

Transcript ingestion consists of:

```text
Upload
  ↓
File Validation
  ↓
File Parser
  ↓
Text Extraction
  ↓
Normalization
  ↓
Transcript Storage
```

---

# 24. File Parser Architecture

Use a parser abstraction:

```text
DocumentParser
       │
       ├── TxtParser
       ├── PdfParser
       └── DocxParser
```

The application should not contain file-format-specific logic inside the API routes.

---

# 25. Text Normalization

Normalization should:

* Preserve meaningful line boundaries
* Preserve speakers
* Preserve timestamps
* Remove formatting noise
* Normalize whitespace
* Avoid destructive transformations

---

# 26. AI Extraction Architecture

The extraction layer:

```text
ExtractionService
       │
       ▼
PromptBuilder
       │
       ▼
AIProvider
       │
       ▼
Structured Response
       │
       ▼
AI Output Parser
```

---

# 27. AI Provider Interface

The application should depend on an interface conceptually similar to:

```text
AIProvider
    extract_action_items(
        transcript,
        meeting_context
    )
```

The concrete provider implementation remains replaceable.

---

# 28. Prompt Architecture

Prompts should be separated from business logic.

Recommended:

```text
ai/
├── prompts/
│   ├── extraction_v1.py
│   └── evaluation_v1.py
```

Prompt versions must be identifiable.

---

# 29. Extraction Prompt Context

The model should receive structured context:

```text
SYSTEM INSTRUCTIONS
        ↓
MEETING METADATA
        ↓
PARTICIPANTS
        ↓
TRANSCRIPT
        ↓
OUTPUT SCHEMA
        ↓
EXTRACTION RULES
```

---

# 30. AI Output Boundary

The raw AI response must never directly become database records.

Required:

```text
Raw AI Response
       ↓
Parse
       ↓
Schema Validation
       ↓
Business Validation
       ↓
Domain Object
       ↓
Persistence
```

---

# 31. Validation Architecture

Validation consists of multiple layers.

```text
Layer 1
Schema Validation

Layer 2
Field Validation

Layer 3
Semantic Validation

Layer 4
Review Classification
```

---

# 32. Schema Validation

Checks:

* Required structure
* Data types
* Enums
* Confidence range
* String constraints

Pydantic should be used where appropriate.

---

# 33. Field Validation

Checks:

```text
Task
Owner
Deadline
Status
Confidence
Evidence
```

---

# 34. Date Validation Architecture

```text
Extracted Date
      ↓
Parse
      ↓
Absolute?
   /       \
 Yes       No
 │          │
 ▼          ▼
Validate   Resolve
            │
            ▼
       Meeting Context
            │
            ▼
         Validate
```

If the date cannot be reliably interpreted:

```text
Needs Review
```

---

# 35. Owner Validation Architecture

```text
Extracted Owner
      ↓
Participant Matching
      ↓
Exact / Fuzzy / Unknown
      ↓
Confidence
      ↓
Review if Ambiguous
```

---

# 36. Duplicate Detection Architecture

Duplicate detection should use normalized and semantic comparison.

Conceptual workflow:

```text
New Action
     ↓
Normalize
     ↓
Compare Existing Actions
     ↓
Similarity Check
     ↓
Potential Duplicate?
     │
    Yes
     ↓
Flag for Review
```

The system should not automatically delete the action.

---

# 37. Confidence Architecture

Confidence should not rely exclusively on an LLM-generated score.

Conceptual system:

```text
Model Signal
     +
Field Completeness
     +
Validation Results
     +
Evidence Quality
     +
Ambiguity
     ↓
System Confidence
```

The exact scoring methodology will be finalized during evaluation design.

---

# 38. Review Classification

The validation system should classify each result.

```text
                    Action Item
                         │
                         ▼
                   Validation
                         │
             ┌───────────┴───────────┐
             │                       │
        Sufficiently              Problem
          reliable                  found
             │                       │
             ▼                       ▼
           READY                NEEDS REVIEW
```

---

# 39. Review Workflow

```text
Needs Review
      ↓
Reviewing
      ↓
 ┌────┼───────────────┐
 ▼    ▼               ▼
Approve
Edit & Approve       Reject
```

---

# 40. Review Persistence

Review decisions should be persisted.

This allows:

* Auditing
* Evaluation
* Debugging
* Future quality analysis

---

# 41. Explainability Architecture

Each action should maintain:

```text
Action Item
    │
    ├── Evidence Text
    │
    ├── Speaker
    │
    ├── Timestamp
    │
    └── Source Segment
```

---

# 42. Evidence Flow

```text
Transcript
    ↓
AI identifies evidence
    ↓
Evidence stored with action
    ↓
UI displays evidence
    ↓
User verifies result
```

---

# 43. Analytics Architecture

Analytics should be calculated from persisted domain data.

Examples:

```text
Total Meetings
Total Actions
Completed Actions
Pending Actions
Review Items
Completion Rate
Average Confidence
```

---

# 44. Analytics Flow

```text
PostgreSQL
    ↓
Analytics Repository
    ↓
Analytics Service
    ↓
API
    ↓
Dashboard
```

Analytics should not require a separate analytics database for MVP.

---

# 45. Evaluation Architecture

Evaluation is a separate subsystem within the modular backend.

```text
Evaluation Dataset
        ↓
Evaluation Run
        ↓
AI Extraction
        ↓
Prediction
        ↓
Ground Truth Comparison
        ↓
Metrics
        ↓
Failure Analysis
```

---

# 46. Evaluation Dataset Structure

Each sample should contain:

```text
Sample
-------------------------
id
transcript
expected_actions
expected_owners
expected_deadlines
expected_statuses
metadata
```

---

# 47. Evaluation Run

Each run should record:

```text
dataset
model
model_version
prompt_version
timestamp
configuration
```

---

# 48. Evaluation Metrics

The architecture should support:

```text
Action Precision
Action Recall
Action F1

Task Accuracy
Owner Accuracy
Deadline Accuracy
Status Accuracy
```

Exact and partial matching may both be supported.

---

# 49. Failure Analysis

Each incorrect result should be classified where possible.

```text
False Action
Missing Action
Wrong Task
Wrong Owner
Wrong Deadline
Wrong Status
Duplicate
Ambiguous
```

---

# 50. Export Architecture

Export should use a dedicated service.

```text
ExportService
      │
      ├── CSVExporter
      └── JSONExporter
```

The API should not contain formatting logic.

---

# 51. API Architecture

```text
/api/v1
    │
    ├── /meetings
    │
    ├── /transcripts
    │
    ├── /action-items
    │
    ├── /reviews
    │
    ├── /analytics
    │
    ├── /evaluations
    │
    └── /export
```

---

# 52. API Request Flow

```text
Browser
   ↓
Next.js
   ↓
HTTP Request
   ↓
FastAPI Router
   ↓
Request Schema
   ↓
Application Service
   ↓
Repository / AI / Validation
   ↓
Response Schema
   ↓
Browser
```

---

# 53. Error Architecture

Errors should move through explicit layers.

```text
Low-Level Error
       ↓
Service Exception
       ↓
API Error Mapping
       ↓
HTTP Response
       ↓
Frontend Error State
```

---

# 54. Error Categories

Recommended application errors:

```text
ValidationError
NotFoundError
ProcessingError
AIProviderError
FileProcessingError
DatabaseError
ExportError
EvaluationError
```

---

# 55. API Error Format

Standard:

```json
{
  "data": null,
  "error": {
    "code": "PROCESSING_FAILED",
    "message": "Meeting processing failed."
  }
}
```

Internal technical details should remain in server logs.

---

# 56. Processing Failure Handling

If AI processing fails:

```text
Meeting
    ↓
Processing
    ↓
AI Failure
    ↓
processing_status = failed
    ↓
Error recorded
    ↓
User can retry
```

Previously stored valid data should not be corrupted.

---

# 57. Database Transaction Strategy

Critical operations should use transactions.

Example:

```text
Validate Results
       ↓
Begin Transaction
       ↓
Create Action Items
       ↓
Create Review Records
       ↓
Update Meeting
       ↓
Commit
```

If the operation fails:

```text
Rollback
```

---

# 58. Concurrency Considerations

MVP should avoid unnecessary concurrent writes.

Where concurrent updates can occur:

* Review actions
* Action-item editing
* Processing retries

the system should use appropriate database transaction handling.

---

# 59. Authentication Architecture

Authentication is intentionally kept simple for MVP.

The architecture should allow:

```text
Frontend
   ↓
Authentication
   ↓
Authenticated API
```

The exact authentication mechanism will be finalized during implementation planning.

The system should not introduce enterprise SSO unless required.

---

# 60. Authorization Architecture

Application data must be scoped to the authenticated user.

Conceptually:

```text
Authenticated User
       ↓
Meeting Ownership
       ↓
Action Item Ownership
       ↓
Review Access
```

---

# 61. Security Boundary

The major security boundaries are:

```text
Browser
   │
   ▼
API
   │
   ├── File Input
   │
   ├── User Input
   │
   ├── AI Provider
   │
   └── Database
```

Every boundary requires validation.

---

# 62. File Security Architecture

```text
Upload
  ↓
Extension Check
  ↓
MIME Validation
  ↓
Size Validation
  ↓
Safe Parser
  ↓
Extract Text
  ↓
Store
```

Unsupported files must never reach the parser.

---

# 63. AI Security Architecture

Transcript content is untrusted.

The AI system must distinguish:

```text
Trusted System Instructions
        ≠
Untrusted Transcript Content
```

Transcript content must not override extraction instructions.

---

# 64. Logging Architecture

Structured logs should capture:

```text
timestamp
level
event
request_id
meeting_id
processing_stage
status
error_code
duration
```

Avoid logging complete transcripts unless explicitly required for debugging and controlled securely.

---

# 65. Observability Events

Important events include:

```text
meeting_created
transcript_uploaded
transcript_parsed
processing_started
ai_extraction_started
ai_extraction_completed
validation_started
validation_completed
review_required
meeting_completed
processing_failed
evaluation_started
evaluation_completed
export_created
```

---

# 66. Performance Architecture

The MVP does not require distributed processing.

Processing should initially be synchronous or use a simple background execution mechanism only where required.

The architecture should avoid adding Redis/Celery solely because they are common production technologies.

If transcript processing proves too slow for the target UX, a background job layer can be introduced later without changing the domain architecture.

---

# 67. Caching

Caching is not required for MVP.

Potential future caching targets:

```text
Analytics
Evaluation Results
Repeated AI Requests
Static Configuration
```

Caching should only be introduced after identifying an actual performance need.

---

# 68. Storage Architecture

For MVP:

```text
PostgreSQL
    ↓
Transcript Storage
```

If transcript/file storage requirements grow, object storage can be introduced.

Potential future:

```text
PostgreSQL
+
S3-Compatible Object Storage
```

---

# 69. Deployment Architecture

Initial deployment:

```text
                 Internet
                    │
                    ▼
            ┌───────────────┐
            │   Frontend    │
            │   Next.js     │
            └───────┬───────┘
                    │
                    ▼
            ┌───────────────┐
            │    Backend    │
            │    FastAPI    │
            └───────┬───────┘
                    │
             ┌──────┴──────┐
             ▼             ▼
      ┌────────────┐ ┌──────────────┐
      │ PostgreSQL │ │ AI Provider  │
      └────────────┘ └──────────────┘
```

---

# 70. Docker Architecture

Development should support:

```text
docker compose up
```

Services:

```text
frontend
backend
postgres
```

No additional service should be added without a documented reason.

---

# 71. Environment Architecture

Development:

```text
.env
```

Template:

```text
.env.example
```

Production secrets must be supplied through the deployment environment.

---

# 72. Configuration Architecture

Backend configuration should be centralized.

Conceptually:

```text
Settings
├── Database
├── AI
├── API
├── Security
├── File Upload
└── Environment
```

No scattered environment-variable access throughout business logic.

---

# 73. Dependency Direction

The project should maintain this dependency direction:

```text
API
 ↓
Services
 ↓
Domain / Validation
 ↓
Repositories
 ↓
Database
```

AI:

```text
Services
 ↓
AI Interface
 ↓
Provider
```

Infrastructure must not leak into domain logic.

---

# 74. Domain Independence

Business rules such as:

```text
Is deadline valid?
Does action need review?
Is owner ambiguous?
Is action duplicated?
```

should be testable without:

* HTTP
* PostgreSQL
* External AI API

---

# 75. Testing Architecture

Testing layers:

```text
Unit Tests
    ↓
Service Tests
    ↓
API Tests
    ↓
Integration Tests
    ↓
AI Evaluation
```

---

# 76. Unit Test Boundaries

Unit tests should cover:

```text
Date parsing
Date validation
Owner matching
Duplicate detection
Confidence calculation
Status validation
Transcript normalization
Schema validation
```

---

# 77. Integration Test Flow

At minimum:

```text
Create Meeting
     ↓
Upload Transcript
     ↓
Process
     ↓
Mock AI
     ↓
Validate
     ↓
Persist
     ↓
Retrieve Action Items
```

---

# 78. AI Regression Testing

Evaluation examples should become regression cases.

When an extraction bug is found:

```text
Bug
 ↓
Add Evaluation Sample
 ↓
Fix
 ↓
Run Evaluation
 ↓
Verify
```

---

# 79. Frontend State Architecture

Frontend data states:

```text
idle
loading
success
empty
error
```

Long-running processing:

```text
queued
processing
completed
failed
```

---

# 80. Frontend API Layer

API calls should be centralized.

Recommended:

```text
lib/
└── api/
    ├── client.ts
    ├── meetings.ts
    ├── actions.ts
    ├── reviews.ts
    ├── analytics.ts
    └── evaluations.ts
```

Components should not construct raw API URLs repeatedly.

---

# 81. Frontend Type Architecture

Shared frontend response types should be centralized.

Examples:

```text
Meeting
Transcript
ActionItem
Review
EvaluationRun
AnalyticsSummary
ApiError
```

---

# 82. UI Component Architecture

Components should be organized by responsibility.

```text
ui/
    Buttons
    Inputs
    Dialogs
    Badges
    Tables

domain components/
    MeetingCard
    ActionItemRow
    ReviewPanel
    EvidenceViewer
    MetricCard
```

---

# 83. Design System Architecture

The UI should define reusable tokens for:

```text
Typography
Spacing
Radius
Borders
Shadows
Colors
Status
```

The system should avoid arbitrary styling on every page.

---

# 84. Status Design

Status must be understandable without color alone.

Example:

```text
[Pending]
[In Progress]
[Completed]
[Blocked]
[Needs Review]
```

Icons and text should support color.

---

# 85. Navigation Architecture

Primary navigation:

```text
Dashboard
Meetings
Action Items
Review Queue
Insights
Evaluation
Settings
```

Meetings may contain:

```text
All Meetings
Upload Meeting
```

---

# 86. Dashboard Architecture

The dashboard should prioritize:

```text
1. Overall state
2. Review workload
3. Recent meetings
4. Action-item status
5. Insights
```

---

# 87. Meeting Detail Architecture

```text
Meeting Header
      ↓
Overview
      ↓
Tabs
├── Transcript
├── Action Items
├── Review
└── Insights
```

---

# 88. Action Item Detail Architecture

An action item detail panel should expose:

```text
Task
Owner
Deadline
Status
Confidence
Review State
       ↓
Evidence
       ↓
Validation
       ↓
Source
```

---

# 89. Review UI Architecture

The review screen should prioritize verification.

```text
┌──────────────────────────────────────┐
│ AI EXTRACTED ACTION                  │
│                                      │
│ Task                                 │
│ Owner                                │
│ Deadline                             │
│ Status                               │
│ Confidence                           │
│                                      │
├──────────────────────────────────────┤
│ EVIDENCE                             │
│ Transcript segment                   │
│ Speaker / Timestamp                  │
│                                      │
├──────────────────────────────────────┤
│ VALIDATION                           │
│ Owner: Valid                         │
│ Date: Ambiguous                      │
│ Duplicate: No                        │
│                                      │
├──────────────────────────────────────┤
│ [Edit] [Approve] [Reject]            │
└──────────────────────────────────────┘
```

---

# 90. Analytics Architecture

Initial charts should be generated from backend-provided aggregates.

Potential visualizations:

```text
Actions by Status
Actions by Owner
Completion Rate
Review Distribution
Deadline Distribution
Confidence Distribution
```

Charts should communicate information rather than act as decoration.

---

# 91. Evaluation Architecture UI

The evaluation page should provide:

```text
Dataset
      ↓
Run Evaluation
      ↓
Metrics
      ↓
Failure Analysis
      ↓
Detailed Samples
```

---

# 92. Architecture Decision — No Microservices

Decision:

```text
Use modular monolith.
```

Reason:

* Smaller operational burden
* Faster development
* Easier debugging
* Easier local setup
* Appropriate for MVP scale

---

# 93. Architecture Decision — PostgreSQL

Decision:

```text
Use PostgreSQL.
```

Reason:

* Relational data model
* Strong constraints
* Good querying
* Mature ecosystem
* Suitable for analytics and transactional data

---

# 94. Architecture Decision — FastAPI

Decision:

```text
Use FastAPI.
```

Reason:

* Python ecosystem
* Strong typing
* Pydantic integration
* Automatic API documentation
* Suitable for AI workflows

---

# 95. Architecture Decision — Next.js

Decision:

```text
Use Next.js.
```

Reason:

* Modern React framework
* App Router
* Strong TypeScript support
* Suitable for dashboard applications

---

# 96. Architecture Decision — External LLM

Decision:

```text
Use external LLM through provider abstraction.
```

Reason:

* Faster development
* No model hosting infrastructure
* Easy experimentation
* Replaceable provider boundary

---

# 97. Architecture Decision — No Vector Database Initially

A vector database is not required for MVP.

The core product workflow is structured extraction rather than semantic retrieval across a large knowledge base.

A vector database may be introduced later if features such as:

```text
Cross-meeting semantic search
Meeting knowledge retrieval
Historical context retrieval
```

become important.

---

# 98. Architecture Decision — No Redis Initially

Redis is not required for the first architecture.

If background processing becomes necessary, Redis or another job mechanism may be introduced after benchmarking.

---

# 99. Architecture Decision — No Celery Initially

Celery should not be added solely for architectural appearance.

The project should first establish a reliable processing workflow.

---

# 100. Architecture Decision — No Multi-Agent System

The AI workflow should remain a controlled pipeline.

```text
Preprocess
   ↓
Extract
   ↓
Validate
   ↓
Review
```

Agents are not required.

---

# 101. Architecture Decision — No Fine-Tuning

The MVP will use:

```text
Prompt Engineering
+
Structured Output
+
Validation
+
Evaluation
```

Fine-tuning is outside MVP scope.

---

# 102. Architecture Decision — Explainability

Explainability is a core architecture requirement rather than a UI-only feature.

Evidence must be captured during extraction.

---

# 103. Architecture Decision — Evaluation as a First-Class Module

Evaluation is part of the architecture because AI quality must be measurable.

The system should not depend solely on subjective demo impressions.

---

# 104. Complete Data Flow

```text
USER
 │
 ▼
NEXT.JS
 │
 ▼
FASTAPI
 │
 ▼
MEETING SERVICE
 │
 ├──────────────► POSTGRESQL
 │
 ▼
TRANSCRIPT SERVICE
 │
 ▼
DOCUMENT PARSER
 │
 ▼
NORMALIZED TRANSCRIPT
 │
 ▼
EXTRACTION SERVICE
 │
 ▼
AI PROVIDER
 │
 ▼
STRUCTURED AI OUTPUT
 │
 ▼
PYDANTIC VALIDATION
 │
 ▼
BUSINESS VALIDATION
 │
 ├──────────────► REVIEW QUEUE
 │
 ▼
ACTION ITEM SERVICE
 │
 ▼
POSTGRESQL
 │
 ▼
ANALYTICS / EXPORT
 │
 ▼
NEXT.JS
 │
 ▼
USER
```

---

# 105. Processing Lifecycle

```text
CREATED
   ↓
UPLOADED
   ↓
PROCESSING
   ↓
EXTRACTING
   ↓
VALIDATING
   ↓
COMPLETED
```

Failure path:

```text
ANY PROCESSING STATE
        ↓
      FAILED
        ↓
      RETRY
```

---

# 106. Action Lifecycle

```text
AI EXTRACTED
     ↓
VALIDATED
     ↓
 ┌───┴───────────┐
 │               │
READY       NEEDS REVIEW
 │               │
 │               ▼
 │           REVIEWING
 │               │
 │        ┌──────┼──────┐
 │        ▼      ▼      ▼
 │     APPROVE  EDIT   REJECT
 │        │      │
 │        │      ▼
 │        │   APPROVED
 │        │
 └────────┴──────────────► FINAL
```

---

# 107. Evaluation Lifecycle

```text
DATASET
   ↓
RUN
   ↓
LOAD SAMPLE
   ↓
EXTRACT
   ↓
VALIDATE
   ↓
COMPARE
   ↓
CALCULATE METRICS
   ↓
CLASSIFY FAILURES
   ↓
STORE RESULTS
```

---

# 108. Deployment Evolution

Initial:

```text
Frontend
Backend
PostgreSQL
AI Provider
```

Possible future:

```text
Frontend
     │
Backend
     │
 ┌───┼──────────────┐
 │   │              │
DB  Queue       Object Storage
 │   │              │
 │ Worker           │
 │   │              │
 └───┴──────────────┘
        │
   AI Provider
```

The future architecture should only be adopted when justified by actual requirements.

---

# 109. Scalability Strategy

The system can scale progressively.

## Stage 1

Single backend instance.

## Stage 2

Separate background processing.

## Stage 3

Object storage for files.

## Stage 4

Horizontal backend scaling.

## Stage 5

Dedicated workers.

The architecture should not implement Stage 5 infrastructure during MVP.

---

# 110. Failure Isolation

Failure in:

```text
File Parser
AI Provider
Validation
Database
Export
Evaluation
```

must be represented independently.

The system should not hide failure by returning apparently successful data.

---

# 111. Retry Strategy

Retries should only be used for transient failures.

Potential retry candidates:

```text
Temporary AI provider failure
Temporary network failure
Temporary database connection failure
```

Do not blindly retry:

```text
Invalid input
Invalid file
Malformed request
Permanent authentication error
```

---

# 112. Idempotency Considerations

Processing a meeting multiple times should not accidentally create uncontrolled duplicate action items.

The processing architecture should define whether a run:

```text
Replaces previous extraction
```

or:

```text
Creates a new extraction version
```

For MVP, reprocessing should replace or explicitly supersede the previous extraction result rather than silently appending duplicates.

---

# 113. Versioning

The system should record:

```text
model_version
prompt_version
application_version
```

where applicable.

This is important for evaluation reproducibility.

---

# 114. AI Reproducibility

Evaluation runs should record enough configuration to reproduce a run as closely as practical.

At minimum:

```text
Model
Model Version
Prompt Version
Evaluation Dataset
Timestamp
Relevant Parameters
```

---

# 115. Architecture Testing Strategy

Architecture-level verification should confirm:

```text
API does not contain business logic
AI provider is replaceable
Validation is independently testable
Repositories isolate database access
Frontend API access is centralized
Secrets are configuration-driven
```

---

# 116. Documentation Strategy

Architecture changes must be reflected in:

```text
PRD
SRS
System Architecture
Development Plan
Project State
```

where the change materially affects requirements or implementation.

---

# 117. Scope Protection

Before introducing a new infrastructure component, ask:

```text
Does MVP require it?
What problem does it solve?
Can the problem be solved more simply?
Does it increase maintenance?
Does it improve measurable product value?
```

If the answer is unclear, do not introduce it.

---

# 118. Core Engineering Principle

The architecture should optimize for:

```text
Correctness
+
Explainability
+
Testability
+
Maintainability
+
User Experience
```

rather than:

```text
Maximum Infrastructure
```

---

# 119. Final Architecture

The final MVP architecture is:

```text
                    ┌───────────────────────┐
                    │         USER          │
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │       NEXT.JS         │
                    │      FRONTEND         │
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │       FASTAPI         │
                    │         API           │
                    └───────────┬───────────┘
                                │
                ┌───────────────┼────────────────┐
                │               │                │
                ▼               ▼                ▼
        ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
        │   Meeting   │ │ Extraction  │ │ Evaluation  │
        │   Service   │ │   Service   │ │   Service   │
        └──────┬──────┘ └──────┬──────┘ └──────┬──────┘
               │               │                │
               │               ▼                │
               │       ┌───────────────┐        │
               │       │ AI Provider   │        │
               │       └───────┬───────┘        │
               │               │                │
               └───────┬───────┴────────────────┘
                       ▼
                ┌──────────────┐
                │  Validation  │
                │    Engine    │
                └──────┬───────┘
                       │
                       ▼
                ┌──────────────┐
                │ Repositories │
                └──────┬───────┘
                       │
                       ▼
                ┌──────────────┐
                │  PostgreSQL  │
                └──────────────┘
```

---

# 120. Architecture Status

**Version:** 1.0

**Status:** Draft for UI/UX and Development Planning

**Architecture Style:** Modular Monolith

**Primary Backend:** FastAPI

**Primary Frontend:** Next.js

**Database:** PostgreSQL

**AI:** External LLM through provider abstraction

**Core Design Principle:**

```text
AI generates.
Software validates.
Humans verify.
Database persists.
Evaluation measures.
```

---

# 121. Next Document

The next document is:

```text
docs/04-ui-ux.md
```

It will define the complete visual and interaction system before implementation, including:

* Design principles
* Visual language
* Color system
* Typography
* Spacing
* Layout
* Navigation
* Dashboard
* Meeting pages
* Transcript viewer
* Action-item UI
* Review queue
* Review panel
* Insights
* Evaluation Center
* Settings
* Components
* Tables
* Forms
* Modals
* Empty states
* Loading states
* Error states
* Responsive behavior
* Accessibility
* Interaction patterns
* Animation rules
* UX flows
* Design anti-patterns
* Page-by-page specifications
* Progressive UI refinement rules

```
