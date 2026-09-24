# MeetExtract AI — Development Plan

**Document:** `docs/05-development-plan.md`  
**Version:** 1.0  
**Status:** Draft  
**Project:** MeetExtract AI  
**Development Philosophy:** Depth over breadth

---

# 1. Development Objective

The objective of development is to build a complete, reliable, professional AI meeting intelligence platform that can:

```text
Ingest
  ↓
Process
  ↓
Extract
  ↓
Validate
  ↓
Review
  ↓
Finalize
  ↓
Export
  ↓
Evaluate
```

The system must be:

* Functional
* Testable
* Explainable
* Maintainable
* Reproducible
* Secure
* Professionally designed
* Demo-ready

---

# 2. Development Philosophy

MeetExtract AI will follow:

```text
PLAN
 ↓
IMPLEMENT
 ↓
TEST
 ↓
VERIFY
 ↓
REFINE
 ↓
DOCUMENT
 ↓
UPDATE PROJECT STATE
```

A feature is not complete simply because its code exists.

It is complete only when its behavior has been verified.

---

# 3. Core Development Principles

## 3.1 Depth Over Breadth

Prioritize a small number of highly reliable capabilities over many shallow features.

---

## 3.2 Functional Before Decorative

A feature must work correctly before visual refinement is finalized.

However, UI refinement should happen progressively after functionality stabilizes.

---

## 3.3 Evidence Over Assumptions

Every implementation decision should be based on:

* PRD
* SRS
* Architecture
* UI/UX specification
* Tests
* Actual runtime behavior

---

## 3.4 Simple Architecture

Do not introduce infrastructure unless it provides meaningful value.

Avoid premature:

* Microservices
* Kubernetes
* Event buses
* Multi-agent systems
* Complex orchestration
* Distributed infrastructure

---

## 3.5 AI Is a System Component

The LLM must not be treated as the entire application.

The architecture is:

```text
Input
 ↓
Preprocessing
 ↓
AI Extraction
 ↓
Schema Validation
 ↓
Business Validation
 ↓
Confidence Assessment
 ↓
Persistence
 ↓
Human Review
```

---

# 4. Development Phases

The project will be developed through:

```text
Phase 0  Project Foundation
Phase 1  Database Architecture
Phase 2  Backend Core
Phase 3  Transcript Ingestion
Phase 4  AI Extraction Pipeline
Phase 5  Validation & Explainability
Phase 6  Review Workflow
Phase 7  Frontend Foundation
Phase 8  Meeting Experience
Phase 9  Action Management
Phase 10 Dashboard & Insights
Phase 11 Evaluation Center
Phase 12 Export
Phase 13 Integration & Testing
Phase 14 UI/UX Refinement
Phase 15 Security & Performance
Phase 16 Final Verification
Phase 17 Demo & Documentation
```

---

# 5. Phase Completion Rule

No phase is complete until:

```text
Implementation
+
Tests
+
Verification
+
Documentation
+
Project State Update
```

have been completed.

---

# 6. Phase 0 — Project Foundation

## Objective

Create the repository structure and development environment.

---

## Tasks

Create:

```text
meetextract-ai/
│
├── backend/
├── frontend/
├── tests/
├── docs/
├── scripts/
├── data/
│
├── .env.example
├── .gitignore
├── README.md
├── AGENTS.md
├── PROJECT_STATE.md
├── docker-compose.yml
└── LICENSE
```

---

## Backend Structure

Expected initial structure:

```text
backend/
├── app/
│   ├── api/
│   ├── core/
│   ├── db/
│   ├── models/
│   ├── schemas/
│   ├── services/
│   ├── ai/
│   ├── validation/
│   └── main.py
│
├── tests/
├── alembic/
├── pyproject.toml
└── uv.lock
```

---

## Frontend Structure

```text
frontend/
├── app/
├── components/
├── lib/
├── hooks/
├── types/
├── public/
├── styles/
├── package.json
└── tsconfig.json
```

---

## Environment

Required environment configuration should be documented in:

```text
.env.example
```

Potential variables:

```text
DATABASE_URL
AI_API_KEY
AI_MODEL
NEXT_PUBLIC_API_URL
APP_ENV
```

Secrets must never be committed.

---

## Phase 0 Verification

Verify:

```text
[ ] Repository created
[ ] Frontend starts
[ ] Backend starts
[ ] Environment loads
[ ] Docker configuration exists
[ ] Git initialized
[ ] .gitignore configured
[ ] No secrets committed
[ ] README exists
[ ] AGENTS.md exists
[ ] PROJECT_STATE.md exists
```

