# MeetExtract AI — AGENTS.md

# Master Development Rules

**Project:** MeetExtract AI  
**Version:** 1.0  
**Status:** Active Development  
**Purpose:** Permanent development instructions for all contributors and AI coding agents.

---

# 1. Project Identity

MeetExtract AI is an AI Meeting Intelligence Platform designed to transform unstructured meeting transcripts into:

- Structured action items
- Owners
- Deadlines
- Status
- Confidence
- Evidence
- Validation results
- Human-review decisions
- Evaluation metrics

Core product loop:

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

# 2. Primary Development Objective

Build a reliable AI engineering product rather than a simple LLM wrapper.

The final system must demonstrate:

```text
AI
+
Backend Engineering
+
Frontend Engineering
+
Database Design
+
Validation
+
Human-in-the-loop
+
Explainability
+
Evaluation
+
Testing
+
Professional UX
```

---

# 3. Source of Truth

Development decisions must follow this priority:

```text
1. Current User Requirements
2. docs/01-prd.md
3. docs/02-srs.md
4. docs/03-system-architecture.md
5. docs/04-ui-ux.md
6. docs/05-development-plan.md
7. docs/06-evaluation.md
8. PROJECT_STATE.md
9. Existing Implementation
```

If an existing implementation conflicts with the documented requirements, do not silently choose one.

Stop and determine which requirement should govern.

---

# 4. Core Development Philosophy

The project follows:

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

Code being written is not equivalent to a feature being complete.

---

# 5. Depth Over Breadth

Prioritize:

```text
Reliability
Correctness
Explainability
Evaluation
UX
Maintainability
```

over:

```text
Feature Count
Complex Infrastructure
Decorative Features
Premature Optimization
```

A smaller reliable system is preferred over a large unreliable system.

---

# 6. No Over-Engineering

Do not introduce architecture merely because it appears sophisticated.

Avoid unnecessary:

* Microservices
* Kubernetes
* Event buses
* Distributed systems
* Complex queues
* Multi-agent architectures
* LLM fine-tuning
* Enterprise infrastructure
* Complex orchestration
* Premature caching
* Unnecessary third-party services

Every infrastructure component must have a clear reason to exist.

---

# 7. MVP Discipline

MVP priorities are:

```text
Meeting ingestion
Transcript processing
AI action extraction
Owner extraction
Deadline extraction
Status extraction
Confidence
Evidence
Validation
Review workflow
Action management
Dashboard
Evaluation
Export
```

Do not allow secondary features to delay the core workflow.

---

# 8. Out-of-Scope Until Required

Do not implement initially:

```text
Live meeting recording
Video conferencing
Automatic audio processing
Calendar integrations
Slack integrations
Teams integrations
Zoom integrations
Autonomous task execution
Voice assistants
LLM fine-tuning
Multi-agent systems
Kubernetes
Microservices
Enterprise SSO
Billing
Subscriptions
Large-scale enterprise infrastructure
```

These may be considered after MVP stabilization.

---

# 9. Architecture Principles

The architecture must maintain clear separation of concerns.

Preferred flow:

```text
Frontend
   ↓
API
   ↓
Service Layer
   ↓
Business Logic
   ↓
Database / AI / External Services
```

Do not put business logic directly inside frontend components or API route handlers.

---

# 10. Backend Architecture Rule

Backend responsibilities should remain separated:

```text
API Layer
Service Layer
AI Layer
Validation Layer
Database Layer
Configuration Layer
```

Each layer should have a clear responsibility.

---

# 11. Frontend Architecture Rule

Frontend should separate:

```text
Pages
Components
API Client
Hooks
Types
UI Utilities
State
Styling
```

Avoid creating giant components.

---

# 12. Database Rule

Database models must represent actual domain concepts.

Core entities:

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

Do not add entities simply because they might become useful someday.

---

# 13. Database Migration Rule

All schema changes must use migrations.

Never modify the schema manually and leave migration history inconsistent.

Every database change must include:

```text
Model Change
+
Migration
+
Relevant Tests
```

---

# 14. API Rule

API contracts must be explicit.

Use:

```text
Pydantic schemas
```

for request and response validation.

Do not expose raw database models directly unless explicitly justified.

---

