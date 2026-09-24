# MeetExtract AI — UI/UX Specification

**Document:** `docs/04-ui-ux.md`  
**Version:** 1.0  
**Status:** Draft  
**Product:** MeetExtract AI  
**Related Documents:**
- `docs/01-prd.md`
- `docs/02-srs.md`
- `docs/03-system-architecture.md`

---

# 1. UI/UX Purpose

The MeetExtract AI interface must communicate one core idea:

> Turn unstructured meetings into clear, accountable work.

The interface should make AI-generated information easy to:

- Understand
- Verify
- Correct
- Approve
- Track
- Evaluate

The UI is not merely a dashboard around an AI model.

The interface is part of the human-in-the-loop intelligence workflow.

---

# 2. Core UX Philosophy

The product should feel:

```text
Professional
Modern
Calm
Focused
Trustworthy
Information-dense
Fast
Structured
```

It should not feel:

```text
Generic AI Template
Over-designed
Gaming-inspired
Visually noisy
Overly futuristic
Decorative
Unnecessarily complex
```

---

# 3. Primary UX Principle

The most important question on every page should be:

> What does the user need to understand or do next?

The interface should prioritize that action.

---

# 4. Core Product Loop

The UI should visually support:

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

---

# 5. UX Hierarchy

Information hierarchy should generally follow:

```text
1. Page Purpose
2. Primary Action
3. Important State
4. Core Data
5. Validation / Explanation
6. Secondary Information
7. Advanced Details
```

---

# 6. Visual Direction

The design language should use:

* Strong typography
* Generous but controlled spacing
* Subtle borders
* Moderate corner radius
* Restrained shadows
* Clear cards
* Professional tables
* Consistent icons
* Minimal decoration
* Clear status indicators

---

# 7. Design Anti-Patterns

Avoid:

* Excessive gradients
* Glassmorphism everywhere
* Giant hero sections
* Excessive rounded cards
* Excessive shadows
* Neon colors
* Random colors
* Excessive animations
* Decorative AI particles
* Huge headings
* Unnecessary illustrations
* Overloaded dashboards
* Generic "AI magic" visuals

---

# 8. Layout System

The application uses a desktop-first dashboard layout.

Conceptually:

```text
┌────────────────────────────────────────────────────────────┐
│ Top Header                                                 │
├───────────────┬────────────────────────────────────────────┤
│               │                                            │
│   Sidebar     │               Main Content                 │
│               │                                            │
│ Navigation    │                                            │
│               │                                            │
│               │                                            │
└───────────────┴────────────────────────────────────────────┘
```

---

# 9. Sidebar

The sidebar contains primary navigation.

```text
MeetExtract AI

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

# 10. Sidebar Behavior

Desktop:

* Persistent sidebar
* Fixed width
* Clear active state

Tablet:

* Collapsible sidebar

Small viewport:

* Compact navigation or drawer

---

# 11. Sidebar Active State

The active navigation item should use:

* Strong text
* Subtle background
* Clear visual indicator

The active state should not rely solely on color.

---

# 12. Sidebar Grouping

Navigation should be visually grouped.

Example:

```text
WORKSPACE

Dashboard
Meetings
Action Items
Review Queue

ANALYTICS

Insights
Evaluation

SYSTEM

