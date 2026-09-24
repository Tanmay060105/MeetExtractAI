# MeetExtract AI — Product Requirements Document

**Document:** `docs/01-prd.md`  
**Version:** 1.0  
**Status:** Draft  
**Product:** MeetExtract AI  
**Category:** AI Meeting Intelligence Platform  
**Primary Platform:** Web Application

---

# 1. Product Overview

## 1.1 Product Name

MeetExtract AI

## 1.2 Product Tagline

> Turn meetings into accountable action.

## 1.3 Product Description

MeetExtract AI is an AI-powered meeting intelligence platform that transforms unstructured meeting transcripts into structured, validated, explainable, and actionable work items.

The platform analyzes meeting transcripts and identifies:

- Actionable tasks
- Responsible people
- Deadlines
- Status
- Confidence
- Supporting evidence
- Potential validation issues

The system then validates the extracted information, identifies uncertain or potentially incorrect results, and routes those items into a human review workflow.

MeetExtract AI also provides:

- Meeting management
- Action-item management
- Meeting summaries
- Meeting insights
- Analytics
- Search and filtering
- Human review
- Explainability
- AI evaluation
- Failure analysis
- Data export

The product is designed to demonstrate practical AI engineering rather than functioning as a simple LLM wrapper.

---

# 2. Problem Statement

Meetings contain important decisions, commitments, deadlines, and responsibilities, but this information is usually embedded inside unstructured conversation.

For example:

> "I'll prepare the campaign proposal by Friday."

A human can understand that this represents an action item, but a conventional system may not automatically identify:

- What needs to be done
- Who is responsible
- When it is due
- Whether the task is still pending

MeetExtract AI converts these unstructured conversations into structured action items.

Example:

```text
Task:
Prepare campaign proposal

Owner:
Priya

Deadline:
October 5, 2026

Status:
Pending

Confidence:
94%
```

The internship project requirements specifically define the core problem as converting meeting transcripts into structured action items containing the task, owner, deadline, and confidence, while also validating dates, missing owners, and duplicate tasks.

---

# 3. Product Vision

MeetExtract AI aims to become a lightweight meeting intelligence system that does more than summarize conversations.

Its primary purpose is to identify:

> What needs to happen next, who needs to do it, and when it needs to happen.

The long-term vision is to transform unstructured meeting conversations into structured, verifiable work.

---

# 4. Core Product Principle

> Don't just summarize the meeting. Understand what needs to happen next.

The system should prioritize actionable information while maintaining transparency about uncertainty.

AI-generated results should not automatically be treated as guaranteed truth.

The system should provide:

* Confidence
* Evidence
* Validation
* Human review

when appropriate.

---

# 5. Core Product Loop

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

---

# 6. Product Goals

## 6.1 Primary Goals

1. Convert meeting transcripts into structured action items.
2. Identify task owners.
3. Extract deadlines from natural language.
4. Determine action-item status.
5. Provide confidence information.
6. Provide supporting transcript evidence.
7. Validate extracted information.
8. Detect missing owners.
9. Detect problematic dates.
10. Detect duplicate action items.
11. Identify uncertain results.
12. Provide a human review workflow.
13. Measure extraction quality.
14. Provide a professional meeting dashboard.
15. Provide action-item management.
16. Provide useful meeting insights.
17. Provide export functionality.
18. Provide a clean and professional user experience.
19. Demonstrate practical AI engineering.
20. Provide sufficient technical depth for internship evaluation.

---

# 7. Target Users

## 7.1 Primary User

### Individual Professional

A person who participates in meetings and wants meeting discussions converted into actionable work.

Typical needs:

* Upload transcript
* Extract tasks
* Identify owners
* Identify deadlines
* Review uncertain results
* Export action items

---

## 7.2 Secondary User

### Team Lead / Project Manager

A person who needs to understand what was decided during meetings and track resulting work.

Typical needs:

* View meetings
* Review action items
* Filter by owner
* Track status
* Identify overdue tasks
* Review uncertain AI results

---

## 7.3 Evaluation User

### Internship Evaluator / Technical Reviewer

A person evaluating the technical quality of the project.

The evaluator should be able to understand:

* The product purpose
* AI pipeline
* Extraction quality
* Validation system
* Human review
* Evaluation metrics
* UI/UX
* Engineering architecture

---

# 8. User Personas

## Persona 1 — Meeting Participant

Needs:

* Fast transcript processing
* Clear action items
* Minimal manual work
* Confidence in extracted information

---

## Persona 2 — Team Lead

Needs:

* Overview of meeting outcomes
* Action-item tracking
* Ownership visibility
* Deadline visibility
* Review workflow

---

## Persona 3 — Evaluator

Needs:

* Clear demonstration
* Measurable AI performance
* Professional UI
* Technical documentation
* Reproducible project

---

# 9. Core User Journey

```text
User opens MeetExtract
        ↓
Dashboard
        ↓
Upload / Paste Transcript
        ↓
Transcript Processing
        ↓
AI Extraction
        ↓
Schema Validation
        ↓
Intelligence Validation
        ↓
Confidence Assessment
        ↓
Results
        ↓
┌──────────────────┬──────────────────┐
│ High Confidence  │ Needs Review     │
│                  │                  │
│ Ready            │ Human Review     │
└────────┬─────────┴────────┬─────────┘
         │                  │
         │             Edit / Approve
         │                  │
         └──────────┬───────┘
                    ↓
             Final Action Items
                    ↓
          Dashboard / Analytics
                    ↓
                  Export
```

---

# 10. Product Modules

The application will contain the following major modules:

```text
MeetExtract AI
│
├── Dashboard
│
├── Meetings
│   ├── All Meetings
│   ├── Upload Meeting
│   └── Meeting Details
│
├── Action Items
│
├── Review Queue
│
├── Insights
│
├── Evaluation Center
│
└── Settings
```

---

# 11. Dashboard

The dashboard is the primary overview of the system.

## 11.1 Dashboard Requirements

The dashboard should display:

* Total meetings
* Total action items
* Completed action items
* Pending action items
* Items requiring review
* Average confidence
* Recent meetings
* Recent action items
* Basic activity information

---

## 11.2 Dashboard Example

```text
Meetings
24

Action Items
67

Completed
42

Pending
19

Needs Review
6

Average Confidence
89%
```

---

# 12. Meeting Ingestion

Users must be able to provide meeting transcripts.

## 12.1 Supported Inputs

Initial supported inputs:

* TXT
* PDF
* DOCX
* Direct text input

---

## 12.2 Upload Requirements

The system should:

1. Validate file type.
2. Validate file size.
3. Extract text.
4. Detect empty or invalid documents.
5. Display processing state.
6. Handle extraction errors gracefully.

---

## 12.3 Future Inputs

Potential future capabilities:

* Audio transcription
* Video transcription
* Meeting platform integrations

These are outside the initial MVP.

---

# 13. Transcript Processing

The transcript-processing layer prepares input for AI extraction.

## 13.1 Processing Requirements

The system should:

1. Extract text.
2. Normalize formatting.
3. Preserve speaker information where available.
4. Preserve timestamps where available.
5. Segment transcript content.
6. Remove irrelevant formatting.
7. Prepare structured input for the AI extraction layer.

---

# 14. AI Action-Item Extraction

This is the primary AI capability.

The system should identify actionable commitments from the transcript.

## 14.1 Extraction Fields

Each action item should contain:

```text
Task
Owner
Deadline
Status
Confidence
Evidence
Source Location
Validation Information
```

---

# 15. Action Item Schema

Conceptually:

```text
ActionItem
├── id
├── meeting_id
├── task
├── owner
├── deadline
├── status
├── confidence
├── evidence
├── source_location
├── validation_status
├── review_status
├── created_at
└── updated_at
```

The exact technical schema will be finalized in the SRS.

---

# 16. Example Extraction

Input:

```text
Rahul:
We need the Q4 campaign proposal ready by October 5.

Priya:
I'll prepare the campaign proposal.

Rahul:
Tanmay, please review the analytics before Friday.
```

Expected structured result:

```text
Action Item 1

Task:
Prepare the Q4 campaign proposal

Owner:
Priya

Deadline:
October 5

Status:
Pending

Confidence:
High

Evidence:
"I'll prepare the campaign proposal."
```