# 15. API Versioning

Primary API namespace:

```text
/api/v1
```

Future breaking changes should use an appropriate versioning strategy.

---

# 16. Error Handling Rule

Never silently swallow meaningful backend errors.

Errors should:

```text
Be classified
Be logged appropriately
Return safe user-facing messages
Preserve useful diagnostic information
```

Do not expose:

```text
Stack traces
API keys
Database credentials
Internal secrets
Sensitive provider information
```

to users.

---

# 17. AI Architecture Rule

The application must not depend directly on a single LLM provider throughout the codebase.

Use an abstraction such as:

```text
AIProvider
```

with provider-specific implementations behind it.

---

# 18. AI Output Rule

Never directly trust raw LLM output.

Required pipeline:

```text
LLM Output
 ↓
Structured Parsing
 ↓
Schema Validation
 ↓
Business Validation
 ↓
Confidence Assessment
 ↓
Persistence
```

---

# 19. AI Hallucination Rule

The AI must never be encouraged to invent:

```text
Owner
Deadline
Status
Evidence
Meeting information
```

When information is unavailable:

```text
Unknown
Ambiguous
Missing
```

should be used where appropriate.

---

# 20. Structured Output Rule

AI extraction should use structured output whenever supported.

Free-form output should not be directly persisted as action-item data.

---

# 21. Evidence Rule

Every extracted action should attempt to include supporting evidence.

Evidence may contain:

```text
Speaker
Timestamp
Transcript Segment
Source Location
```

Evidence must correspond to the extracted action.

---

# 22. Explainability Rule

Users should be able to understand:

```text
What was extracted
Why it was extracted
What evidence supports it
Why it requires review
How confident the system is
```

---

# 23. Confidence Rule

Confidence is not truth.

Do not treat an LLM-generated confidence value as ground truth.

Confidence should consider system-derived signals where possible.

Initial provisional bands:

```text
High: 90–100
Medium: 70–89
Low: 0–69
```

These may change based on evaluation evidence.

---

# 24. Validation Rule

Validation must be deterministic whenever practical.

Examples:

```text
Date validation
Schema validation
Required-field validation
Status validation
Evidence validation
Duplicate detection
```

Do not use an LLM for deterministic validation unless there is a strong reason.

---

# 25. Deadline Rule

Support:

```text
Explicit dates
Relative dates
Ambiguous dates
Missing dates
Invalid dates
Past dates
```

Relative dates must only be normalized when sufficient context exists.

---

# 26. Owner Rule

Owner values may be:

```text
Known
Unknown
Ambiguous
Missing
```

Never invent an owner.

---

# 27. Duplicate Rule

Potential duplicates must be:

```text
Detected
Flagged
Reviewed
```

They must not automatically be deleted.

---

# 28. Review Rule

Human review is a core system capability.

Review should be triggered for situations such as:

```text
Missing owner
Ambiguous owner
Ambiguous deadline
Low confidence
Potential duplicate
Validation failure
Evidence conflict
Insufficient evidence
```

---

# 29. Review State Rule

Valid review states:

```text
PENDING_REVIEW
REVIEWING
APPROVED
EDITED_AND_APPROVED
REJECTED
```

Invalid state transitions must be rejected.

---

# 30. Auditability Rule

Important human decisions should be traceable.

Where applicable store:

```text
Reviewer
Timestamp
Original value
Updated value
Decision
Reason
```

---

# 31. Evaluation Rule

AI changes must be evaluated.

Changes to:

```text
Model
Prompt
Extraction logic
Schema
Validation
Confidence
Date parsing
Owner resolution
Duplicate detection
```

must trigger appropriate regression testing.

---

# 32. Ground Truth Rule

Ground truth must come from manually verified data.

The model must never determine its own ground truth.

---

# 33. Evaluation Dataset Rule

Evaluation datasets must contain diverse cases:

```text
Explicit assignments
Implicit commitments
Relative dates
Missing owners
Ambiguous owners
Multiple speakers
Duplicates
Non-actions
Ambiguous statements
Multiple actions
```

---

# 34. Evaluation Metrics Rule

Track component-level metrics.

At minimum consider:

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

Metrics must have documented definitions.

---

# 35. Regression Rule