Settings
```

---

# 13. Header

The top header should contain:

```text
Page Context
Search where appropriate
Secondary actions
User/Profile control
```

The header should remain visually lightweight.

---

# 14. Breadcrumbs

Breadcrumbs may be used on deeper pages.

Example:

```text
Meetings / Product Planning / Action Items
```

Breadcrumbs should not appear unnecessarily on top-level pages.

---

# 15. Page Container

Primary content should use a constrained content width.

Recommended:

```text
max-width:
1280px - 1440px
```

depending on page density.

---

# 16. Grid System

Use a consistent responsive grid.

Examples:

```text
4-column metric grid
3-column card grid
2-column detail layout
Full-width table
```

---

# 17. Spacing System

Use a consistent spacing scale.

Recommended base:

```text
4px
8px
12px
16px
20px
24px
32px
40px
48px
64px
```

Avoid arbitrary spacing values unless necessary.

---

# 18. Typography

Typography should prioritize readability.

Hierarchy:

```text
Display
Page Title
Section Heading
Subheading
Body
Secondary Text
Metadata
Caption
```

---

# 19. Typography Rules

Page title:

```text
Large
Strong
Compact
```

Section title:

```text
Medium
Semibold
```

Body:

```text
Readable
Normal weight
Comfortable line height
```

Metadata:

```text
Smaller
Muted
```

Avoid excessively large text.

---

# 20. Color System

The color system should be restrained.

Conceptual categories:

```text
Primary
Background
Surface
Border
Text
Muted Text
Success
Warning
Danger
Info
```

---

# 21. Primary Color

A single primary accent should be used consistently for:

* Primary buttons
* Active controls
* Links
* Focus states
* Important interactive elements

Avoid multiple competing accent colors.

---

# 22. Semantic Colors

Semantic colors should represent state.

```text
Success → Completed / Approved
Warning → Needs Review / Ambiguous
Danger → Failed / Rejected / Blocked
Info → Processing / Informational
Neutral → Pending / Unknown
```

Color should never be the only indicator.

---

# 23. Surface System

Use a small number of surfaces.

Example:

```text
Application Background
Card Surface
Elevated Surface
Input Surface
```

Cards should not all have heavy shadows.

---

# 24. Border System

Borders should be subtle.

Use borders primarily to:

* Separate sections
* Define cards
* Structure tables
* Define inputs
* Separate navigation areas

---

# 25. Border Radius

Use moderate radius values.

Suggested:

```text
Inputs:
8px

Cards:
10px - 12px

Large panels:
12px - 16px

Buttons:
8px - 10px
```

Avoid excessive pill-shaped elements.

Pills should mainly be used for statuses or compact metadata.

---

# 26. Shadow System

Shadows should be subtle.

Use elevation mainly for:

* Dropdowns
* Dialogs
* Floating panels
* Important overlays

Do not use heavy shadows on every card.

---

# 27. Icon System

Icons should be:

* Consistent
* Simple
* Recognizable
* Meaningful

Avoid mixing multiple icon styles.

Icons should support text rather than replace important labels.

---

# 28. Button System

Button hierarchy:

```text
Primary
Secondary
Tertiary
Danger
Icon
```

---

# 29. Primary Button

Used for:

* Upload Meeting
* Process Meeting
* Save
* Approve
* Run Evaluation

Only one primary action should dominate a section where possible.

---

# 30. Secondary Button

Used for:

* Cancel
* Edit
* View Details
* Retry
* Export

---

# 31. Danger Button

Used for:

* Reject
* Delete
* Destructive operations

Destructive actions should require appropriate confirmation.

---

# 32. Button States

Every interactive button should support:

```text
Default
Hover
Focus
Active
Disabled
Loading
```

---

# 33. Form System

Forms should use:

```text
Label
Input
Helper Text
Validation
Error
```

Example:

```text
Meeting Title

[ Product Planning Meeting ]

Enter a descriptive meeting name.
```

---

# 34. Input Requirements

Inputs should provide:

* Visible labels
* Clear focus state
* Validation feedback
* Useful placeholder where necessary

Do not use placeholder text as the only label.

---

# 35. Table System

Tables are important for action-item management.

Required features:

* Clear column headers
* Row hover
* Sort controls
* Filter controls
* Pagination where necessary
* Empty state
* Loading state

---

# 36. Action Item Table

Recommended columns:

```text
Task
Owner
Deadline
Status
Confidence
Review
Meeting
```

---

# 37. Table Density

Action-item tables should be information-dense without becoming difficult to scan.

Use:

```text
Compact but readable rows
Clear column alignment
Consistent metadata
```

---

# 38. Status Badges

Status badges may represent:

```text
Pending
In Progress
Completed
Blocked
Needs Review
Approved
Rejected
```

Use text + color + optional icon.

---

# 39. Confidence Display

Confidence should be shown in a simple and understandable format.

Example:

```text
94%
High
```

or:

```text
Confidence
94%
```

Avoid making confidence appear more statistically precise than it actually is.

---

# 40. Confidence Bands

Initial display bands:

```text
High:
90–100%

Medium:
70–89%

Low:
0–69%
```

These thresholds are provisional and should be validated through evaluation.

---

# 41. Confidence Explanation

Users should be able to understand why an item has lower confidence.

Possible signals:

```text
Missing owner
Ambiguous deadline
Weak evidence
Validation conflict
Duplicate candidate
```

---

# 42. Dashboard Overview

The dashboard is the application's operational home.

It should answer:

```text
What happened recently?
What needs attention?
How many actions exist?
How much work is complete?
How reliable are the extracted results?
```

---

# 43. Dashboard Layout

Recommended:

```text
┌─────────────────────────────────────────────────────────┐
│ Dashboard                              [Upload Meeting] │
├────────────┬────────────┬────────────┬─────────────────┤
│ Meetings   │ Actions    │ Completed  │ Needs Review    │
├────────────┴────────────┴────────────┴─────────────────┤
│                                                         │
│ Recent Meetings                Review Queue             │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Action Status                  Recent Activity          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