---

# 7. Phase 1 — Database Architecture

## Objective

Implement the relational data model.

---

# 8. Core Entities

Implement:

```text
User
Meeting
Transcript
Participant
ActionItem
Review
EvaluationDataset
EvaluationRun
EvaluationResult
```

---

# 9. Database Relationships

Core relationship:

```text
User
 │
 └── Meeting
       │
       ├── Transcript
       │
       ├── Participant
       │
       └── ActionItem
              │
              └── Review
```

Evaluation:

```text
EvaluationDataset
        │
        └── EvaluationRun
                │
                └── EvaluationResult
```

---

# 10. Database Tasks

Implement:

* SQLAlchemy models
* Relationships
* Constraints
* Indexes
* Enums
* Timestamps
* Foreign keys
* Alembic configuration
* Initial migration

---

# 11. Important Database Constraints

Examples:

```text
ActionItem.meeting_id → Meeting.id
Review.action_item_id → ActionItem.id
Transcript.meeting_id → Meeting.id
EvaluationResult.run_id → EvaluationRun.id
```

Foreign-key integrity must be enforced.

---

# 12. Database Indexes

Index fields likely to be queried frequently:

```text
Meeting.created_at
Meeting.status
ActionItem.status
ActionItem.owner
ActionItem.deadline
ActionItem.review_status
Review.status
EvaluationRun.created_at
```

Exact indexing should follow actual query patterns.

---

# 13. Phase 1 Tests

Test:

```text
[ ] Model creation
[ ] Relationships
[ ] Foreign keys
[ ] Required fields
[ ] Enum constraints
[ ] Index definitions
[ ] Migration generation
[ ] Migration execution
```

---

# 14. Phase 2 — Backend Core

## Objective

Create the FastAPI application foundation.

---

# 15. Backend Components

Implement:

```text
FastAPI
Configuration
Database Session
Exception Handling
Logging
API Router Structure
Pydantic Schemas
Health Endpoint
```

---

# 16. API Structure

Initial:

```text
/api/v1
```

Routes:

```text
/meetings
/transcripts
/action-items
/reviews
/evaluations
/analytics
```

---

# 17. Backend Service Architecture

Use separation:

```text
Router
  ↓
Service
  ↓
Repository / Database
```

AI-specific operations:

```text
Router
  ↓
Service
  ↓
AI Service
  ↓
Validation
  ↓
Database
```

---

# 18. Error Handling

Implement consistent API errors.

Example categories:

```text
VALIDATION_ERROR
NOT_FOUND
PROCESSING_ERROR
AI_ERROR
FILE_ERROR
DATABASE_ERROR
INTERNAL_ERROR
```

---

# 19. Health Endpoint

Implement:

```text
GET /health
```

Response should confirm application availability.

---

# 20. Phase 2 Testing

Test:

```text
[ ] Application startup
[ ] Health endpoint
[ ] Schema validation
[ ] Error responses
[ ] Database dependency
[ ] Service boundaries
```

---

# 21. Phase 3 — Transcript Ingestion

## Objective

Allow users to create meetings and upload transcript data.

---

# 22. Supported Inputs

MVP:

```text
TXT
PDF
DOCX
Direct Text
```

---

# 23. File Validation

Validate:

```text
File type
File extension
MIME type where possible
File size
Readable content
```

---

# 24. File Processing Pipeline

```text
Upload
 ↓
Validate File
 ↓
Extract Text
 ↓
Normalize Text
 ↓
Create Transcript
 ↓
Trigger Processing
```

---

# 25. Transcript Preprocessing

The preprocessing layer should:

* Normalize whitespace
* Preserve speaker identity where available
* Preserve timestamps where available
* Remove irrelevant formatting noise
* Preserve sentence boundaries where possible
* Preserve evidence locations

---

# 26. Transcript Data

Store:

```text
Original file metadata
Extracted text
Normalized text
Source type
Processing status
```

---

# 27. Processing States

Use explicit states:

```text
UPLOADED
PROCESSING
EXTRACTING
VALIDATING
COMPLETED
FAILED
```

---

# 28. Phase 3 Tests

Test:

```text
[ ] TXT extraction
[ ] PDF extraction
[ ] DOCX extraction
[ ] Invalid file
[ ] Oversized file
[ ] Empty file
[ ] Corrupted file
[ ] Direct text
[ ] Transcript normalization
[ ] Processing state transitions
```

---

# 29. Phase 4 — AI Extraction Pipeline

## Objective

