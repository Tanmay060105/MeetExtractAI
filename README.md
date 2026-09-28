# MeetExtract AI

> Turn meetings into accountable action.

MeetExtract AI is an AI-powered meeting intelligence platform that transforms unstructured meeting transcripts into structured, validated, explainable, and actionable work items.

Instead of treating meeting summaries as the final output, MeetExtract AI focuses on the operational information that matters:

- What needs to be done?
- Who owns it?
- When is it due?
- What is its current status?
- How confident is the system?
- What evidence supports the extraction?
- Does the item require human review?

---

## 1. Product Overview

MeetExtract AI follows the workflow:

```text
Ingest
  ↓
Understand
  ↓
Extract
  ↓
Validate
  ↓
Evaluate
  ↓
Review
  ↓
Finalize
  ↓
Export
  ↓
Measure
```

The platform combines:

```text
AI Extraction
+
Structured Data
+
Validation
+
Confidence
+
Evidence
+
Human Review
+
Analytics
+
Evaluation
```

The goal is to make AI-generated meeting actions useful, measurable, and trustworthy.

**Current Project Status**: All development phases (0-15) have been implemented and verified. The project has reached its final delivery state (Phase 16).

---

# 2. Core Problem

Meeting transcripts contain important commitments and decisions, but they are usually unstructured.

A typical transcript may contain:

```text
"We should probably update the API next week.
Tanmay, can you take care of that?
Let's try to have it done by Friday."
```

A useful meeting intelligence system should convert this into something like:

```text
Task:
Update the API

Owner:
Tanmay

Deadline:
Friday

Status:
Pending

Confidence:
High

Evidence:
"Tanmay, can you take care of that?"

Review:
Not Required
```

When the transcript does not contain enough reliable information, the system should not invent the missing information.

Instead, it should identify the uncertainty and route the item for human review.

---

# 3. Key Features

## Meeting Ingestion

Supported MVP inputs:

* TXT
* PDF
* DOCX
* Direct text

The ingestion layer extracts and normalizes transcript content while preserving speaker and timestamp information when available.

---

## AI Action Extraction

MeetExtract AI identifies potential action items from transcripts.

Each action can contain:

```text
Task
Owner
Deadline
Status
Confidence
Evidence
Validation State
Review State
```

The AI output is converted into structured data rather than being treated as free-form text.

---

## Validation

AI output passes through deterministic validation before becoming trusted application data.

Validation includes:

* Missing owners
* Unknown owners
* Ambiguous owners
* Invalid deadlines
* Unparseable deadlines
* Relative deadlines
* Overdue deadlines
* Invalid statuses
* Duplicate candidates
* Missing evidence
* Evidence conflicts
* Insufficient information

---

## Confidence

The system assigns confidence information to extracted actions.

Initial confidence bands:

```text
High      90–100
Medium    70–89
Low       0–69
```

These thresholds are provisional.

They must be validated through the evaluation system rather than being treated as automatically correct.

LLM self-reported confidence must not be blindly trusted.

---

## Evidence and Explainability

Every extracted action should provide supporting evidence where possible.

Evidence can include:

```text
Speaker
Timestamp
Transcript Segment
Source Sentence
```

The purpose is to allow a human reviewer to understand why the system created an action.

---

## Human Review

Uncertain or problematic actions can enter the review workflow.

```text
Pending Review
      ↓
Reviewing
      ↓
Approved
   OR
Edited & Approved
   OR
Rejected
```

Review can be triggered by:

* Low confidence
* Missing owner
* Ambiguous deadline
* Duplicate candidate
* Validation failure
* Evidence conflict
* Insufficient reliable information

---

# 4. Action Item Management

Users can manage extracted actions using:

### Statuses

```text
Pending
In Progress
Completed
Blocked
Needs Review
```

### Filters

```text
All
Pending
Completed
Overdue
Needs Review
Unassigned
```

### Search

Users can search by:

```text
Task
Owner
Meeting
```

### Sorting

Actions can be sorted by:

```text
Deadline
Confidence
Status
Created Date
Meeting
```

---

# 5. Meeting Workspace

Each meeting provides:

```text
Overview
Transcript
Action Items
Review
Insights
```

The meeting workspace is designed around the complete lifecycle of extracted actions rather than only displaying an AI-generated summary.

---

# 6. Dashboard

The dashboard provides a high-level view of meeting activity.

Primary metrics include:

```text
Total Meetings
Total Actions
Completed Actions
Pending Actions
Review Items
Average Confidence
Completion Rate
```