# 44. Dashboard Metrics

Primary metric cards:

```text
Total Meetings
Total Action Items
Completed
Needs Review
```

Secondary metrics:

```text
Pending
Completion Rate
Average Confidence
```

---

# 45. Metric Card Design

Each metric card should contain:

```text
Label
Primary Value
Optional Trend / Context
```

Avoid excessive decorative elements.

---

# 46. Recent Meetings

Display:

```text
Meeting Title
Date
Action Count
Review Count
Processing State
```

Clicking a row opens meeting details.

---

# 47. Review Queue Preview

Dashboard should show the highest-priority review items.

Example:

```text
Needs Review

Update launch checklist
Owner ambiguous
Medium confidence

Prepare final report
Deadline ambiguous
Low confidence
```

---

# 48. Dashboard Empty State

When no meetings exist:

```text
No meetings yet

Upload your first meeting transcript to start extracting
action items.

[Upload Meeting]
```

---

# 49. Meeting List Page

The meeting list should provide:

```text
Page title
Upload action
Search
Filters
Meeting table/list
```

---

# 50. Meeting List Columns

Recommended:

```text
Meeting
Date
Actions
Completed
Needs Review
Processing Status
```

---

# 51. Meeting Search

Search should support:

```text
Meeting title
Participant
Transcript content where supported
```

---

# 52. Meeting Filters

Potential filters:

```text
Processing Status
Date
Review State
```

---

# 53. Upload Meeting Page

The upload page is one of the most important workflows.

It should feel simple.

---

# 54. Upload Page Layout

```text
┌────────────────────────────────────────────────────────┐
│ Upload Meeting                                         │
│                                                        │
│ Meeting Information                                   │
│                                                        │
│ Title                                                  │
│ [____________________________________________]         │
│                                                        │
│ Date                                                   │
│ [________________]                                    │
│                                                        │
│ Transcript                                             │
│ ┌────────────────────────────────────────────────────┐ │
│ │                                                    │ │
│ │       Drag & drop transcript                      │ │
│ │                                                    │ │
│ │       or [Choose File]                            │ │
│ │                                                    │ │
│ │       TXT • PDF • DOCX                             │ │
│ │                                                    │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│                         [Cancel] [Upload & Process]   │
└────────────────────────────────────────────────────────┘
```

---

# 55. Upload States

The upload component should support:

```text
Idle
Drag Over
Selected
Uploading
Uploaded
Processing
Success
Error
```

---

# 56. Upload Validation

Errors should appear close to the relevant control.

Example:

```text
Unsupported file type.

Supported formats:
TXT, PDF, DOCX
```

---

# 57. Processing Experience

After upload:

```text
Upload Complete
       ↓
Processing Transcript
       ↓
Extracting Action Items
       ↓
Validating Results
       ↓
Complete
```

---

# 58. Processing UI

The user should never see an unexplained frozen screen.

Example:

```text
Processing meeting...

Extracting action items
████████████░░░░

This may take a moment.
```

If exact progress cannot be known, use an indeterminate progress indicator rather than a fake percentage.

---

# 59. Meeting Detail Page

Meeting detail is the core inspection interface.

---

# 60. Meeting Detail Header

Display:

```text
Meeting Title
Meeting Date
Participants
Processing Status
Action Count
Review Count
```

Primary action:

```text
Process / Reprocess
```

where appropriate.

---

# 61. Meeting Detail Navigation

Use tabs:

```text
Overview
Transcript
Action Items
Review
Insights
```

---

# 62. Overview Tab

Show:

```text
Meeting summary
Key metrics
Action status
Review workload
Participants
Processing information
```

Summary is secondary to action extraction.

---

# 63. Transcript Tab

The transcript viewer should be readable.

Potential structure:

```text
10:02 AM  Sarah
Let's finalize the onboarding document by Friday.

10:03 AM  Tanmay
I'll update the document.

10:04 AM  Sarah
Great.
```

---

# 64. Transcript Styling

Speaker:

```text
Semibold
```

Timestamp:

```text
Muted
Smaller
```