Build the core AI intelligence system.

---

# 30. AI Architecture

The AI system must use an abstraction layer.

Conceptually:

```text
AIProvider
    │
    ├── Provider A
    ├── Provider B
    └── Mock Provider
```

This prevents business logic from depending directly on a specific LLM vendor.

---

# 31. Extraction Pipeline

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
Pydantic Validation
   ↓
Business Validation
   ↓
Confidence
   ↓
Evidence Mapping
   ↓
Persistence
```

---

# 32. Extraction Fields

Each extracted action should contain:

```text
task
owner
deadline
status
confidence
evidence
source_location
```

---

# 33. AI Output Rule

The model must return structured data.

Free-form model output must not directly enter the database.

---

# 34. Schema Validation

Validate:

```text
Required fields
Data types
Enum values
Confidence range
Evidence structure
Deadline format
```

---

# 35. AI Prompt Design

Prompt construction should clearly define:

```text
Role
Objective
Input format
Action-item definition
Output schema
Non-action rules
Evidence requirement
Unknown handling
```

---

# 36. Action Definition

The system should distinguish:

```text
Explicit Action
Implicit Commitment
Decision
Information
Discussion
Question
Non-action Statement
```

Only valid action items should be extracted.

---

# 37. Unknown Handling

The model must not invent:

```text
Owner
Deadline
Status
Evidence
```

Unknown values should remain unknown.

---

# 38. Evidence Requirement

Every action should attempt to provide evidence.

Evidence should contain:

```text
Speaker
Timestamp where available
Transcript text
Source location
```

---

# 39. AI Failure Handling

If the AI provider fails:

```text
Do not corrupt data
Do not create fake results
Mark processing failure
Provide retry capability
Log safe diagnostic information
```

---

# 40. Phase 4 Tests

Test:

```text
[ ] Valid structured output
[ ] Malformed output
[ ] Missing fields
[ ] Invalid enum
[ ] Invalid confidence
[ ] Provider failure
[ ] Timeout
[ ] Empty result
[ ] Multiple actions
[ ] No actions
[ ] Non-action statements
```

---

# 41. Phase 5 — Validation & Explainability

## Objective

Build deterministic validation around AI output.

---

# 42. Validation Architecture

```text
AI Output
   ↓
Schema Validation
   ↓
Date Validation
   ↓
Owner Validation
   ↓
Duplicate Detection
   ↓
Evidence Validation
   ↓
Confidence Assessment
   ↓
Review Decision
```

---

# 43. Deadline Validation

Handle:

```text
Explicit date
Relative date
Ambiguous date
Invalid date
Unparseable date
Past date
Missing date
```

---

# 44. Relative Dates

Examples:

```text
tomorrow
Friday
next week
by EOD
next month
```

These should be normalized where enough context exists.

If ambiguity remains:

```text
Needs Review
```

---

# 45. Owner Validation

Possible states:

```text
Known
Unknown
Ambiguous
Missing
```

---

# 46. Duplicate Detection

Potential duplicates should be detected using:

```text
Task similarity
Owner similarity
Deadline similarity
Meeting context
```

Duplicates must be flagged.

They must not automatically be deleted.

---

# 47. Evidence Validation

Verify:

```text
Evidence exists
Evidence is non-empty
Evidence belongs to transcript
Source location is valid where available
```

---

# 48. Confidence Assessment

The initial system may use:

```text
High: 90–100
Medium: 70–89
Low: 0–69
```

However, confidence must not depend exclusively on an LLM's self-reported number.

System-derived validation signals should influence review decisions.

---

# 49. Review Trigger Rules

An action should enter review when:

```text
Owner missing
Owner ambiguous
Deadline ambiguous
Low confidence
Potential duplicate
Validation failure
Evidence conflict
Insufficient evidence
```

---

# 50. Explainability

The UI must expose:

```text
What was extracted
Why review is required
Supporting evidence
Validation results
Confidence
```

---

# 51. Phase 5 Tests

Test:

```text
[ ] Date parser
[ ] Relative date parser
[ ] Invalid date
[ ] Owner validation
[ ] Duplicate detection
[ ] Evidence validation
[ ] Confidence calculation
[ ] Review trigger rules
```

---

# 52. Phase 6 — Review Workflow

## Objective

Implement human verification.

---

# 53. Review States

```text
PENDING_REVIEW
REVIEWING
APPROVED
EDITED_AND_APPROVED
REJECTED
```

---

# 54. Review Workflow

```text
AI Result
   ↓