```text
Action Item 2

Task:
Review the analytics

Owner:
Tanmay

Deadline:
Friday

Status:
Pending

Confidence:
High

Evidence:
"Tanmay, please review the analytics before Friday."
```

---

# 17. AI Model Layer

The AI extraction system should use an LLM or transformer-based model.

The model layer must be isolated from the rest of the application.

Conceptually:

```text
Application
      ↓
Extraction Service
      ↓
Model Abstraction
      ↓
LLM / Transformer
      ↓
Structured Output
```

This allows the underlying model provider to be changed without redesigning the application.

---

# 18. Structured Output Requirement

The AI should not return arbitrary natural-language output as the primary extraction result.

The extraction layer should produce a predictable structured representation.

Example:

```text
{
    task,
    owner,
    deadline,
    status,
    confidence,
    evidence
}
```

The backend must validate the structure before accepting the result.

---

# 19. Schema Validation

The backend should validate:

* Required fields
* Data types
* Status values
* Date formats
* Confidence range
* String lengths
* Nested structures

Invalid AI output should not be silently persisted.

---

# 20. Validation Engine

The validation engine evaluates extracted action items after AI extraction.

The internship requirements specifically require validation for:

* Dates
* Missing owners
* Duplicate tasks

---

## 20.1 Date Validation

The system should identify:

* Invalid dates
* Unparseable dates
* Ambiguous dates
* Relative dates
* Potentially overdue deadlines

Examples:

```text
"next Friday"
"by tomorrow"
"October 5"
"end of the month"
```

Relative dates should be resolved using the meeting date when sufficient information is available.

---

## 20.2 Owner Validation

The system should identify:

* Missing owner
* Unknown owner
* Ambiguous owner
* Multiple possible owners

Example:

```text
Task:
Prepare financial report

Owner:
Unknown

Status:
Needs Review
```

---

## 20.3 Duplicate Detection

The system should identify potentially duplicated tasks.

Example:

```text
Prepare marketing report.

Create marketing report.

Finish the marketing report.
```

The system should flag these as potential duplicates rather than automatically deleting them.

---

# 21. Confidence System

Every action item should contain a confidence value or confidence category.

Example:

```text
High
90–100

Medium
70–89

Low
0–69
```

These thresholds are initial design placeholders and must be validated during implementation and evaluation.

The system should not assume that an LLM's raw self-reported confidence is automatically calibrated.

The final confidence methodology will be defined during the SRS and evaluation phases.

---

# 22. Human Review Queue

The Review Queue handles uncertain or invalid results.

## 22.1 Review Triggers

An item may require review when:

* Owner is missing
* Deadline is ambiguous
* Confidence is low
* Duplicate is detected
* Validation fails
* AI output conflicts with available evidence
* Required information cannot be reliably extracted

---

## 22.2 Review States

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

---

# 23. Review Interface

The user should be able to:

* View task
* View owner
* View deadline
* View status
* View confidence
* View transcript evidence
* Edit task
* Assign owner
* Change deadline
* Change status
* Approve
* Reject

---

# 24. Explainability

Every extracted action item should provide supporting evidence from the transcript whenever possible.

Example:

```text
Task
Prepare Q4 campaign proposal

Owner
Priya

Deadline
October 5

Evidence

"I'll prepare the campaign proposal."

"We need this ready by October 5."
```

The purpose is to make the AI output easier to verify.

---

# 25. Source Location

Where possible, each action item should reference its source location.

Possible source information:

```text
Speaker
Timestamp
Transcript segment
Sentence
```

Example:

```text
Speaker:
Priya

Timestamp:
00:14:32

Evidence:
"I'll prepare the campaign proposal."
```

---

# 26. Meeting Details

Each processed meeting should have a dedicated page.

## 26.1 Meeting Sections

```text
Overview
Transcript
Action Items
Review Items
Insights
```

---

## 26.2 Meeting Overview

Display:

* Meeting title
* Processing date
* Participants
* Total action items
* Completed items
* Pending items
* Review items
* Confidence summary

---

# 27. Meeting Summary