Maintain a regression dataset containing:

```text
Normal Cases
Edge Cases
Previously Failed Cases
Previously Fixed Cases
Critical Cases
```

Do not remove difficult examples merely because they reduce metrics.

---

# 36. Evaluation Comparison Rule

When comparing two models or prompts:

Keep constant where possible:

```text
Dataset
Ground Truth
Evaluation Rules
```

Change only the variable being evaluated.

---

# 37. Production vs Evaluation Rule

Production extraction and evaluation extraction should share the same core extraction implementation where practical.

Avoid maintaining two unrelated implementations.

---

# 38. Testing Philosophy

Testing must cover:

```text
Unit
Integration
API
AI Regression
End-to-End
```

Testing should focus heavily on business-critical logic.

---

# 39. Unit Test Priority

High-priority unit tests:

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

# 40. Integration Test Priority

Critical integration paths:

```text
Upload
 ↓
Processing
 ↓
Extraction
 ↓
Validation
 ↓
Persistence
```

and:

```text
Review
 ↓
Edit
 ↓
Approval
 ↓
Finalization
```

---

# 41. E2E Test Priority

Primary E2E flow:

```text
Upload Transcript
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

# 42. Testing Rule

A test should verify behavior, not merely code execution.

Bad:

```text
Function runs without crashing.
```

Better:

```text
Invalid relative deadline is detected
and the action enters review.
```

---

# 43. Mocking Rule

Use mocks for external dependencies where appropriate:

```text
LLM Provider
External APIs
Email
Storage
```

But do not replace all integration testing with mocks.

---

# 44. AI Test Boundary

Use real model evaluations for:

```text
Extraction quality
Prompt behavior
Model behavior
Structured output behavior
```

Use deterministic tests for:

```text
Validation
Date logic
Metrics
Database logic
Export
State transitions
```

---

# 45. Frontend UI Rule

The UI must be:

```text
Clean
Professional
Minimal
Information-dense
Responsive
Accessible
Fast-feeling
Consistent
```

---

# 46. UI Design Rules

Prefer:

```text
Strong typography
Clear hierarchy
Controlled spacing
Subtle borders
Moderate elevation
Consistent cards
Professional tables
Clear status indicators
```

---

# 47. Avoid Generic AI UI

Do not blindly use:

```text
Excessive gradients
Glassmorphism
Huge headings
Excessive rounded cards
Decorative animations
Random colors
AI-themed visual noise
```

The product should feel like professional engineering software.

---

# 48. Progressive UI Refinement

UI refinement does not have to wait until the entire application is complete.

After a feature becomes functionally stable:

```text
Functional Feature
 ↓
Interaction Verification
 ↓
UI Refinement
 ↓
Responsive Check
 ↓
Accessibility Check
```

---

# 49. Component Reuse Rule

If a UI pattern appears repeatedly, create a reusable component.

Examples:

```text
StatusBadge
ConfidenceBadge
DataTable
EmptyState
LoadingState
ErrorState
ReviewBanner
EvidencePanel
MetricCard
```

Avoid premature component abstraction for one-off elements.

---

# 50. Accessibility Rule

Interactive UI must support:

```text
Keyboard Navigation
Visible Focus
Semantic Controls
Meaningful Labels
Accessible Status Information
Sufficient Contrast
```

Color alone must not communicate important information.

---

# 51. Loading State Rule

Every potentially slow operation should have a clear loading state.

Examples:

```text
Meeting Processing
AI Extraction
Evaluation Run
Export Generation
```

---

# 52. Empty State Rule

Empty states should explain:

```text
What is empty
Why it is empty
What the user can do next
```

---

# 53. Error State Rule

Errors should:

```text
Explain what happened
Avoid technical noise
Provide recovery where possible
```

---

# 54. File Upload Rule

Validate:

```text
File type
File size
File readability
Extracted content
```

Do not assume that an extension guarantees valid content.

---

# 55. Transcript Processing Rule

Transcript processing should preserve information necessary for:

```text
Speaker identification
Evidence
Timestamps
Source locations
```

where available.

---

# 56. Data Integrity Rule

Never persist partially validated AI results as final data.

Preferred:

```text
Raw/temporary result
 ↓
Validation
 ↓
