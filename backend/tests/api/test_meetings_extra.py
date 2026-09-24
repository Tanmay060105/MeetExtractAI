import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import status
import uuid

from app.models.meeting import Meeting
from app.models.transcript import Transcript

@pytest.mark.asyncio
async def test_upload_txt_bom_success(async_client: AsyncClient, normal_user_token_headers: dict[str, str]):
    file_content = b"\xef\xbb\xbfBOM text content."
    files = {"file": ("test.txt", file_content, "text/plain")}
    response = await async_client.post(
        "/api/v1/meetings/upload",
        headers=normal_user_token_headers,
        data={"title": "BOM TXT"},
        files=files
    )
    assert response.status_code == status.HTTP_201_CREATED

@pytest.mark.asyncio
async def test_upload_txt_invalid_utf8(async_client: AsyncClient, normal_user_token_headers: dict[str, str]):
    file_content = b"\xff\xfe\x00\x00Invalid UTF-8"
    files = {"file": ("test.txt", file_content, "text/plain")}
    response = await async_client.post(
        "/api/v1/meetings/upload",
        headers=normal_user_token_headers,
        data={"title": "Invalid TXT"},
        files=files
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST

@pytest.mark.asyncio
async def test_upload_pdf_encrypted(async_client: AsyncClient, normal_user_token_headers: dict[str, str]):
    import pypdf
    import io
    pdf_writer = pypdf.PdfWriter()
    pdf_writer.add_blank_page(width=200, height=200)
    pdf_writer.encrypt("password")
    pdf_io = io.BytesIO()
    pdf_writer.write(pdf_io)
    
    files = {"file": ("test.pdf", pdf_io.getvalue(), "application/pdf")}
    response = await async_client.post(
        "/api/v1/meetings/upload",
        headers=normal_user_token_headers,
        data={"title": "Encrypted PDF"},
        files=files
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST

@pytest.mark.asyncio
async def test_upload_pdf_corrupt(async_client: AsyncClient, normal_user_token_headers: dict[str, str]):
    files = {"file": ("test.pdf", b"Not a PDF file", "application/pdf")}
    response = await async_client.post(
        "/api/v1/meetings/upload",
        headers=normal_user_token_headers,
        data={"title": "Corrupt PDF"},
        files=files
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST

@pytest.mark.asyncio
async def test_upload_docx_corrupt(async_client: AsyncClient, normal_user_token_headers: dict[str, str]):
    files = {"file": ("test.docx", b"Not a DOCX file", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")}
    response = await async_client.post(
        "/api/v1/meetings/upload",
        headers=normal_user_token_headers,
        data={"title": "Corrupt DOCX"},
        files=files
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST

@pytest.mark.asyncio
async def test_upload_unsupported_extension(async_client: AsyncClient, normal_user_token_headers: dict[str, str]):
    files = {"file": ("test.png", b"fake", "image/png")}
    response = await async_client.post(
        "/api/v1/meetings/upload",
        headers=normal_user_token_headers,
        data={"title": "PNG"},
        files=files
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST

@pytest.mark.asyncio
async def test_upload_mime_mismatch_reverse(async_client: AsyncClient, normal_user_token_headers: dict[str, str]):
    files = {"file": ("test.docx", b"fake", "application/pdf")}
    response = await async_client.post(
        "/api/v1/meetings/upload",
        headers=normal_user_token_headers,
        data={"title": "Mismatch"},
        files=files
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST

@pytest.mark.asyncio
async def test_speaker_timestamp_preservation(async_client: AsyncClient, normal_user_token_headers: dict[str, str]):
    text = "00:01 Speaker 1: Hello\n\n\n\n00:05 Speaker 2: Hi"
    response = await async_client.post(
        "/api/v1/meetings/text",
        headers=normal_user_token_headers,
        json={"title": "Speakers", "text": text}
    )
    meeting_id = response.json()["id"]
    transcript_resp = await async_client.get(
        f"/api/v1/meetings/{meeting_id}/transcript",
        headers=normal_user_token_headers
    )
    t_data = transcript_resp.json()
    assert t_data["normalized_text"] == "00:01 Speaker 1: Hello\n\n00:05 Speaker 2: Hi"

@pytest.mark.asyncio
async def test_atomic_rollback_on_failure(async_client: AsyncClient, normal_user_token_headers: dict[str, str], db_session: AsyncSession):
    # Get count before
    before_meetings = (await db_session.execute(select(Meeting))).scalars().all()
    before_transcripts = (await db_session.execute(select(Transcript))).scalars().all()
    
    # Trigger failure (corrupt docx)
    files = {"file": ("test.docx", b"Not a DOCX file", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")}
    await async_client.post(
        "/api/v1/meetings/upload",
        headers=normal_user_token_headers,
        data={"title": "Failed atomic"},
        files=files
    )
    
    # Get count after
    after_meetings = (await db_session.execute(select(Meeting))).scalars().all()
    after_transcripts = (await db_session.execute(select(Transcript))).scalars().all()
    
    assert len(before_meetings) == len(after_meetings)
    assert len(before_transcripts) == len(after_transcripts)
    
    # Make sure no FAILED meetings were added
    failed_meetings = (await db_session.execute(select(Meeting).where(Meeting.processing_status == "FAILED"))).scalars().all()
    assert len(failed_meetings) == 0

@pytest.mark.asyncio
async def test_get_meetings(async_client: AsyncClient, normal_user_token_headers: dict[str, str]):
    response = await async_client.get("/api/v1/meetings", headers=normal_user_token_headers)
    assert response.status_code == status.HTTP_200_OK
    assert isinstance(response.json(), list)

@pytest.mark.asyncio
async def test_get_meeting_missing(async_client: AsyncClient, normal_user_token_headers: dict[str, str]):
    random_id = str(uuid.uuid4())
    response = await async_client.get(f"/api/v1/meetings/{random_id}", headers=normal_user_token_headers)
    assert response.status_code == status.HTTP_404_NOT_FOUND

@pytest.mark.asyncio
async def test_get_transcript_missing(async_client: AsyncClient, normal_user_token_headers: dict[str, str]):
    random_id = str(uuid.uuid4())
    response = await async_client.get(f"/api/v1/meetings/{random_id}/transcript", headers=normal_user_token_headers)
    assert response.status_code == status.HTTP_404_NOT_FOUND

@pytest.mark.asyncio
async def test_unauthenticated_access(async_client: AsyncClient):
    response = await async_client.get("/api/v1/meetings")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
