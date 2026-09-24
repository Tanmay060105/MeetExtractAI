# MeetExtract AI — Phase 10 Implementation Plan
# Phase: Dashboard & Insights

## 1. Current State
Phases 0 through 9 are fully implemented and passing. The database is populated with `Meeting`, `ActionItem`, and `Review` records. The frontend currently has functional pages for Meetings, Action Items, and Reviews. However, `/dashboard/page.tsx` and `/dashboard/insights/page.tsx` contain hardcoded placeholder values (e.g., "--") and "Coming Soon" empty states. No external charting library is currently installed.

## 2. Requirements Mapping
- **A. Dashboard Summary**: High-level KPIs mapping to `Total Meetings`, `Total Action Items`, `Completed Actions`, `Pending Actions`, `Needs Review`, `Overdue`, `Completion Rate`, and `Avg Confidence`.
- **B. Action Status Overview**: Grouping Action Items by `ActionStatus` enum values.
- **C. Review Workload**: Exposing counts based on `ReviewStatus.NEEDS_REVIEW`.
- **D. Owner Distribution**: Grouping items by `owner_name`, with `NULL` explicitly mapped to "Unassigned".
- **E. Meeting Distribution**: Grouping items by `meeting_id`/`title`.
- **F. Confidence Analytics**: Segmenting the `confidence` float into High (90-100%), Medium (70-89%), Low (0-69%).
- **G. Deadline Analytics**: Calculating Overdue (deadline < UTC Now), Due Soon, and No Deadline.
- **H. Completion/Activity Trends**: (Deferred for MVP as there is minimal time-series data depth; we will rely on static distributions).

## 3. Analytics Architecture Decision
**Decision**: Create two dedicated backend endpoints: `/api/v1/analytics/dashboard` and `/api/v1/analytics/insights`.
**Reasoning**: Fetching all raw `ActionItem` and `Meeting` records to the frontend for client-side aggregation is highly inefficient and creates massive payload bloat. Aggregating data using PostgreSQL `GROUP BY` and aggregation functions (`COUNT`, `AVG`) in a dedicated `AnalyticsService` ensures extremely fast response times and low memory usage.

## 4. Backend Changes
- **NEW**: `backend/app/schemas/analytics.py` - Defines Pydantic schemas for the dashboard summary and insights distributions.
- **NEW**: `backend/app/services/analytics.py` - Implements the `AnalyticsService` executing SQLAlchemy aggregations.
- **NEW**: `backend/app/api/v1/endpoints/analytics.py` - FastAPI router for the analytics endpoints.
- **MODIFY**: `backend/app/api/v1/api.py` - Includes the new `analytics` router.

## 5. API Design
**Endpoint 1: Dashboard Summary**
- **Method**: `GET`
- **Path**: `/api/v1/analytics/dashboard`
- **Authentication**: Required (`Depends(deps.get_current_active_user)`)
- **Query Params**: None
- **Response Structure**: 
  ```json
  {
    "total_meetings": 10,
    "total_action_items": 45,
    "completed_actions": 15,
    "pending_actions": 25,
    "needs_review": 5,
    "overdue_actions": 2,
    "completion_rate": 33.3,
    "average_confidence": 0.85
  }
  ```
- **Ownership**: Joins `Meeting` to enforce `Meeting.user_id == current_user.id`.

**Endpoint 2: Insights Distribution**
- **Method**: `GET`
- **Path**: `/api/v1/analytics/insights`
- **Authentication**: Required
- **Response Structure**:
  ```json
  {
    "by_status": [{"status": "PENDING", "count": 25}, ...],
    "by_owner": [{"owner": "Unassigned", "count": 10}, {"owner": "Rahul", "count": 15}, ...],
    "by_confidence": {"high": 30, "medium": 10, "low": 5},
    "by_deadline": {"overdue": 2, "upcoming": 13, "no_deadline": 30}
  }
  ```

## 6. Metric Definitions
- **Total Meetings**: `COUNT(id)` on `Meeting` matching user.
- **Total Action Items**: `COUNT(id)` on `ActionItem` where meeting belongs to user.
- **Completed Actions**: `COUNT(id)` where `status == COMPLETED`.
- **Pending Actions**: `COUNT(id)` where `status == PENDING`.
- **Needs Review**: `COUNT(id)` where `review_status == NEEDS_REVIEW`.
- **Overdue Actions**: `COUNT(id)` where `deadline < CURRENT_TIMESTAMP` AND `status != COMPLETED`.
- **Completion Rate**: `(Completed Actions / Total Action Items) * 100` (Returns 0 if total is 0).
- **Average Confidence**: `AVG(confidence)` where `confidence IS NOT NULL`. Returns 0 if none exist.

## 7. Dashboard Design
- **MODIFY**: `frontend/src/app/dashboard/page.tsx`.
- Connect the 8 metric cards to the `fetchApi('/analytics/dashboard')` endpoint.
- For "Recent Meetings" and "Review Queue", make independent `fetchApi` calls to their existing list endpoints (`/meetings?limit=5` and `/reviews/pending?limit=5`) to display the latest operational data.

