import uuid
import datetime
import asyncio
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_active_user
from app.models.user import User
from app.schemas.meeting import MeetingResponse, MeetingTextCreate
from app.schemas.transcript import TranscriptResponse
from app.services import meeting as meeting_service
from app.services import ingestion as ingestion_service
from app.schemas.action_item import ActionItemResponse
from app.models.action_item import ActionItem
from app.db.session import AsyncSessionLocal
from app.services.extraction import ExtractionService
from sqlalchemy import select

router = APIRouter()

MAX_TEXT_BYTES = 5 * 1024 * 1024
MAX_FILE_BYTES = 10 * 1024 * 1024

async def process_meeting_background(meeting_id: uuid.UUID, user_id: uuid.UUID):
    try:
        async with AsyncSessionLocal() as session:
            extraction_service = ExtractionService()
            await extraction_service.extract_meeting_actions(db=session, meeting_id=meeting_id, user_id=user_id)
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"Background extraction failed: {e}")

@router.post("/text", response_model=MeetingResponse, status_code=status.HTTP_201_CREATED)
async def create_meeting_from_text(
    data: MeetingTextCreate,
    background_tasks: BackgroundTasks,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    text_bytes = data.text.encode("utf-8")
    if len(text_bytes) > MAX_TEXT_BYTES:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="Payload Too Large")
    
    if not data.text.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Empty or whitespace-only transcript text.")

    normalized = ingestion_service.normalize_text(data.text)
    
    # Defaults to TEXT if not provided
    source_type = data.source_type or "TEXT"

    meeting = await meeting_service.create_meeting_and_transcript(
        db=db,
        user_id=current_user.id,
        title=data.title,
        raw_text=data.text,
        normalized_text=normalized,
        meeting_date=data.meeting_date,
        source_type=source_type,
        source_filename=None
    )
    background_tasks.add_task(process_meeting_background, meeting.id, current_user.id)
    return meeting

@router.post("/upload", response_model=MeetingResponse, status_code=status.HTTP_201_CREATED)
async def create_meeting_from_upload(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    title: str = Form(...),
    meeting_date: datetime.datetime | None = Form(None),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    # Enforce size limit by incremental read
    file_bytes = bytearray()
    while True:
        chunk = await file.read(1024 * 1024)
        if not chunk:
            break
        file_bytes.extend(chunk)
        if len(file_bytes) > MAX_FILE_BYTES:
            raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="Payload Too Large")
            
    if not file_bytes:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Empty file.")

    filename = file.filename or ""
    ext = filename.lower().split('.')[-1] if '.' in filename else ""
    mime = file.content_type
    
    try:
        if ext == "txt" and mime == "text/plain":
            raw_text = await asyncio.to_thread(ingestion_service.extract_txt, bytes(file_bytes))
        elif ext == "pdf" and mime == "application/pdf":
            raw_text = await asyncio.to_thread(ingestion_service.extract_pdf, bytes(file_bytes))
        elif ext == "docx" and mime == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            raw_text = await asyncio.to_thread(ingestion_service.extract_docx, bytes(file_bytes))
        else:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported file type or extension/MIME disagreement.")
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    normalized = ingestion_service.normalize_text(raw_text)

    meeting = await meeting_service.create_meeting_and_transcript(
        db=db,
        user_id=current_user.id,
        title=title,
        raw_text=raw_text,
        normalized_text=normalized,
        meeting_date=meeting_date,
        source_type=ext.upper(),
        source_filename=filename
    )
    background_tasks.add_task(process_meeting_background, meeting.id, current_user.id)
    return meeting

@router.get("", response_model=list[MeetingResponse])
async def list_meetings(
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    meetings = await meeting_service.get_user_meetings(db, current_user.id)
    return meetings

@router.get("/{meeting_id}", response_model=MeetingResponse)
async def get_meeting(
    meeting_id: uuid.UUID,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    meeting = await meeting_service.get_user_meeting(db, current_user.id, meeting_id)
    if not meeting:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting not found")
    return meeting

@router.get("/{meeting_id}/transcript", response_model=TranscriptResponse)
async def get_transcript(
    meeting_id: uuid.UUID,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    transcript = await meeting_service.get_user_transcript(db, current_user.id, meeting_id)
    if not transcript:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transcript not found")
    return transcript

@router.get("/{meeting_id}/action-items", response_model=list[ActionItemResponse])
async def get_action_items(
    meeting_id: uuid.UUID,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    # Enforce authenticated ownership: get_user_meeting will return None if meeting belongs to another user
    meeting = await meeting_service.get_user_meeting(db, current_user.id, meeting_id)
    if not meeting:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting not found")
        
    result = await db.execute(
        select(ActionItem)
        .where(ActionItem.meeting_id == meeting_id)
        .order_by(ActionItem.created_at.asc())
    )
    action_items = result.scalars().all()
    return action_items