Review status
 ↓
Final result
```

---

# 57. State Management Rule

Use explicit state machines where workflow states matter.

Examples:

```text
Meeting Processing
Review
Evaluation Run
```

Avoid scattered boolean flags such as:

```text
is_done
is_processed
is_reviewed
is_approved
```

when a finite state model is more appropriate.

---

# 58. Security Rules

Never commit:

```text
.env
API keys
Passwords
Database credentials
Private certificates
Tokens
```

Use:

```text
.env.example
```

for documented configuration.

---

# 59. Logging Rule

Do not log sensitive transcript content unnecessarily.

Prefer:

```text
Meeting ID
Action ID
Processing state
Error category
Request ID
```

over full transcript text.

---

# 60. Secret Handling

Secrets must remain server-side.

Frontend code must never contain private AI provider keys.

---

# 61. Input Validation Rule

Validate all external inputs.

This includes:

```text
HTTP requests
Files
Query parameters
Path parameters
AI output
Database-bound values
```

---

# 62. Performance Rule

Do not optimize blindly.

First identify actual bottlenecks.

Prioritize:

```text
Database queries
AI requests
Large transcript processing
Frontend rendering
Repeated network calls
```

---

# 63. AI Cost Rule

Avoid unnecessary LLM calls.

Prefer deterministic logic where sufficient.

---

# 64. API Request Rule

Frontend should use a centralized API client.

Do not duplicate API URL construction throughout the application.

---

# 65. Configuration Rule

Configuration must come from environment variables or appropriate configuration files.

Never hard-code:

```text
API keys
Production URLs
Credentials
Environment-specific secrets
```

---

# 66. Dependency Rule

Do not add a dependency unless:

```text
It provides clear value
The functionality cannot reasonably be implemented simply
It is maintained
It does not introduce unnecessary complexity
```

---

# 67. Repository Hygiene

Do not commit:

```text
node_modules
__pycache__
.venv
.env
build artifacts
temporary files
IDE caches
large generated files
```

---

# 68. File Organization

Use predictable directories.

Do not place unrelated logic into generic files such as:

```text
utils.py
helpers.ts
misc.ts
```

unless the contents genuinely belong together.

---

# 69. Naming Rule

Use descriptive names.

Prefer:

```text
action_item_service.py
deadline_validator.py
evaluation_runner.py
review_queue.tsx
```

over:

```text
service.py
helper.py
data.py
component2.tsx
```

---

# 70. Type Safety

Avoid unnecessary:

```text
any
```

in TypeScript.

Use explicit interfaces/types.

Python code should use type hints for important service boundaries.

---

# 71. Function Size

Functions should have one clear responsibility.

If a function becomes difficult to understand or test, split it.

Do not split functions merely to reduce line count.

---

# 72. Service Boundaries

A service should represent meaningful business functionality.

Examples:

```text
MeetingService
TranscriptService
ActionItemService
ReviewService
EvaluationService
```

---

# 73. AI Service Boundary

AI service should be responsible for:

```text
Prompt Construction
Provider Invocation
Structured Response Parsing
Provider Error Handling
```

It should not own:

```text
Database transactions
Frontend state
Review UI
```

---

# 74. Validation Boundary

Validation logic should be reusable outside API handlers.

Do not bury validation inside route functions.

---

# 75. Transaction Rule

Database operations that represent one logical state transition should use appropriate transaction boundaries.

Avoid partial persistence.

---

# 76. Concurrency Rule

When operations can run concurrently, consider:

```text
Duplicate processing
Conflicting updates
Evaluation runs
Review edits
```

Do not assume all operations happen sequentially.

---

# 77. Idempotency

Where appropriate, operations such as processing or evaluation should avoid accidentally creating duplicate results.

---

# 78. Retry Rule

Only retry operations that are safe to retry.

Do not blindly retry:

```text
Database writes
State transitions
External side effects
```

without considering duplication.

---

# 79. AI Provider Failure

If the AI provider fails:

```text
Do not fabricate output
Do not mark processing complete
Preserve error state
Allow retry where appropriate
```

---

# 80. User Experience During AI Processing

AI processing may take time.

The UI must communicate:

```text
Processing
Current state where useful
Completion
Failure
```

Do not make the application appear frozen.

---

# 81. Documentation Rule

Every significant architectural or behavioral change must update documentation.

Potential documents:

```text
PRD
SRS
Architecture
UI/UX
Development Plan
Evaluation
README
PROJECT_STATE
```

Only update documents that are actually affected.

---

# 82. PROJECT_STATE Rule

After each meaningful milestone update:

```text
PROJECT_STATE.md
```

It must identify:

```text
Current Phase
Completed Work
Current Work
Next Work
Known Issues
Blocked Items
Verification Status
```

---

# 83. Phase Rule

Do not move to the next phase simply because the current phase's code has been written.

The phase must pass its acceptance criteria.

---

# 84. Phase Gate

Every phase follows:

```text
Implementation
 ↓
