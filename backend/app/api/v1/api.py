from fastapi import APIRouter

from app.api.v1.endpoints import (
    meetings,
    transcripts,
    action_items,
    reviews,
    evaluations,
    analytics,
    auth,
    extraction,
    validation,
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(meetings.router, prefix="/meetings", tags=["meetings"])
api_router.include_router(extraction.router, prefix="/meetings", tags=["extraction"])
api_router.include_router(validation.router, prefix="/meetings", tags=["validation"])
api_router.include_router(transcripts.router, prefix="/transcripts", tags=["transcripts"])
api_router.include_router(action_items.router, prefix="/action-items", tags=["action-items"])
api_router.include_router(reviews.router, prefix="/reviews", tags=["reviews"])
api_router.include_router(evaluations.router, prefix="/evaluations", tags=["evaluations"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