---

# 7. Insights and Analytics

MeetExtract AI can analyze:

```text
Status Distribution
Owner Distribution
Meeting Distribution
Confidence Distribution
Completion Trends
Deadline Distribution
```

These analytics help users understand how meeting commitments are being created and completed.

---

# 8. Evaluation Center

Evaluation is a core part of the product.

MeetExtract AI is not considered complete simply because an LLM produces plausible-looking output.

The extraction pipeline must be measurable.

The Evaluation Center supports:

```text
Evaluation Dataset
Ground Truth
Evaluation Runs
Predictions
Metric Calculation
Failure Analysis
Regression Testing
Model/Prompt Comparison
```

---

## Evaluation Dataset

The dataset should contain cases such as:

* Explicit assignments
* Implicit commitments
* Relative deadlines
* Missing owners
* Ambiguous owners
* Multiple speakers
* Duplicate actions
* Non-action statements
* Ambiguous statements
* Multiple actions in one statement

---

## Evaluation Metrics

The evaluation system can measure:

```text
Action Precision
Action Recall
Action F1

Task Accuracy
Owner Accuracy
Deadline Accuracy
Status Accuracy

Evidence Validity

Review Precision
Review Recall
```

Metrics should be calculated against human-defined ground truth.

---

# 9. AI Pipeline

The high-level processing pipeline is:

```text
                    ┌─────────────────┐
                    │    Transcript   │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Preprocessing  │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  AI Extraction  │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Schema Validate │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   Intelligence  │
                    │   Validation    │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   Confidence    │
                    │   + Evidence    │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Review Rules   │
                    └────────┬────────┘
                             │
                    ┌────────┴────────┐
                    ▼                 ▼
              ┌───────────┐     ┌───────────┐
              │  Trusted  │     │   Review  │
              │   Action  │     │   Queue   │
              └───────────┘     └───────────┘
```

---

# 10. Architecture

MeetExtract AI uses a modular application architecture.

```text
┌─────────────────────────────────────────────┐
│                 Frontend                    │
│          Next.js + TypeScript               │
└──────────────────┬──────────────────────────┘
                   │
                   │ HTTP API
                   ▼
┌─────────────────────────────────────────────┐
│                  Backend                    │
│              FastAPI + Python               │
├─────────────────────────────────────────────┤
│ API Layer                                   │
│ Service Layer                               │
│ Validation Layer                            │
│ AI Integration Layer                        │
│ Evaluation Layer                            │
└──────────────────┬──────────────────────────┘
                   │
          ┌────────┼─────────┐
          │        │         │
          ▼        ▼         ▼
     PostgreSQL   AI       Storage
                  API
```

The architecture prioritizes:

* Separation of concerns
* Typed interfaces
* Boundary validation
* Testability
* Clear error handling
* AI provider abstraction
* Secure configuration
* Minimal unnecessary infrastructure

---

# 11. Technology Stack

## Frontend

```text
Next.js
TypeScript
Tailwind CSS
```

## Backend

```text
Python
FastAPI
Pydantic
```

## Database

```text
PostgreSQL
SQLAlchemy
Alembic
```

## AI

```text
LLM API
Structured Output
AI Provider Abstraction
```

## Testing

```text
pytest
API Testing
Integration Testing
AI Evaluation
Regression Testing
```

## Infrastructure

```text
Docker
Git
GitHub
```

---

# 12. Project Structure

The planned repository structure is:

```text
meetextract-ai/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── hooks/
│   └── types/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── validators/
│   │   ├── ai/
│   │   └── evaluation/
│   │
│   ├── tests/
│   └── alembic/
│
├── docs/
│   ├── 01-prd.md
│   ├── 02-srs.md
│   ├── 03-system-architecture.md
│   ├── 04-ui-ux.md
│   ├── 05-development-plan.md
│   └── 06-evaluation.md
│
├── tests/
├── data/
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

The exact implementation structure may evolve during development if justified by architecture or maintainability requirements.

---

# 13. API Domains

The primary API domains are:

```text
/meetings
/transcripts
/action-items
/reviews
/evaluations
/analytics
```

The exact endpoint contracts are defined in:

```text
docs/02-srs.md
```

The SRS should be treated as the source of truth for API behavior.

---

# 14. Database Entities

The core domain entities are:

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

Relationships and constraints are defined in:

```text
docs/03-system-architecture.md
```

---

# 15. Security Principles

MeetExtract AI follows these rules:

```text
Secrets must never be committed.