Tests
 ↓
Manual Verification
 ↓
Documentation
 ↓
PROJECT_STATE Update
 ↓
Phase Complete
```

---

# 85. Scope Change Rule

When a new requirement appears:

```text
STOP
 ↓
Determine Impact
 ↓
Check PRD/SRS
 ↓
Check Architecture
 ↓
Check Timeline
 ↓
Decide Whether Scope Changes
 ↓
Update Documentation
 ↓
Implement
```

Do not silently expand scope.

---

# 86. Architecture Change Rule

If the current architecture becomes insufficient:

```text
STOP
 ↓
Document Problem
 ↓
Consider Alternatives
 ↓
Select Simplest Valid Architecture
 ↓
Update Architecture
 ↓
Update Development Plan
 ↓
Implement
 ↓
Test
```

---

# 87. Proactive Engineering Rule

If the current implementation plan is likely to create:

```text
Technical Debt
Security Problems
Performance Problems
Evaluation Problems
UX Problems
Architectural Problems
```

the issue must be identified before continuing.

Do not blindly follow an outdated plan.

---

# 88. AI Coding Agent Rule

An AI coding agent must:

```text
Read AGENTS.md
Read PROJECT_STATE.md
Read relevant docs
Inspect existing implementation
Understand dependencies
Plan changes
Implement incrementally
Run tests
Verify behavior
Update documentation
Update PROJECT_STATE
```

---

# 89. No Blind Overwriting

Do not replace large parts of the project without first understanding existing implementation.

Preserve working functionality.

---

# 90. Existing Code Rule

Before modifying a file:

```text
Read it
Understand its purpose
Check callers
Check tests
Then modify it
```

---

# 91. Refactoring Rule

Refactoring should preserve behavior unless the task explicitly changes behavior.

After refactoring:

```text
Run tests
Compare behavior
Check affected flows
```

---

# 92. Frontend Refactoring Rule

Do not rewrite the entire frontend merely to improve one page.

Prefer targeted improvements.

---

# 93. Database Refactoring Rule

Database changes must consider:

```text
Existing data
Migration safety
Foreign keys
Indexes
Application compatibility
```

---

# 94. API Refactoring Rule

Before changing an API:

```text
Find frontend consumers
Find tests
Find documentation
Update all affected areas
```

---

# 95. Test Failure Rule

When tests fail:

```text
Do not immediately modify the test just to make it pass.
```

First determine:

```text
Is the implementation wrong?
Is the test wrong?
Did the requirement change?
```

---

# 96. Bug Fix Rule

A bug fix should ideally include:

```text
Bug reproduction
Fix
Regression test
Verification
```

---

# 97. Security Bug Rule

Security issues receive priority over cosmetic work.

---

# 98. Critical Failure Rule

Critical AI failures such as:

```text
Fabricated owner
Fabricated deadline
False evidence
Corrupted data
```

must be treated seriously even if aggregate metrics appear acceptable.

---

# 99. Evaluation Before Optimization

Do not optimize prompts/models based only on intuition.

Use evaluation evidence whenever possible.

---

# 100. UI Before/After Verification

For major UI changes, verify:

```text
Functionality
Visual consistency
Responsive behavior
Accessibility
```

---

# 101. Design System Rule

Maintain consistent:

```text
Typography
Spacing
Colors
Borders
Radius
Shadows
Icons
Status indicators
```

Do not introduce one-off styles without reason.

---

# 102. Color Rule

Color should communicate meaning consistently.

Examples:

```text
Success
Warning
Error
Information
Neutral
```

Do not assign random colors to statuses.

---

# 103. Animation Rule

Animations should communicate state or improve interaction.

Avoid animation solely for decoration.

---

# 104. Responsive Rule

Desktop is the primary target, but the application must remain usable on:

```text
Laptop
Tablet
Narrow viewport
```

---

# 105. Demo Rule

The demo must use:

```text
Real application functionality
Safe sample data
Real evaluation results
```

Do not fake core metrics or workflow states.

---

# 106. Demo Reliability

Before a demo:

```text
Run application
Test upload
Test extraction
Test review
Test dashboard
Test evaluation
Test export
```

---

# 107. README Rule

README must explain:

```text
What MeetExtract AI is
Why it exists
Core capabilities
Architecture
Technology stack
Setup
Running locally
Testing
Evaluation
Project structure
Demo workflow
```

---

# 108. Git Commit Convention

Preferred format:

```text
feat:
fix:
refactor:
test:
docs:
chore:
```

Examples:

```text
feat: implement transcript ingestion
feat: add action validation
fix: handle ambiguous deadlines
test: add duplicate detection tests
refactor: isolate AI provider
docs: update evaluation specification
```

---

# 109. Branch Rule

Simple development workflow:

```text
main
 ↓