The system may generate a concise meeting summary.

The summary may include:

* Main discussion topics
* Key decisions
* Important outcomes
* Action items

The summary is secondary to the primary action-item extraction workflow.

---

# 28. Action-Item Management

The application should provide a centralized action-item workspace.

## 28.1 Filters

```text
All
Pending
Completed
Overdue
Needs Review
Unassigned
```

---

## 28.2 Search

Users should be able to search by:

* Task
* Owner
* Meeting

---

## 28.3 Sorting

Potential sorting options:

* Deadline
* Confidence
* Status
* Created date
* Meeting

---

# 29. Action Item Status

Initial supported statuses:

```text
Pending
In Progress
Completed
Blocked
Needs Review
```

The final status vocabulary will be confirmed in the SRS.

---

# 30. Insights

MeetExtract should provide meeting-level insights.

Potential insights include:

* Number of actions
* Number of assigned actions
* Number of unassigned actions
* Completion rate
* High-risk review items
* Deadline distribution
* Participant action distribution

Insights should remain focused on the meeting/action-item domain.

---

# 31. Analytics Dashboard

The analytics page should provide a high-level overview.

## 31.1 Metrics

```text
Total Meetings
Total Action Items
Completed Items
Pending Items
Review Items
Average Confidence
Completion Rate
```

---

## 31.2 Visualizations

Potential visualizations:

* Action items by status
* Action items by owner
* Action items by meeting
* Confidence distribution
* Completion trends

Visualizations should be useful rather than decorative.

---

# 32. Evaluation Center

The Evaluation Center measures AI extraction quality.

The internship project requires evaluation of extraction accuracy.

---

## 32.1 Evaluation Workflow

```text
Evaluation Dataset
        ↓
Run Extraction
        ↓
Compare Predictions
        ↓
Ground Truth
        ↓
Calculate Metrics
        ↓
Analyze Errors
        ↓
Generate Evaluation Report
```

---

# 33. Evaluation Dataset

The project should maintain a labeled evaluation dataset.

Each dataset entry should contain:

```text
Transcript
Ground Truth Action Items
Expected Task
Expected Owner
Expected Deadline
Expected Status
```

---

# 34. Evaluation Dataset Coverage

The dataset should include:

### Simple Cases

Direct assignments:

```text
"Priya will prepare the report."
```

### Implicit Commitments

```text
"I'll take care of the report."
```

### Relative Dates

```text
"I'll finish this by Friday."
```

### Missing Owners

```text
"Someone needs to update the dashboard."
```

### Multiple Speakers

```text
Speaker A:
Can someone prepare the report?

Speaker B:
I'll do it.
```

### Duplicate Tasks

Multiple statements representing the same task.

### Non-Action Statements

Statements that should not become action items.

### Ambiguous Statements

Statements where the correct action or owner is unclear.

---

# 35. Evaluation Metrics

The system should evaluate extraction at the field level where appropriate.

Potential metrics:

* Task extraction accuracy
* Owner accuracy
* Deadline accuracy
* Status accuracy
* Precision
* Recall
* F1-score
* Exact matching
* Partial matching

The final metric definitions will be documented in the Evaluation Specification.

---

# 36. Failure Analysis

Evaluation should not only produce a single score.

The system should identify common failure types.

Example:

```text
Evaluation Result

Overall Quality
91.4%

Failure Types

Missing Owner
4

Incorrect Deadline
3

Duplicate Extraction
2

False Action
2
```

This allows us to understand and improve model behavior.

---

# 37. Evaluation Comparison

Where possible, the Evaluation Center should support comparing:

```text
Model / Prompt Version
        ↓
Evaluation Run
        ↓
Metrics
        ↓
Failure Analysis
```

This allows future improvements to be measured objectively.

---

# 38. Export

Users should be able to export finalized action items.

Initial formats:

* CSV
* JSON

Potential future formats:

* PDF
* Calendar format
* Task-management integrations

---

# 39. API

MeetExtract should expose backend APIs.

Initial API domains:

```text
/meetings
/transcripts
/action-items
/reviews
/evaluations
/analytics
```

Exact endpoints and request/response contracts will be defined in the SRS.

---