Transcript:

```text
Readable body text
```

---

# 65. Evidence Highlighting

When viewing an action item, the corresponding transcript evidence should be visually highlighted.

The highlight should be subtle.

Do not turn the transcript into a heavily colored document.

---

# 66. Action Items Tab

The action-item view should provide:

```text
Search
Filters
Sort
Action table
Bulk context where appropriate
```

---

# 67. Meeting Action Item Table

Columns:

```text
Task
Owner
Deadline
Status
Confidence
Review
```

---

# 68. Action Item Detail Panel

Selecting an action opens a detail panel or page.

```text
┌──────────────────────────────────────────┐
│ Action Item                              │
│                                          │
│ Update onboarding document               │
│                                          │
│ Owner       Tanmay                       │
│ Deadline    Friday                       │
│ Status      Pending                      │
│ Confidence  94%                          │
│                                          │
│ ──────────────────────────────────────── │
│ Evidence                                 │
│ "I'll update the onboarding document."   │
│                                          │
│ Source                                   │
│ Tanmay • 10:03 AM                        │
│                                          │
│ Validation                              │
│ Owner      Valid                          │
│ Deadline   Valid                          │
│ Duplicate  No                            │
│                                          │
│ [Edit] [Approve] [Reject]               │
└──────────────────────────────────────────┘
```

---

# 69. Action Item Edit

Editable fields:

```text
Task
Owner
Deadline
Status
```

Evidence should remain read-only.

---

# 70. Review Queue Page

The review queue is a first-class product feature.

The page should answer:

> Which AI results require my attention?

---

# 71. Review Queue Layout

```text
┌────────────────────────────────────────────────────────┐
│ Review Queue                                            │
│ 12 items need attention                                │
├────────────────────────────────────────────────────────┤
│ Filters                                                │
├────────────────────────────────────────────────────────┤
│ Action Item          Issue              Confidence      │
│--------------------------------------------------------│
│ Update report        Owner missing      62%             │
│ Launch campaign      Deadline unclear   74%             │
│ Fix dashboard        Duplicate          81%             │
└────────────────────────────────────────────────────────┘
```

---

# 72. Review Prioritization

Review items should be sortable by:

```text
Severity
Confidence
Date
Meeting
```

The system should not present a political or subjective "importance score."

Priority should be based on explicit product rules.

---

# 73. Review Panel

The review panel should contain:

```text
AI Result
Evidence
Validation
Editable Fields
Decision
```

---

# 74. Review Workflow

```text
Open Review
    ↓
Inspect Evidence
    ↓
Inspect Validation
    ↓
Edit if Required
    ↓
Approve / Reject
```

---

# 75. Review Confirmation

For important actions:

```text
Approve this action item?

The current values will become the finalized result.

[Cancel] [Approve]
```

---

# 76. Review Rejection

Reject should optionally allow a reason.

Example:

```text
Why is this not an action item?

[________________________________]

[Cancel] [Reject]
```

---

# 77. Insights Page

Insights should provide meaningful operational information.

---

# 78. Insights Layout

```text
┌─────────────────────────────────────────────────────────┐
│ Insights                                                │
├───────────────────────┬─────────────────────────────────┤
│ Completion Rate       │ Actions by Owner                │
├───────────────────────┼─────────────────────────────────┤
│ Status Distribution   │ Deadline Distribution            │
├───────────────────────┴─────────────────────────────────┤
│ Confidence Distribution                                 │
└─────────────────────────────────────────────────────────┘
```

---

# 79. Insight Cards

Examples:

```text
Completion Rate
68%

Actions Requiring Review
7

Unassigned Actions
4

Average Confidence
86%
```

---

# 80. Charts

Charts should include:

```text
Title
Axis Labels where appropriate
Legend where necessary
Accessible labels
Tooltip information
```

Avoid charts that require users to guess what they represent.

---

# 81. Chart Types

Recommended:

```text
Bar Chart
Line Chart
Donut / Pie only when appropriate
Horizontal Bar
Simple Distribution
```

Do not overuse pie charts.

---

# 82. Evaluation Center

Evaluation is a technical feature and should feel more analytical than the normal workspace.

---

# 83. Evaluation Page Structure

```text
Evaluation Center

Datasets
Runs
Metrics
Failure Analysis
```

---

# 84. Dataset Section

Display:

```text
Dataset Name
Version
Samples
Created Date
```

Primary action:

```text
Create Dataset
```

---

# 85. Evaluation Run