## 8. Insights Design
- **MODIFY**: `frontend/src/app/dashboard/insights/page.tsx`.
- Connect to `fetchApi('/analytics/insights')`.
- Remove "Coming Soon" empty state.
- Implement HTML/CSS-based horizontal bar charts and flex-grid layouts for distributions. We will **NOT** install an external charting library like Recharts to avoid unnecessary framework bloat, as these distributions can easily be visualized using Tailwind flex widths (e.g., `<div style={{ width: `${percent}%` }} />`).

## 9. Filtering / Time Range Strategy
For Phase 10 MVP, analytics represent **All-Time** data. No date pickers or time-range filters will be implemented to keep the MVP focused and performant.

## 10. Data Accuracy Rules
- Metrics strictly read from PostgreSQL. No mock data.
- **Unassigned**: `owner_name IS NULL` is explicitly handled and grouped as "Unassigned".
- **Invalid states**: Validation rules remain untouched. `UNKNOWN` validation statuses are not omitted from action counts.
- **Percentages**: Division by zero is protected (returns 0).

## 11. Authorization / Ownership
All backend analytics queries enforce data isolation by performing an `INNER JOIN` on the `meetings` table where `meetings.user_id = :current_user_id`. It is mathematically impossible for a user's aggregation to reflect another tenant's data.

## 12. Database Impact
**Migration Required: NO**. 
The `ActionItem` table already has indexes on `meeting_id`, `status`, `review_status`, and `deadline`. The `Meeting` table has an index on `user_id`. These existing indexes are more than sufficient to efficiently satisfy the required `COUNT` and `GROUP BY` aggregations.

## 13. UI/UX Plan
- Continue using existing UI patterns (`Card`, `Badge`, `Spinner`, `AlertCircle`).
- Custom Tailwind progress bars will serve as data visualization mechanisms for Insights. 
- Avoid excessive gradients, maintain the clean white/slate/indigo theme.

## 14. Empty / Insufficient Data States
- **Zero Meetings**: Dashboard summary numbers render as "0". The Insights page displays a global empty state: "Upload a meeting to generate insights."
- **Zero Actions**: Summaries show "0", completion rate is "0%".
- **No Deadlines / No Owners**: Explicitly categorized as "No Deadline" and "Unassigned" rather than disappearing from the charts.

## 15. Performance Considerations
All metric computation is shifted entirely to the database via `func.count()`, `func.avg()`, and `group_by`. This prevents memory bloat in Python. Caching (Redis) is not introduced as the current scale (MBs of text, 1000s of action items) will respond in single-digit milliseconds from Postgres.

## 16. Responsive Design
- Summary KPIs will use `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`.
- Insight distribution panels will use `grid-cols-1 lg:grid-cols-2` side-by-side on desktop, stacking on mobile.
- Custom Tailwind CSS horizontal bars will use `w-full` wrappers to remain fluid and readable.

## 17. Testing Plan
- **Backend Verification**: Validate `/analytics/dashboard` returns expected integers based on the mock data.
- **Frontend Verification**: Verify the Dashboard UI renders the metrics and the Insights page renders the horizontal bars without breaking the layout on resize. Validate that the "Zero Meetings" empty state renders flawlessly.

## 18. Documentation Updates
- Update `PROJECT_STATE.md` to mark Phase 10 as IMPLEMENTING, and upon verification, PASS.

## 19. Phase 10 Scope Check
This plan explicitly excludes Evaluation Centers, Export capabilities, Multi-tenancy, and LLM Chat integrations. It is strictly constrained to Dashboard KPIs and basic data insights.

## 20. Risks / Concerns
- **Timezones**: Overdue calculations (`deadline < CURRENT_TIMESTAMP`) must ensure the DB compares against UTC correctly since `deadline` uses `DateTime(timezone=True)`. The SQLAlchemy `func.now()` defaults to the server timestamp, which is UTC in this Dockerized environment.
- **Insufficient History**: As we have only processed a few meetings during dev, historical trends over weeks/months won't yield meaningful charts. Trend graphs are explicitly omitted from MVP Insights to avoid showing an awkward 1-day flatline.

## 21. Implementation Order
1. Define Pydantic schemas in `schemas/analytics.py`.
2. Implement `AnalyticsService` SQL queries in `services/analytics.py`.
3. Create API routes in `endpoints/analytics.py` and register them.
4. Add TypeScript interfaces to `frontend/src/lib/api.ts`.
5. Update `dashboard/page.tsx` to fetch and render Summary KPIs.
6. Update `dashboard/insights/page.tsx` to fetch and render visualizations.

## 22. Expected Verification
End-to-end browser check verifying that upon logging in, the Dashboard displays the correct number of Action Items extracted during Phase 8/9, the Completion Rate, and the Pending Review count.

## 23. Expected Phase 10 PASS Criteria
The user is provided with a concise, operational Dashboard overview and an Insights page breaking down Action Items by Status, Owner, Confidence, and Deadline, completely driven by authentic backend aggregation, with responsive Tailwind-driven visual indicators.