# 40. UI/UX Vision

The application should look like a professional AI SaaS product rather than a basic academic prototype.

## Design Principles

* Clean
* Modern
* Professional
* Minimal
* Information-dense
* Consistent
* Responsive
* Accessible
* Fast-feeling
* Clear hierarchy

---

# 41. Visual Design Direction

The visual language should use:

* Strong typography
* Consistent spacing
* Subtle borders
* Controlled elevation
* Clear cards
* Professional data visualization
* Consistent iconography
* Carefully used color
* Clear status indicators
* Smooth but restrained interactions

---

# 42. Design Anti-Patterns

Avoid:

* Excessive gradients
* Excessive glassmorphism
* Unnecessary animations
* Decorative UI without purpose
* Huge headings that waste space
* Excessive rounded cards
* Random colors
* Generic AI-template aesthetics
* Cluttered dashboards

The interface should prioritize usability and clarity.

---

# 43. Application Navigation

Proposed navigation:

```text
Dashboard

Meetings
    All Meetings
    Upload Meeting

Action Items

Review Queue

Insights

Evaluation

Settings
```

---

# 44. Dashboard UX

The dashboard should communicate the most important information immediately.

Primary areas:

```text
Header
   ↓
Overview Metrics
   ↓
Recent Meetings
   ↓
Action Item Activity
   ↓
Review Queue
   ↓
Insights
```

---

# 45. Meeting Upload UX

The upload experience should be simple.

Example flow:

```text
Upload Transcript
       ↓
File Validation
       ↓
Processing
       ↓
Extraction
       ↓
Validation
       ↓
Results
```

The UI should clearly communicate progress.

---

# 46. Application States

Every important feature must handle:

## Loading

```text
Processing transcript...

Extracting action items...

Validating results...
```

## Empty

```text
No meetings yet.

Upload your first transcript to get started.
```

## Error

```text
We couldn't process this transcript.

Please check the file and try again.
```

## Success

```text
Meeting processed successfully.

12 action items extracted.
```

## Review Required

```text
3 action items require your attention.
```

---

# 47. Responsive Design

The interface should work across:

* Desktop
* Laptop
* Tablet

Desktop will be the primary target because the application is an internship demonstration and data-heavy workflows benefit from larger screens.

---

# 48. Accessibility

The interface should aim to provide:

* Keyboard navigation
* Clear focus states
* Sufficient contrast
* Semantic controls
* Meaningful labels
* Accessible status indicators
* Non-color-only status communication

---

# 49. Technical Architecture Principles

The system should follow:

1. Separation of concerns.
2. Modular architecture.
3. Typed interfaces.
4. Validation at system boundaries.
5. Testability.
6. Clear error handling.
7. Environment-based configuration.
8. AI provider abstraction.
9. Secure secret management.
10. Minimal unnecessary infrastructure.

---

# 50. Proposed Technology Stack

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
Structured output
```

## Testing

```text
Pytest
```

## Infrastructure

```text
Docker
Git
GitHub
```

The internship specification suggests Python for preparation/modeling, Git/GitHub for version control, and a simple Streamlit/API layer where appropriate. The project will use a dedicated web frontend plus API architecture to support the richer product experience.

---

# 51. Data Model — High-Level

The initial conceptual entities are:

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

The exact relationships, constraints, indexes, and database schema will be defined in the SRS.

---

# 52. Security Requirements

The application should follow basic secure engineering practices.

Requirements:

* API keys must not be committed.
* Secrets must use environment variables.
* Uploaded files must be validated.
* File size must be limited.
* User input must be validated.
* AI output must be validated.
* Errors should not expose secrets.
* Sensitive transcript content should not be unnecessarily logged.
* `.env` files must be excluded from Git.
* Production configuration must be separated from development configuration.

---

# 53. Performance Requirements

The system should provide a responsive experience for normal internship-scale workloads.

Requirements:

* Display processing states.
* Avoid unnecessary API calls.
* Avoid unnecessary LLM calls.
* Validate before persistence.
* Handle model/API failures gracefully.
* Avoid blocking the UI unnecessarily.
* Keep transcript processing modular.

Exact performance targets will be defined after the architecture and implementation strategy are finalized.

---

# 54. Observability

The application should provide useful application-level logs.

Example events:

```text
Transcript received
Processing started
Text extraction completed
AI extraction started
AI extraction completed
Validation started
Validation completed
Review required
Meeting saved
Evaluation started
Evaluation completed
```

Sensitive transcript content should not be unnecessarily written into logs.

---

# 55. Error Handling

The application should handle:

* Unsupported files
* Corrupted documents
* Empty transcripts
* AI API failures
* Rate limits
* Invalid model output
* Validation failures
* Database failures
* Export failures

The user should receive understandable error messages.

Technical details should be logged appropriately without exposing sensitive information.

---

# 56. Testing Strategy

Testing will be divided into several layers.

## 56.1 Unit Tests

Test:

* Text preprocessing
* Date handling
* Validation
* Duplicate detection
* Schema validation
* Status validation
* Confidence logic

---

## 56.2 Integration Tests

Test:

```text
Transcript
    ↓