Environment variables must be used for secrets.

Uploaded files must be validated.

User input must be validated.

AI output must be validated.

Sensitive transcript information should not be unnecessarily logged.

Production and development configuration must be separated.

Authentication and authorization must be enforced at the appropriate boundaries.
```

---

# 16. Error Handling

The application should handle:

* Invalid files
* Unsupported formats
* Large files
* Empty transcripts
* Malformed AI output
* AI API failures
* AI timeouts
* Database failures
* Invalid state transitions
* Validation failures
* Unexpected application errors

Errors should be:

```text
Predictable
Structured
Actionable
Safe
```

Internal implementation details and secrets must not be exposed to end users.

---

# 17. Testing Strategy

Testing follows multiple levels.

```text
Unit Tests
    ↓
Integration Tests
    ↓
API Tests
    ↓
AI Evaluation
    ↓
Regression Tests
    ↓
End-to-End Tests
```

Important areas include:

* Transcript preprocessing
* File extraction
* Date validation
* Owner validation
* Duplicate detection
* Schema validation
* Confidence calculation
* Review rules
* API behavior
* Database constraints
* AI extraction
* Evaluation metrics
* Export
* Complete user workflow

---

# 18. Development Methodology

Development follows:

```text
Plan
 ↓
Implement
 ↓
Test
 ↓
Verify
 ↓
Refine
 ↓
Document
 ↓
Update Project State
```

A feature is not complete merely because code has been written.

A feature is complete when it has been:

```text
Implemented
+
Tested
+
Verified
+
Documented
```

---

# 19. Development Phases

The project is developed in phases:

```text
Phase 0   Project Foundation (COMPLETE)
Phase 1   Database Architecture (COMPLETE)
Phase 2   Backend Core (COMPLETE)
Phase 3   Transcript Ingestion (COMPLETE)
Phase 4   AI Extraction Pipeline (COMPLETE)
Phase 5   Validation + Confidence + Evidence (COMPLETE)
Phase 6   Review Workflow (COMPLETE)
Phase 7   Action Item Management (COMPLETE)
Phase 8   Dashboard + Meetings UI (COMPLETE)
Phase 9   Insights + Analytics (COMPLETE)
Phase 10  Evaluation Center (COMPLETE)
Phase 11  Export (COMPLETE)
Phase 12  Security + Performance Hardening (COMPLETE)
Phase 13  UI/UX Refinement (COMPLETE)
Phase 14  Full Testing + Verification (COMPLETE)
Phase 15  Demo + Deployment Readiness (COMPLETE)
```

Detailed implementation planning is available in:

```text
docs/05-development-plan.md
```

---

# 20. UI/UX Principles

The interface should be:

```text
Clean
Modern
Professional
Minimal
Information-Dense
Responsive
Accessible
Fast-Feeling
```

Design should use:

* Strong typography
* Consistent spacing
* Subtle borders
* Controlled elevation
* Clear hierarchy
* Professional data visualization
* Consistent icons
* Restrained interactions

Avoid:

* Excessive gradients
* Excessive glassmorphism
* Unnecessary animations
* Decorative UI
* Huge headings
* Excessive rounded cards
* Random colors
* Generic AI-template aesthetics
* Visual clutter

UI/UX should be refined progressively as functionality becomes stable.

---

# 21. MVP Scope

The MVP focuses on depth rather than breadth.

### Included

```text
Transcript ingestion
TXT/PDF/DOCX/direct text
Transcript processing
AI action extraction
Owner extraction
Deadline extraction
Status extraction
Confidence
Evidence
Validation
Duplicate detection
Review queue
Action management
Dashboard
Meetings
Search
Filtering
Export
Evaluation dataset
Ground truth
Evaluation runs
Metrics
Failure analysis
```

### Not Initially Included

```text
Live meeting recording
Video conferencing
Automatic audio processing
Calendar integrations
Slack integration
Teams integration
Zoom integration
Autonomous task execution
Voice assistant
LLM fine-tuning
Multi-agent architecture
Kubernetes
Microservices
Enterprise SSO
Billing/subscriptions
Large-scale enterprise infrastructure
```

Additional features must be evaluated against the project's scope-management rules before implementation.

---

# 22. Future Direction

Potential future evolution:

```text
Audio
  ↓
Transcription
  ↓
Meeting Intelligence
  ↓
Action Extraction
  ↓
Validation
  ↓
Calendar / Task Management
  ↓