Review Required?
   ├── No → Finalized
   │
   └── Yes
         ↓
      Review
         ↓
   Edit / Approve / Reject
         ↓
      Finalized
```

---

# 55. Review API

Implement endpoints for:

```text
List Reviews
Get Review
Start Review
Update Action
Approve
Reject
```

Exact contracts are defined in the SRS.

---

# 56. Review Auditability

Store:

```text
Reviewer
Review timestamp
Original values
Updated values
Decision
Optional rejection reason
```

---

# 57. Review Tests

Test:

```text
[ ] Review creation
[ ] Review retrieval
[ ] Edit action
[ ] Approve
[ ] Reject
[ ] Invalid transition
[ ] Audit data
```

---

# 58. Phase 7 — Frontend Foundation

## Objective

Build the application shell.

---

# 59. Frontend Technology

Use:

```text
Next.js
TypeScript
Tailwind CSS
```

---

# 60. Frontend Foundation Tasks

Implement:

```text
App layout
Sidebar
Header
Routing
Theme tokens
Typography
Buttons
Inputs
Cards
Tables
Badges
Dialogs
Drawers
Toast
Loading states
Error states
```

---

# 61. API Client

Create a centralized API layer.

The UI should not scatter raw fetch logic throughout components.

Conceptually:

```text
lib/
  api/
    client
    meetings
    actions
    reviews
    evaluations
```

---

# 62. Type Safety

Frontend types should correspond to backend schemas.

Avoid uncontrolled `any` usage.

---

# 63. Phase 7 UI Verification

Verify:

```text
[ ] Navigation
[ ] Routing
[ ] Responsive layout
[ ] Keyboard navigation
[ ] Focus states
[ ] Loading states
[ ] Error states
[ ] Empty states
```

---

# 64. Phase 8 — Meeting Experience

## Objective

Implement the complete meeting workflow.

---

# 65. Pages

Implement:

```text
Dashboard
Meetings
Meeting Upload
Meeting Detail
Transcript
Action Items
Review
Insights
```

---

# 66. Upload Workflow

Frontend:

```text
Upload Form
 ↓
Validation
 ↓
Upload API
 ↓
Processing State
 ↓
Polling / Status Refresh
 ↓
Meeting Detail
```

---

# 67. Meeting Detail

Implement tabs:

```text
Overview
Transcript
Action Items
Review
Insights
```

---

# 68. Evidence Interaction

Clicking an evidence reference should open the transcript at the appropriate location where technically possible.

---

# 69. Progressive UI Refinement

After each functional meeting feature:

```text
Functional
 ↓
Interaction Tested
 ↓
Visual Refinement
 ↓
Responsive Refinement
 ↓
Accessibility Check
```

---

# 70. Phase 9 — Action Management

## Objective

Create a professional action-item management experience.

---

# 71. Action Item Features

Implement:

```text
List
Search
Filter
Sort
View
Edit
Status Update
Owner
Deadline
Confidence
Evidence
Review State
```

---

# 72. Filters

Required:

```text
All
Pending
Completed
Overdue
Needs Review
Unassigned
```

---

# 73. Search

Search by:

```text
Task
Owner
Meeting
```

---

# 74. Sorting

Support:

```text
Deadline
Confidence
Status
Created Date
Meeting
```

---

# 75. Phase 9 Verification

Verify:

```text
[ ] Search
[ ] Filters
[ ] Sorting
[ ] Detail view
[ ] Editing
[ ] Status changes
[ ] Review indicators
[ ] Evidence
```

---

# 76. Phase 10 — Dashboard & Insights

## Objective

Provide operational visibility.

---

# 77. Dashboard Metrics

Implement:

```text
Total Meetings
Total Actions
Completed
Pending
Needs Review
Average Confidence
Completion Rate
```

---

# 78. Dashboard Components

Implement:

```text
Metric Cards
Recent Meetings
Review Queue Preview
Action Status Chart
Recent Activity
```

---

# 79. Insights

Implement:

```text
Actions by Owner
Action Status Distribution
Deadline Distribution
Confidence Distribution
Completion Trends
```

---

# 80. Analytics Rule

Analytics must be derived from actual stored data.

Do not hard-code demonstration numbers into the production UI.

---

# 81. Phase 10 Verification

Test:

```text
[ ] Correct calculations
[ ] Empty dataset
[ ] Large dataset
[ ] Filtering
[ ] Chart rendering
[ ] Responsive charts
```

---

# 82. Phase 11 — Evaluation Center

## Objective

Create measurable AI quality evaluation.

---

# 83. Evaluation Dataset

Dataset samples should cover:

```text
Direct assignments
Implicit commitments
Relative dates
Missing owners
Multiple speakers
Duplicates
Non-actions
Ambiguous statements
```

---

# 84. Ground Truth

Each sample should contain expected:

```text
Task
Owner
Deadline
Status
Action classification
Evidence where applicable
```

---

# 85. Evaluation Run

Pipeline:

```text
Dataset
 ↓