Extraction
    ↓
Validation
    ↓
Persistence
```

---

## 56.3 API Tests

Test:

* Meeting creation
* Transcript upload
* Processing
* Action retrieval
* Review
* Export
* Evaluation

---

## 56.4 AI Evaluation

Test:

* Ground-truth comparison
* Field-level extraction
* Failure cases
* Model/prompt changes
* Regression cases

---

# 57. Development Methodology

MeetExtract AI will follow a phased development approach.

Every phase follows:

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

No phase should be considered complete until its acceptance criteria are verified.

---

# 58. Progressive UI/UX Refinement

UI/UX refinement should happen progressively.

Once a feature becomes functionally stable:

```text
Functional Feature
       ↓
UI Implementation
       ↓
UX Review
       ↓
Visual Refinement
       ↓
Interaction Refinement
       ↓
Verification
```

UI/UX should not be postponed until the very end.

---

# 59. Scope Management

The project should prioritize:

```text
Depth > Breadth
```

We should prefer making the core meeting-intelligence workflow excellent rather than adding many unrelated features.

New features should be evaluated against:

1. Does it improve the core product?
2. Does it demonstrate useful AI engineering?
3. Does it improve user experience?
4. Is it worth the implementation complexity?
5. Does it risk the internship submission deadline?

---

# 60. MVP Scope

The MVP must include:

## Ingestion

* TXT
* PDF
* DOCX
* Text input

## AI

* Transcript processing
* Action-item extraction
* Owner extraction
* Deadline extraction
* Status extraction
* Confidence
* Evidence

## Validation

* Date validation
* Missing-owner detection
* Duplicate detection
* Schema validation

## Review

* Review queue
* Edit
* Approve
* Reject

## Product

* Dashboard
* Meetings
* Meeting details
* Action items
* Search
* Filters
* Export

## Evaluation

* Evaluation dataset
* Ground truth
* Extraction evaluation
* Metrics
* Failure analysis

## Engineering

* FastAPI
* Next.js
* PostgreSQL
* Tests
* Docker
* Git/GitHub
* Documentation

---

# 61. Enhanced Features

After MVP stability, the following features may be implemented:

* Meeting summaries
* Meeting insights
* Analytics
* Advanced filtering
* Advanced search
* Model/prompt comparison
* Rich evaluation dashboard
* Detailed explainability
* Improved review workflows

These features must not compromise MVP completion.

---

# 62. Explicitly Out of Scope

The following are not part of the initial project:

* Live meeting recording
* Video conferencing
* Automatic video processing
* Calendar integration
* Slack integration
* Microsoft Teams integration
* Zoom integration
* Autonomous task execution
* Voice assistant
* LLM fine-tuning
* Multi-agent architecture
* Kubernetes
* Microservices
* Enterprise SSO
* Billing/subscriptions
* Large-scale multi-tenant infrastructure

These may be considered future product opportunities but should not be implemented during the initial internship project unless the project timeline allows them without affecting core quality.

---

# 63. Success Criteria

MeetExtract AI will be considered successful when:

## Functional Success

A user can:

```text
Upload transcript
      ↓
Process transcript
      ↓
Extract action items
      ↓