Display:

```text
Dataset
Model
Prompt Version
Status
Started
Completed
```

---

# 86. Evaluation Metrics

Display:

```text
Precision
Recall
F1
Task Accuracy
Owner Accuracy
Deadline Accuracy
Status Accuracy
```

---

# 87. Evaluation Visualization

Example:

```text
Metric              Score
--------------------------------
Action Precision     0.91
Action Recall        0.87
Action F1            0.89
Task Accuracy        0.93
Owner Accuracy       0.84
Deadline Accuracy    0.79
```

---

# 88. Failure Analysis UI

Group failures by category:

```text
Missing Owner
Incorrect Deadline
False Action
Duplicate
Wrong Status
Wrong Task
```

Clicking a failure should show:

```text
Transcript
Ground Truth
Prediction
Difference
```

---

# 89. Evaluation Sample Detail

Example:

```text
Transcript
────────────────────────────────────

Expected
Task: Update launch checklist
Owner: Tanmay
Deadline: Friday

Predicted
Task: Update launch checklist
Owner: Unknown
Deadline: Friday

Failure
Owner extraction
```

---

# 90. Settings Page

Settings should remain simple in MVP.

Sections:

```text
Profile
AI Configuration
Application Preferences
```

---

# 91. Profile Section

Display:

```text
Name
Email
```

---

# 92. AI Configuration

Display non-secret configuration information.

Example:

```text
Provider
Model
Status
```

Never display the complete API key.

---

# 93. Application Preferences

Potential:

```text
Theme
Default page size
Date format
```

Only implement settings that have real functionality.

---

# 94. Loading States

Loading states should match the operation.

For tables:

```text
Skeleton rows
```

For cards:

```text
Skeleton blocks
```

For processing:

```text
Progress / spinner + status text
```

---

# 95. Skeleton Rules

Skeletons should approximate the final content layout.

Avoid giant generic loading spinners for entire pages.

---

# 96. Empty States

Empty states should contain:

```text
Icon or simple visual
Title
Short explanation
Next action
```

Example:

```text
No action items

Action items extracted from meetings will appear here.

[View Meetings]
```

---

# 97. Error States

Errors should contain:

```text
What happened
What the user can do
Retry where possible
```

Example:

```text
Unable to process this meeting.

The AI extraction service did not respond.

[Retry]
```

---

# 98. Toast Notifications

Toasts should be used for lightweight feedback.

Good use:

```text
Action item approved.
Meeting exported.
Changes saved.
```

Do not use toasts for critical information that users must inspect.

---

# 99. Dialogs

Dialogs should be used for:

* Confirmation
* Destructive actions
* Focused editing
* Important decisions

Avoid using dialogs for complex multi-step workflows.

---

# 100. Drawers

Drawers are useful for:

* Action item details
* Review details
* Quick inspection

They allow users to maintain context.

---

# 101. Search UX

Search should provide:

```text
Input
Clear button
Loading state
Results
No results state
```

---

# 102. Filter UX

Filters should be:

* Discoverable
* Compact
* Easy to clear
* Clearly show active filters

Example:

```text
Status: Pending
Owner: Tanmay
Review: Needs Review

[Clear All]
```

---

# 103. Sorting UX

Sortable columns should clearly communicate:

```text
Ascending
Descending
Not Sorted
```

---

# 104. Pagination

Pagination should be introduced when datasets become large enough to require it.

Avoid unnecessary pagination for small datasets.

---

# 105. Responsive Design

Primary breakpoint behavior:

```text
Desktop
        ↓
Tablet
        ↓
Mobile / Narrow
```

---

# 106. Desktop

Desktop should use:

```text
Persistent Sidebar
Multi-column layouts
Data tables
Side panels
```

---

# 107. Tablet

Tablet should support:

```text
Collapsible sidebar
Reduced grid columns
Responsive tables
```

---

# 108. Mobile

Mobile support should prioritize:

```text
Navigation
Meeting inspection
Action-item inspection
Review
```

Dense tables may transform into cards.

---

# 109. Accessibility

The application should target accessible interaction patterns.

Requirements:

```text
Keyboard navigation
Visible focus
Semantic HTML
Accessible labels
Logical tab order
Adequate contrast
Screen-reader-friendly controls
```

---

# 110. Color Accessibility

Do not communicate status through color alone.

Bad:

```text
Red = blocked
Green = completed
```

Better:

```text
[Blocked]
[Completed]
```

with color supporting the label.

---