AI Extraction
 ↓
Comparison
 ↓
Metrics
 ↓
Failure Classification
 ↓
Results
```

---

# 86. Metrics

Implement as appropriate:

```text
Precision
Recall
F1
Task Accuracy
Owner Accuracy
Deadline Accuracy
Status Accuracy
Exact Match
Partial Match
```

Definitions must remain consistent across runs.

---

# 87. Failure Categories

Examples:

```text
Missing Owner
Incorrect Deadline
Wrong Task
Wrong Status
False Action
Missed Action
Duplicate
Evidence Failure
```

---

# 88. Model / Prompt Comparison

If supported by implementation:

```text
Model A
Model B
Prompt Version A
Prompt Version B
```

Comparison should show metric differences.

Do not declare a model "better" without defined evaluation criteria.

---

# 89. Evaluation Verification

Test:

```text
[ ] Dataset creation
[ ] Dataset retrieval
[ ] Run creation
[ ] Metric calculations
[ ] Failure classification
[ ] Result persistence
[ ] Evaluation history
```

---

# 90. Phase 12 — Export

## Objective

Allow finalized action data to leave the system.

---

# 91. Export Formats

MVP:

```text
CSV
JSON
```

---

# 92. Export Workflow

```text
Action Items
 ↓
Filters
 ↓
Export
 ↓
Format Selection
 ↓
Generate
 ↓
Download
```

---

# 93. Export Rules

Export should use the currently selected dataset/filter where appropriate.

The exported data must reflect finalized system state.

---

# 94. Export Tests

Test:

```text
[ ] CSV
[ ] JSON
[ ] Empty dataset
[ ] Special characters
[ ] Dates
[ ] Unicode
[ ] Filtering
```

---

# 95. Phase 13 — Integration & Testing

## Objective

Validate the entire application.

---

# 96. End-to-End Flow

The primary E2E workflow:

```text
Create Meeting
 ↓
Upload Transcript
 ↓
Process
 ↓
Extract
 ↓
Validate
 ↓
Create Review Items
 ↓
Review
 ↓
Approve / Edit
 ↓
View Action Items
 ↓
Export
```

---

# 97. Integration Tests

Test:

```text
Transcript
 ↓
Preprocessing
 ↓
AI Extraction
 ↓
Validation
 ↓
Database
 ↓