Team Collaboration
```

Potential integrations include:

```text
Google Calendar
Outlook
Slack
Microsoft Teams
Notion
Jira
Linear
Trello
```

These are future possibilities and are not part of the initial MVP unless the project scope is explicitly changed.

---

# 23. Current Project Status

```text
Documentation:        COMPLETE
Repository:           NOT STARTED
Frontend:             NOT STARTED
Backend:              NOT STARTED
Database:             NOT STARTED
AI Pipeline:          NOT STARTED
Validation:           NOT STARTED
Review Workflow:      NOT STARTED
Analytics:            NOT STARTED
Evaluation:           NOT STARTED
Export:               NOT STARTED
Testing:              NOT STARTED
Deployment:           NOT STARTED
```

The project is currently at:

```text
PHASE 0 — PROJECT FOUNDATION
```

---

# 24. Getting Started

The implementation environment will use Docker for local infrastructure.

After the foundation phase is implemented, the expected workflow will be:

```bash
git clone <repository>
cd meetextract-ai
```

Create environment configuration:

```bash
cp .env.example .env
```

Start the development environment:

```bash
docker compose up --build
```

The exact commands may be updated during Phase 0 once the final repository structure and service configuration are implemented.

Do not assume these commands are currently functional before Phase 0 verification is complete.

---

# 25. Environment Variables

Environment configuration will be documented in:

```text
.env.example
```

Secrets must only exist in local or deployment environment configuration.

Never commit:

```text
.env
```

or real API keys, database credentials, tokens, or other secrets.

---

# 26. Documentation

Project documentation:

```text
docs/
├── 01-prd.md
├── 02-srs.md
├── 03-system-architecture.md
├── 04-ui-ux.md
├── 05-development-plan.md
└── 06-evaluation.md
```

Project governance:

```text
AGENTS.md
PROJECT_STATE.md
```

---

# 27. Source of Truth

When documents or implementation decisions conflict, use this priority:

```text
1. Current explicit project requirements
2. PRD
3. SRS
4. System Architecture
5. UI/UX Specification
6. Development Plan
7. Evaluation Specification
8. AGENTS.md
9. PROJECT_STATE.md
10. Existing Implementation
```

If a conflict is discovered, stop and resolve the conflict before implementing affected functionality.

Do not silently choose a conflicting implementation.

---

# 28. AI Engineering Principles

MeetExtract AI is intended to demonstrate AI engineering rather than simply API integration.

Important principles:

```text
Structured AI output
+
Deterministic validation
+
Evidence
+
Confidence
+
Human review
+
Evaluation
+
Regression testing
```

The system must distinguish between:

```text
What the transcript actually says
```

and:

```text
What the AI believes the transcript means
```

AI output must therefore pass through validation before being treated as reliable application data.

---

# 29. Quality Philosophy

The project prioritizes:

```text
Depth > Breadth
Reliability > Feature Count
Measured AI > Unverified AI
Explainability > Black Box Output
Human Review > Blind Automation
Maintainability > Unnecessary Complexity
```

---

# 30. Contribution / AI Coding Rules

Before making significant changes:

```text
1. Read AGENTS.md
2. Read relevant project documentation
3. Check PROJECT_STATE.md
4. Understand existing implementation
5. Plan the change
6. Implement the smallest appropriate change
7. Test
8. Verify
9. Update documentation
10. Update PROJECT_STATE.md
```

Do not introduce architecture changes without justification.

Do not add dependencies without a clear reason.

Do not create unnecessary abstractions.

Do not implement future features prematurely.

---

# 31. Scope Change Rules

A proposed feature should be evaluated against:

```text
Core Product Value
AI Engineering Value
User Value
Technical Complexity
Maintenance Cost
Testing Cost
Demo Value
Deadline Risk
```

A feature should not be added merely because it sounds impressive.

The primary objective is to build a coherent and technically credible product.

---

# 32. License

License information will be finalized during project foundation setup.

---

# 33. Current Next Step

The next implementation milestone is:

```text
PHASE 0 — PROJECT FOUNDATION
```

The first objective is to establish a reproducible development environment and repository structure before implementing product functionality.

---

# 34. Project State

Current state:

```text
MeetExtract AI
Documentation Baseline Complete
Implementation Not Started
Phase 0 Ready
```

The next major deliverable after repository foundation is:

```text
Database Architecture
```

followed by:

```text
Backend Core
```

and then the complete AI extraction and validation pipeline.

```