# 111. Keyboard Navigation

Interactive elements should be reachable through keyboard navigation.

Important actions:

```text
Tab
Enter
Escape
Arrow keys where appropriate
```

---

# 112. Focus Management

Dialogs and drawers should:

* Receive focus appropriately
* Trap focus when necessary
* Return focus after closing

---

# 113. Motion

Motion should be subtle.

Appropriate:

```text
Button feedback
Panel transitions
Dropdown opening
Status transition
Skeleton shimmer
```

Avoid:

```text
Large page transitions
Continuous animations
Decorative floating elements
```

---

# 114. Motion Accessibility

Respect reduced-motion preferences.

---

# 115. Trust UX

Because the product uses AI, the UI must avoid presenting predictions as unquestionable facts.

Use language such as:

```text
AI extracted
Confidence
Evidence
Needs Review
Validated
```

rather than:

```text
AI knows
AI is certain
Guaranteed
```

---

# 116. Explainability UX

When displaying an AI-generated result:

```text
Result
+
Confidence
+
Evidence
+
Validation
```

should be accessible without overwhelming the primary workflow.

---

# 117. Evidence Interaction

Clicking evidence should ideally:

```text
Open transcript
Scroll to source
Highlight relevant segment
```

This creates a direct verification workflow.

---

# 118. AI Processing Transparency

During processing, show meaningful stages:

```text
Reading transcript
Extracting action items
Validating results
Preparing review
```

Avoid exposing unnecessary technical implementation details.

---

# 119. User Trust Principle

The UI should make it easy to disagree with the AI.

Users should always have a clear path to:

```text
Edit
Reject
Approve
```

---

# 120. Data Density Principle

MeetExtract AI is an operational application.

Therefore:

```text
Information Density
      +
Visual Hierarchy
      +
Whitespace
```

should be balanced.

Do not make the interface so minimal that important information requires excessive clicking.

---

# 121. Dashboard Priority

The dashboard should prioritize:

```text
Needs Review
Recent Meetings
Action Status
Completion
```

rather than decorative analytics.

---

# 122. Meeting Priority

Meeting pages should prioritize:

```text
Action Items
Review Items
Evidence
Transcript
```

The transcript should support the action workflow rather than dominate it.

---

# 123. Action Item Priority

The action-item experience should prioritize:

```text
Task
Owner
Deadline
Status
Review State
```

Confidence and evidence should be readily accessible.

---

# 124. Review Priority

Review should prioritize:

```text
What AI extracted
Why it extracted it
What is uncertain
What the user should change
```

---

# 125. Evaluation Priority

Evaluation should prioritize:

```text
What was measured
How well the system performed
Where it failed
What changed between runs
```

---

# 126. UX Flow — New Meeting

```text
Dashboard
   ↓
Upload Meeting
   ↓
Enter Meeting Details
   ↓
Upload Transcript
   ↓
Upload & Process
   ↓
Processing
   ↓
Meeting Detail
   ↓
Action Items
```

---

# 127. UX Flow — Review

```text
Review Queue
   ↓
Select Item
   ↓
Inspect Evidence
   ↓
Inspect Validation
   ↓
Edit if Required
   ↓
Approve / Reject
   ↓
Next Review Item
```

---

# 128. UX Flow — Action Inspection

```text
Action Items
   ↓
Select Action
   ↓
View Details
   ↓
View Evidence
   ↓
Open Transcript
   ↓
Verify Source
```

---

# 129. UX Flow — Evaluation

```text
Evaluation
   ↓
Select Dataset
   ↓
Run Evaluation
   ↓
Processing
   ↓
Metrics
   ↓
Failure Analysis
   ↓
Inspect Samples
```

---

# 130. UX Flow — Export

```text
Action Items
   ↓
Apply Filters
   ↓
Export
   ↓
Choose CSV / JSON
   ↓
Download
```

---

# 131. Page-Level Visual Hierarchy

Every page should have:

```text
Page Title
    ↓
Context / Description
    ↓
Primary Action
    ↓
Main Content
    ↓
Secondary Content
```

---

# 132. Component Reuse

The following should be reusable:

```text
Button
Input
Select
Badge
Card
Table
Modal
Drawer
Tabs
Tooltip
Dropdown
Pagination
Skeleton
Toast
EmptyState
ErrorState
MetricCard
```

---

# 133. Domain Components

Reusable domain components:

```text
MeetingCard
MeetingStatus
ActionItemRow
ActionItemDetail
ConfidenceBadge
EvidenceViewer
ValidationSummary
ReviewPanel
ReviewStatus
MetricCard
EvaluationMetric
FailureCard
```

---

# 134. Component States

Every reusable interactive component should define:

```text
Default
Hover
Focus
Disabled
Loading
Error
Empty
```

where relevant.

---

# 135. Design Tokens

The frontend should centralize design values.

Conceptually:

```text
tokens/
├── colors
├── typography
├── spacing
├── radius
├── shadows
└── breakpoints
```

Exact implementation can use Tailwind configuration and CSS variables.

---

# 136. Dark Mode

Dark mode may be supported if implemented cleanly.

It should not be added at the expense of core product functionality.

If implemented:

* Maintain contrast
* Preserve semantic colors
* Avoid excessive glow
* Avoid pure-black visual harshness

---

# 137. Theme Consistency

The interface must maintain the same visual language across:

```text
Dashboard
Meetings
Action Items
Review
Insights
Evaluation
Settings
```

---

# 138. UI Performance

Avoid unnecessary:

* Large client-side bundles
* Repeated API requests
* Expensive chart rendering
* Unnecessary re-renders

Use server-side rendering or server components where appropriate.

---

# 139. UX Performance

The user should receive immediate visual feedback for:

```text
Click
Upload
Save
Approve
Reject
Filter
Search
```

---

# 140. Error Prevention

The UI should prevent invalid actions where possible.

Examples:

```text
Disable submit when required fields are missing
Confirm destructive operations
Validate files before upload
Show unsaved-change warnings when necessary
```

---

# 141. Unsaved Changes

If a user edits an action item and attempts to leave before saving, the application should warn appropriately.

---

# 142. Review Efficiency

Review should support efficient repeated workflows.

After approving or rejecting an item, the UI should make it easy to move to the next item.

---

# 143. Review Keyboard Support

Future enhancement may support keyboard shortcuts.

Example:

```text
A → Approve
R → Reject
E → Edit
N → Next
```

This should only be implemented if it improves usability without creating confusion.

---

# 144. AI Evidence Quality

If evidence is unavailable, the UI should explicitly say:

```text
Evidence unavailable
```

Do not fabricate source information.

---

# 145. Validation Display

Validation should be understandable.

Example:

```text
Validation

Owner
✓ Valid

Deadline
⚠ Ambiguous

Duplicate
✓ No duplicate detected
```

---

# 146. Review Reason Display

When an item requires review, show why.

Example:

```text
Needs Review

Reason:
Deadline is ambiguous.
```

Multiple reasons may be displayed.

---

# 147. Action Item Detail Priority

The user should see the task immediately.

Then:

```text
Owner
Deadline
Status
Confidence
```

Then:

```text
Evidence
Validation
Source
```

---

# 148. Meeting Summary

If a meeting summary exists, it should be visually secondary to action items.

The product's primary value is actionable extraction.

---

# 149. Notification Strategy

MVP should avoid complex notification infrastructure.

Use:

```text
In-app feedback
Toasts
Status indicators
```

Email/push notifications are future scope.

---

# 150. Search Results

Search results should preserve context.

Example:

```text
Update onboarding document
Meeting:
Product Planning — Sep 18
Owner:
Tanmay
```

---

# 151. No-Result State

Example:

```text
No matching action items

Try changing your filters or search terms.
```

---

# 152. Accessibility Labels

Buttons with icons must have meaningful accessible labels.

Example:

```text
Icon-only button:
"Open action item details"
```

---

# 153. Tooltip Rules

Tooltips should explain unfamiliar icons or compact controls.

Do not use tooltips to hide essential information.

---

# 154. Table Mobile Transformation

On narrow screens, rows may become stacked cards:

```text
Task
Owner
Deadline
Status
Confidence
Review
```

The user should not lose critical information.

---

# 155. Visual Priority for Review

Needs-review items should be noticeable without overwhelming the interface.

Use:

```text
Subtle warning accent
Clear label
Review reason
```

Avoid large red warning banners for ordinary review work.

---

# 156. Visual Priority for Errors

Actual failures should be visually stronger than routine review states.

Distinguish:

```text
Needs Review
```

from:

```text
Processing Failed
```

---

# 157. Processing Status Visual Language

Use:

```text
Created
Uploaded
Processing
Extracting
Validating
Completed
Failed
```

Each should have:

* Label
* Optional icon
* Semantic color
* Clear text

---