API
```

---

# 98. API Tests

Cover:

```text
Meetings
Transcripts
Actions
Reviews
Evaluations
Analytics
Export
```

---

# 99. AI Regression Tests

Maintain a fixed evaluation dataset.

Every significant prompt/model change should be tested against it.

---

# 100. Regression Principle

A change must not silently reduce extraction quality.

Track:

```text
Previous Metrics
Current Metrics
Difference
```

---

# 101. Phase 14 — UI/UX Refinement

## Objective

Perform systematic product polish.

---

# 102. Refinement Areas

Review:

```text
Typography
Spacing
Colors
Borders
Cards
Tables
Forms
Navigation
Loading
Empty States
Errors
Responsive Layout
Accessibility
```

---

# 103. Visual Consistency Audit

Check every page against:

```text
Design Tokens
Component System
Navigation Rules
Typography
Status Colors
Spacing
```

---

# 104. Interaction Audit

Check:

```text
Button feedback
Loading
Search
Filters
Sorting
Dialogs
Drawers
Tabs
Forms
Review workflow
```

---

# 105. Accessibility Audit

Check:

```text
Keyboard
Focus
Labels
Contrast
Semantic HTML
Screen reader behavior
Reduced motion
```

---

# 106. Responsive Audit

Test:

```text
Desktop
Laptop
Tablet
Narrow viewport
```

---

# 107. Phase 15 — Security & Performance

## Objective

Prepare the application for professional demonstration and deployment.

---

# 108. Security Checklist

Verify:

```text
[ ] Secrets not committed
[ ] Environment variables used
[ ] File validation
[ ] File size limits
[ ] Input validation
[ ] AI output validation
[ ] Safe error messages
[ ] No API keys in frontend
[ ] Sensitive transcript logging minimized
```

---

# 109. AI Security

Never expose:

```text
AI API keys
Internal prompts where inappropriate
Sensitive provider configuration
```

---

# 110. File Security

Uploaded files must be validated before processing.

Reject unsupported content.

---

# 111. Performance Areas

Review:

```text
Database queries
API response time
Frontend rendering
Large transcript handling
AI request frequency
Repeated API requests
Chart performance
```

---

# 112. AI Cost Control

Avoid unnecessary model calls.

Use:

```text
Deterministic validation
Caching where appropriate
Efficient prompts
Structured outputs
```

---

# 113. Phase 16 — Final Verification

## Objective

Perform a complete product audit.

---

# 114. Functional Verification

Verify:

```text
[ ] Meeting creation
[ ] File upload
[ ] Text extraction
[ ] AI extraction
[ ] Validation
[ ] Evidence
[ ] Review
[ ] Editing
[ ] Approval
[ ] Rejection
[ ] Action management
[ ] Dashboard
[ ] Insights
[ ] Evaluation
[ ] Export
```

---

# 115. Failure Verification

Test:

```text
[ ] Invalid file
[ ] Empty transcript
[ ] AI failure
[ ] Database failure
[ ] Invalid request
[ ] Missing data
[ ] Timeout
[ ] Duplicate
[ ] Ambiguous owner
[ ] Ambiguous deadline
```

---

# 116. UI Verification

Check:

```text
[ ] Consistent design
[ ] No broken layouts
[ ] No console errors
[ ] No dead buttons
[ ] Loading states
[ ] Empty states
[ ] Error states
[ ] Responsive layout
```

---

# 117. Documentation Verification

Ensure:

```text
[ ] README
[ ] PRD
[ ] SRS
[ ] Architecture
[ ] UI/UX
[ ] Development Plan
[ ] Evaluation
[ ] AGENTS
[ ] PROJECT_STATE
[ ] Environment documentation
```

---

# 118. Phase 17 — Demo & Documentation

## Objective

Prepare the project for internship evaluation, portfolio presentation, and technical demonstration.

---

# 119. Demo Dataset

Create a realistic sample meeting transcript.

It should contain:

```text
Multiple speakers
Explicit actions
Implicit commitments
Deadlines
Ambiguous deadline
Missing owner
Potential duplicate
Non-action discussion
```

---

# 120. Demo Flow

Recommended demonstration:

```text
1. Open Dashboard
2. Upload Meeting
3. Show Processing
4. Open Extracted Actions
5. Open Action Detail
6. Show Evidence
7. Show Confidence
8. Show Validation
9. Open Review Queue
10. Edit an Action
11. Approve it
12. Show Updated Dashboard
13. Show Insights
14. Open Evaluation Center
15. Show Evaluation Results
16. Export Action Items
```

---

# 121. Technical Demonstration

The project should demonstrate:

```text
AI Engineering
Backend Engineering
Frontend Engineering
Database Design
Validation
Evaluation
Human-in-the-loop AI
Explainability
Testing
Product UX
```

---

# 122. Git Workflow

Use meaningful commits.

Examples:

```text
feat: add meeting ingestion
feat: implement action extraction
feat: add review workflow
feat: add evaluation metrics
fix: handle ambiguous deadlines
test: add extraction regression tests
refactor: isolate AI provider
docs: update architecture
```

---

# 123. Commit Rules

Avoid commits such as:

```text
update
changes
final
new
test
asdf
```

Commit messages should communicate what changed.

---

# 124. Branching

For a solo project, a simple workflow is sufficient:

```text
main
  │
  └── feature branch
          ↓
       verify
          ↓
        merge
```

Do not create complex branching infrastructure unnecessarily.

---

# 125. Project State

`PROJECT_STATE.md` must always communicate:

```text
Current Phase
Completed Work
In Progress
Next Task
Known Issues
Blocked Tasks
Verification Status
```

---

# 126. AGENTS.md

`AGENTS.md` should contain permanent development rules.

It should define:

```text
Architecture Rules
Coding Rules
Testing Rules
UI Rules
Security Rules
AI Rules
Documentation Rules
Phase Rules
Git Rules
```

---

# 127. Definition of Done

A feature is DONE only when:

```text
[ ] Requirement implemented
[ ] API implemented where required
[ ] Database implemented where required
[ ] Frontend implemented where required
[ ] Unit tests written
[ ] Integration tests written where needed
[ ] Error handling implemented
[ ] Loading state implemented
[ ] Empty state implemented
[ ] Responsive behavior checked
[ ] Accessibility checked
[ ] UI refined
[ ] Documentation updated
[ ] PROJECT_STATE updated
```

---

# 128. MVP Definition of Done

The MVP is complete when the following workflow works reliably:

```text
Upload Transcript
      ↓