View results
      ↓
Review uncertain items
      ↓
Finalize actions
      ↓
Export results
```

---

## AI Success

The system should demonstrate measurable extraction performance using a labeled evaluation dataset.

---

## Validation Success

The system should identify:

* Missing owners
* Invalid/ambiguous dates
* Potential duplicates

as required by the internship project specification.

---

## UX Success

A new user should be able to understand the workflow without requiring technical instructions.

---

## Engineering Success

The codebase should be:

* Modular
* Tested
* Documented
* Reproducible
* Configurable
* Maintainable

---

## Presentation Success

The application should demonstrate:

* Professional UI/UX
* AI functionality
* Explainability
* Human review
* Evaluation
* Practical engineering

---

# 64. Demo Success Criteria

The ideal internship demonstration should be able to show:

```text
1. Open Dashboard
        ↓
2. Upload Meeting Transcript
        ↓
3. Process Transcript
        ↓
4. Show Extracted Actions
        ↓
5. Open Action Item
        ↓
6. Show Evidence + Confidence
        ↓
7. Show Validation
        ↓
8. Open Review Queue
        ↓
9. Edit/Approve Item
        ↓
10. Show Analytics
        ↓
11. Open Evaluation Center
        ↓
12. Show Evaluation Results
```

The complete demonstration should communicate the product's purpose within a short period.

---

# 65. Documentation Requirements

The repository should contain:

```text
docs/
├── 01-prd.md
├── 02-srs.md
├── 03-system-architecture.md
├── 04-ui-ux.md
├── 05-development-plan.md
└── 06-evaluation.md
```

Additional project-control documents:

```text
AGENTS.md
PROJECT_STATE.md
README.md
```

---

# 66. Project Development Rules

The project will follow these rules:

1. Do not silently change requirements.
2. Do not implement features without understanding their purpose.
3. Do not over-engineer infrastructure.
4. Do not treat LLM output as automatically correct.
5. Validate structured AI output.
6. Preserve evidence for AI-generated results where possible.
7. Test important functionality.
8. Maintain project documentation.
9. Update project state after each phase.
10. Refine UI/UX progressively.
11. Prioritize depth over unnecessary breadth.
12. Protect secrets and credentials.
13. Keep the repository reproducible.
14. Prefer simple architecture when it satisfies the requirement.
15. Stop and reassess if implementation decisions conflict with the product requirements.

---

# 67. Future Product Direction

Potential future capabilities include:

```text
Audio
  ↓
Automatic Transcription
  ↓
Meeting Intelligence
  ↓
Action Extraction
  ↓
Calendar Integration
  ↓
Task Management
  ↓
Team Collaboration
```

Potential integrations:

* Google Calendar
* Microsoft Outlook
* Slack
* Microsoft Teams
* Notion
* Jira
* Linear
* Trello

These are future possibilities and are not part of the initial internship implementation.

---

# 68. Final Product Definition

MeetExtract AI is an AI-powered meeting intelligence platform that transforms meeting transcripts into structured, validated, explainable, and actionable work items.

The product combines:

```text
AI Extraction
      +
Structured Data
      +
Validation
      +
Confidence
      +
Explainability
      +
Human Review
      +
Analytics
      +
Evaluation
      +
Professional UX
```

The primary outcome is:

> A reliable workflow for turning unstructured meeting conversations into accountable action items.

---

# 69. PRD Status

**Version:** 1.0
**Status:** Draft for implementation planning
**Primary Requirement:** AI meeting action-item extraction
**Product Direction:** Feature-rich AI SaaS application
**UI/UX Direction:** Professional modern SaaS
**Engineering Direction:** Modular, testable, documented, and practical
**Development Method:** Phased development with continuous verification

---

# Next Document

After this PRD is approved, the next document will be:

`docs/02-srs.md`

The SRS will convert these product requirements into precise technical specifications, including:

* Detailed functional requirements
* System actors
* Use cases
* Database entities
* Data relationships
* API contracts
* Request/response schemas
* AI extraction contract
* Validation rules
* Review workflow
* Evaluation workflow
* Error states
* Security requirements
* Non-functional requirements
* Acceptance criteria