feature branch
 ↓
implementation
 ↓
tests
 ↓
verification
 ↓
merge
```

Do not introduce complicated branching unnecessarily.

---

# 110. Pull Request / Merge Checklist

Before merging:

```text
[ ] Requirement satisfied
[ ] Tests pass
[ ] No obvious regressions
[ ] Documentation updated
[ ] PROJECT_STATE updated
[ ] No secrets
[ ] UI checked where applicable
[ ] Evaluation performed where applicable
```

---

# 111. Environment Rule

Maintain:

```text
.env.example
```

with placeholders only.

Never commit real values.

---

# 112. Local Reproducibility

A new developer should be able to understand how to:

```text
Install dependencies
Configure environment
Start database
Run migrations
Start backend
Start frontend
Run tests
```

from the repository documentation.

---

# 113. Docker Rule

Docker should make the project easier to reproduce.

Do not turn Docker into an unnecessarily complex infrastructure layer.

---

# 114. CI Rule

CI should eventually verify:

```text
Backend tests
Frontend checks
Linting
Type checking
Critical evaluation tests
Build
```

---

# 115. CI AI Cost Rule

Do not execute expensive full-model evaluations on every commit unless the project's cost and infrastructure make that reasonable.

Use targeted regression tests in normal CI.

---

# 116. Release Checklist

Before a release/demo version:

```text
[ ] Tests pass
[ ] Build succeeds
[ ] Environment documented
[ ] Database migration verified
[ ] AI provider configured
[ ] Sample data available
[ ] No secrets committed
[ ] README updated
[ ] Evaluation results available
[ ] Critical workflow verified
```

---

# 117. Final Product Quality Model

Quality should be evaluated across:

```text
Correctness
Reliability
AI Quality
Explainability
UX
Security
Performance
Maintainability
Evaluation
Documentation
```

---

# 118. Core User Workflow

The following workflow is the highest-priority product path:

```text
Upload Meeting
      ↓
Process Transcript
      ↓
Extract Actions
      ↓
Validate
      ↓
Show Evidence
      ↓
Flag Uncertainty
      ↓
Review
      ↓
Approve / Edit
      ↓
Track
      ↓
Export
```

Every major architectural decision should preserve this workflow.

---

# 119. Core Engineering Workflow

Development should follow:

```text
Requirement
 ↓
Design
 ↓
Implementation
 ↓
Automated Test
 ↓
Manual Verification
 ↓
Evaluation
 ↓
UI Refinement
 ↓
Documentation
 ↓
Project State
```

---

# 120. Final Rule

Do not optimize for:

```text
"How much code can we write?"
```

Optimize for:

```text
"How reliably can MeetExtract AI turn a real meeting
into trustworthy, explainable, measurable action items?"
```

That is the primary engineering objective of the project.

---

# 121. AGENTS.md Status

**Document:** `AGENTS.md`

**Version:** 1.0

**Status:** Active