Extract Text
      ↓
AI Extracts Actions
      ↓
Validate Actions
      ↓
Calculate / Assess Confidence
      ↓
Attach Evidence
      ↓
Flag Review Items
      ↓
Human Review
      ↓
Finalize
      ↓
View Action Items
      ↓
Export
```

---

# 129. MVP Feature Checklist

```text
[ ] Meeting creation
[ ] TXT upload
[ ] PDF upload
[ ] DOCX upload
[ ] Direct text input
[ ] Transcript processing
[ ] Action extraction
[ ] Owner extraction
[ ] Deadline extraction
[ ] Status extraction
[ ] Confidence
[ ] Evidence
[ ] Validation
[ ] Duplicate detection
[ ] Review queue
[ ] Action editing
[ ] Approve
[ ] Reject
[ ] Dashboard
[ ] Meeting list
[ ] Action item list
[ ] Search
[ ] Filters
[ ] Sorting
[ ] CSV export
[ ] JSON export
[ ] Evaluation dataset
[ ] Evaluation run
[ ] Metrics
[ ] Failure analysis
```

---

# 130. Post-MVP Features

Only after MVP stability:

```text
Meeting summaries
Advanced analytics
Model comparison
Prompt comparison
Advanced search
Improved explainability
Advanced review workflow
```

---

# 131. Future Features

Future scope:

```text
Audio upload
Video processing
Automatic transcription
Google Calendar
Outlook
Slack
Teams
Zoom
Notion
Jira
Linear
Trello
Task synchronization
Team collaboration
Notifications
```

---

# 132. Explicitly Avoid Initially

Do not introduce:

```text
Microservices
Kubernetes
Complex event streaming
Multi-agent architecture
LLM fine-tuning
Enterprise SSO
Billing
Subscription management
Autonomous task execution
Voice assistant
Real-time meeting recording
```

unless project requirements materially change.

---

# 133. Scope Change Rule

Any new feature must be evaluated against:

```text
Core Product Value
AI Engineering Value
User Experience
Implementation Complexity
Testing Cost
Deadline Risk
Maintenance Cost
```

If a feature provides little value but significantly increases complexity, defer it.

---

# 134. Architecture Change Rule

If implementation reveals that the current architecture is insufficient:

```text
STOP
 ↓
Document Problem
 ↓
Analyze Alternatives
 ↓
Choose Simplest Valid Solution
 ↓
Update Architecture Document
 ↓
Update Development Plan
 ↓
Implement
```

Do not silently change architecture.

---

# 135. AI Change Rule

Any change to:

```text
Prompt
Model
Temperature / generation configuration
Output schema
Validation
Confidence logic
```

must trigger evaluation against the regression dataset.

---

# 136. Database Change Rule

Database schema changes must use migrations.

Never manually modify production schema without migration tracking.

---

# 137. API Change Rule

Breaking API changes require:

```text
Schema update
Documentation update
Frontend update
Tests
Verification
```

---

# 138. UI Change Rule

UI changes must preserve:

```text
Design System
Navigation
Accessibility
Responsive behavior
Core workflow
```

---

# 139. Testing Pyramid

Testing should follow:

```text
                 E2E
                /   \
          Integration
             /       \
           Unit Tests
```

Most logic should be covered by unit tests.

Critical workflows should have integration/E2E coverage.

---

# 140. Unit Testing Priority

High priority:

```text
Transcript preprocessing
Date parsing
Owner validation
Duplicate detection
Confidence calculation
Schema validation
Metric calculation
Export generation
```

---

# 141. Integration Testing Priority

High priority:

```text
Upload → Processing
Processing → Extraction
Extraction → Validation
Validation → Persistence
Review → Finalization
Evaluation → Results
```

---

# 142. E2E Testing Priority

Critical path:

```text
Upload
 ↓
Process
 ↓
Extract
 ↓
Review
 ↓
Approve
 ↓