# 158. Review Status Visual Language

Use:

```text
Ready
Needs Review
Reviewing
Approved
Edited & Approved
Rejected
```

---

# 159. Confidence Visual Language

Confidence should use:

```text
High
Medium
Low
```

alongside the numeric percentage.

---

# 160. Professionalism Requirements

The final application should look suitable for:

```text
Startup Demo
Technical Interview
Internship Evaluation
Portfolio Presentation
Engineering Review
```

It should not look like a classroom prototype.

---

# 161. Demo Readiness

The UI should make the main demonstration flow visually obvious:

```text
Upload
   ↓
AI Extraction
   ↓
Review
   ↓
Approve
   ↓
Insights
   ↓
Evaluation
```

---

# 162. UI Quality Gate

A page is not considered complete until:

```text
Functional
   ↓
Responsive
   ↓
Loading State
   ↓
Empty State
   ↓
Error State
   ↓
Success State
   ↓
Accessibility Check
   ↓
Visual Refinement
```

---

# 163. Progressive UI Refinement

UI refinement should happen progressively.

Example:

```text
Feature implemented
      ↓
Basic UI working
      ↓
Interaction verified
      ↓
Visual refinement
      ↓
Responsive refinement
      ↓
Accessibility refinement
```

Do not postpone all UI polish until the end.

---

# 164. Design Review Checklist

Before considering a page complete:

```text
[ ] Clear page purpose
[ ] Clear primary action
[ ] Consistent typography
[ ] Consistent spacing
[ ] Consistent components
[ ] Correct status indicators
[ ] Loading state
[ ] Empty state
[ ] Error state
[ ] Success state
[ ] Responsive behavior
[ ] Keyboard accessibility
[ ] Focus states
[ ] No unnecessary decoration
```

---

# 165. Final UI/UX Direction

MeetExtract AI should feel like a serious AI engineering/productivity application.

The visual identity should communicate:

```text
INTELLIGENCE
      +
CLARITY
      +
ACCOUNTABILITY
      +
CONTROL
```

The user should never feel that the AI is making decisions behind a black box.

Instead:

```text
AI extracts
    ↓
System explains
    ↓
System validates
    ↓
Human verifies
    ↓
Product records
```

---

# 166. Final Page Map

```text
/
│
├── dashboard
│
├── meetings
│   ├── all
│   ├── new
│   └── [id]
│       ├── overview
│       ├── transcript
│       ├── action-items
│       ├── review
│       └── insights
│
├── action-items
│
├── reviews
│
├── insights
│
├── evaluation
│   ├── datasets
│   ├── runs
│   └── [id]
│
└── settings
```

---

# 167. Final UX Workflow

```text
                         USER
                           │
                           ▼
                    ┌─────────────┐
                    │  Dashboard  │
                    └──────┬──────┘
                           │
                           ▼
                   ┌───────────────┐
                   │ Upload Meeting│
                   └───────┬───────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  Processing │
                    └──────┬──────┘
                           │
                           ▼
                 ┌──────────────────┐
                 │ Extracted Actions│
                 └────────┬─────────┘
                          │
             ┌────────────┴────────────┐
             ▼                         ▼
       ┌────────────┐           ┌──────────────┐
       │   Ready    │           │ Needs Review │
       └─────┬──────┘           └──────┬───────┘
             │                         │
             │                         ▼
             │                  ┌─────────────┐
             │                  │   Review    │
             │                  └──────┬──────┘
             │                         │
             └────────────┬────────────┘
                          ▼
                    ┌─────────────┐
                    │  Finalized  │
                    └──────┬──────┘
                           │
             ┌─────────────┼─────────────┐
             ▼             ▼             ▼
        Analytics       Export       Evaluation
```

---

# 168. UI/UX Status

**Version:** 1.0

**Status:** Draft for Development Planning

**Design Direction:** Professional AI productivity platform

**Primary UX Principle:**

```text
Make AI output understandable,
verifiable, editable, and actionable.
```

---

# 169. Next Document

The next document is:

`docs/05-development-plan.md`

It will define the actual implementation roadmap, including:

* Development phases
* Phase objectives
* Repository setup
* Environment setup
* Database implementation
* Backend implementation
* AI pipeline
* Validation
* Frontend implementation
* Progressive UI refinement
* Evaluation implementation
* Testing strategy
* Verification gates
* Definition of done
* Git workflow
* Documentation workflow
* Project state management
* MVP milestone
* Final polish
* Demo preparation

```