Export
```

---

# 143. Test Data Strategy

Maintain:

```text
Normal transcripts
Edge cases
Invalid inputs
Ambiguous statements
No-action meetings
Large transcripts
Multiple-speaker meetings
```

---

# 144. Logging Strategy

Log operational events such as:

```text
Meeting created
Processing started
Processing completed
Extraction started
Validation completed
Review created
Evaluation started
Evaluation completed
```

Avoid logging sensitive transcript content unnecessarily.

---

# 145. Observability Strategy

Minimum useful observability:

```text
Application errors
Processing failures
AI failures
Validation failures
Evaluation failures
Request failures
```

---

# 146. Development Environment

Recommended local environment:

```text
Windows / Linux / macOS
Python
uv
Node.js
npm
Docker
PostgreSQL
Git
```

---

# 147. Local Development Flow

Backend:

```text
Start PostgreSQL
 ↓
Start Backend
 ↓
Run migrations
 ↓
Run tests
```

Frontend:

```text
Install dependencies
 ↓
Start development server
 ↓
Connect to backend
```

---

# 148. Docker Development

Docker should provide reproducibility.

At minimum:

```text
PostgreSQL
Backend
Frontend
```

Additional services should only be introduced when required.

---

# 149. Environment Separation

Support:

```text
Development
Testing
Production
```

Configuration should be environment-driven.

---

# 150. Documentation Workflow

Whenever implementation changes an architectural decision:

```text
Update Code
 ↓
Update Tests
 ↓
Update Documentation
 ↓
Update PROJECT_STATE
```

---

# 151. Development Order Summary

The recommended implementation order is:

```text
1. Foundation
2. Database
3. Backend Core
4. Ingestion
5. AI Extraction
6. Validation
7. Review
8. Frontend Foundation
9. Meeting Experience
10. Action Management
11. Dashboard
12. Evaluation
13. Export
14. Integration Testing
15. UI Refinement
16. Security & Performance
17. Final Verification
18. Demo
```

---

# 152. Critical Path

The most important technical path is:

```text
Transcript
    ↓
Preprocessing
    ↓
LLM
    ↓
Structured Extraction
    ↓
Validation
    ↓
Evidence
    ↓
Review
    ↓
Final Action Item
```

This path must receive the highest testing priority.

---

# 153. Critical Product Path

The most important user path is:

```text
Upload Meeting
    ↓
Wait for Processing
    ↓
See Extracted Actions
    ↓
Understand Evidence
    ↓
Resolve Review Items
    ↓
Approve
    ↓
Track Actions
```

---

# 154. Quality Gates

## Gate 1 — Foundation

```text
Application starts
Database connects
Frontend loads
```

---

## Gate 2 — Backend

```text
APIs work
Schemas validate
Database operations work
```

---

## Gate 3 — AI

```text
Structured extraction works
Malformed AI output is handled
```

---

## Gate 4 — Validation

```text
Invalid/ambiguous outputs are detected
```

---

## Gate 5 — Review

```text
Human can approve/edit/reject
```

---

## Gate 6 — Frontend

```text
Core workflow works through UI
```

---

## Gate 7 — Evaluation

```text
Metrics are reproducible
```

---

## Gate 8 — Final

```text
End-to-end demo works
Tests pass
Documentation is complete
```

---

# 155. Final Acceptance Criteria

MeetExtract AI is ready for final demonstration when:

```text
[ ] A user can upload a meeting transcript
[ ] The system extracts transcript text
[ ] AI identifies action items
[ ] Structured output is validated
[ ] Owners are extracted or marked unknown
[ ] Deadlines are extracted or marked ambiguous
[ ] Status is assigned
[ ] Confidence is represented
[ ] Evidence is displayed
[ ] Validation issues are detected
[ ] Duplicate candidates are flagged
[ ] Review items are created
[ ] User can edit actions
[ ] User can approve actions
[ ] User can reject actions
[ ] Final actions are trackable
[ ] Dashboard displays real metrics
[ ] Search works
[ ] Filters work
[ ] Sorting works
[ ] CSV export works
[ ] JSON export works
[ ] Evaluation dataset exists
[ ] Evaluation runs work
[ ] Metrics are calculated
[ ] Failure analysis works
[ ] Critical tests pass
[ ] UI is responsive
[ ] Accessibility basics are verified
[ ] Secrets are protected
[ ] Documentation is complete
[ ] Demo workflow works
```

---

# 156. Final Development Principle

The project should always optimize for:

```text
Reliable AI
    +
Strong Engineering
    +
Clear UX
    +
Measurable Evaluation
```

rather than simply maximizing the number of features.

---

# 157. Development Status

**Document:** `docs/05-development-plan.md`

**Version:** 1.0

**Status:** Draft

**Next Document:**

`docs/06-evaluation.md`

The evaluation document will define the exact evaluation dataset structure, ground truth format, extraction metrics, scoring rules, failure categories, regression testing, model/prompt comparison, and AI quality gates.

```
