import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import status
import io
import docx
import pypdf

from app.models.user import User
from app.core.security import get_password_hash, create_access_token
import uuid


@pytest.fixture
def valid_pdf_bytes():
    pdf_writer = pypdf.PdfWriter()
    page = pdf_writer.add_blank_page(width=200, height=200)
    
    # Unfortunately writing text to a pdf from scratch with pypdf is complex.
    # We will mock the extraction for tests, or just test the exceptions.
    # Wait, pypdf doesn't easily create text PDFs. We can create a dummy one with another tool
    # or just use mocking for the extraction since it's a 3rd party library.
    # Actually, let's just mock the extract_pdf function for integration tests,
    # OR we can test the API error handling with blank pdfs.
    pdf_io = io.BytesIO()
    pdf_writer.write(pdf_io)
    return pdf_io.getvalue()

@pytest.fixture
def valid_docx_bytes():
    doc = docx.Document()
    doc.add_paragraph("Hello world")
    doc_io = io.BytesIO()
    doc.save(doc_io)
    return doc_io.getvalue()

@pytest.mark.asyncio
async def test_create_meeting_text_success(
    async_client: AsyncClient,
    normal_user_token_headers: dict[str, str]
):
    response = await async_client.post(
        "/api/v1/meetings/text",
        headers=normal_user_token_headers,
        json={
            "title": "Text Meeting",
            "text": "This is a transcript.\n\n\nIt has newlines."
        }
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["title"] == "Text Meeting"
    assert data["processing_status"] == "PROCESSING"
    
    # Verify transcript
    meeting_id = data["id"]
    transcript_resp = await async_client.get(
        f"/api/v1/meetings/{meeting_id}/transcript",
        headers=normal_user_token_headers
    )
    assert transcript_resp.status_code == status.HTTP_200_OK
    t_data = transcript_resp.json()
    assert t_data["raw_text"] == "This is a transcript.\n\n\nIt has newlines."
    assert t_data["normalized_text"] == "This is a transcript.\n\nIt has newlines."

@pytest.mark.asyncio
async def test_create_meeting_text_empty(
    async_client: AsyncClient,
    normal_user_token_headers: dict[str, str]
):
    response = await async_client.post(
        "/api/v1/meetings/text",
        headers=normal_user_token_headers,
        json={"title": "Empty", "text": "   "}
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST

@pytest.mark.asyncio
async def test_create_meeting_text_oversized(
    async_client: AsyncClient,
    normal_user_token_headers: dict[str, str]
):
    # 5MB + 1 byte
    large_text = "a" * (5 * 1024 * 1024 + 1)
    response = await async_client.post(
        "/api/v1/meetings/text",
        headers=normal_user_token_headers,
        json={"title": "Oversized", "text": large_text}
    )
    assert response.status_code == status.HTTP_413_REQUEST_ENTITY_TOO_LARGE

@pytest.mark.asyncio
async def test_upload_txt_success(
    async_client: AsyncClient,
    normal_user_token_headers: dict[str, str]
):
    file_content = b"Uploaded text content.\r\nLine 2."
    files = {"file": ("test.txt", file_content, "text/plain")}
    data = {"title": "TXT Upload"}
    
    response = await async_client.post(
        "/api/v1/meetings/upload",
        headers=normal_user_token_headers,
        data=data,
        files=files
    )
    assert response.status_code == status.HTTP_201_CREATED
    meeting_id = response.json()["id"]
    
    transcript_resp = await async_client.get(
        f"/api/v1/meetings/{meeting_id}/transcript",
        headers=normal_user_token_headers
    )
    assert transcript_resp.json()["normalized_text"] == "Uploaded text content.\nLine 2."

@pytest.mark.asyncio
async def test_upload_docx_success(
    async_client: AsyncClient,
    normal_user_token_headers: dict[str, str],
    valid_docx_bytes: bytes
):
    files = {"file": ("test.docx", valid_docx_bytes, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")}
    data = {"title": "DOCX Upload"}
    
    response = await async_client.post(
        "/api/v1/meetings/upload",
        headers=normal_user_token_headers,
        data=data,
        files=files
    )
    assert response.status_code == status.HTTP_201_CREATED
    assert response.json()["source_type"] == "DOCX"

@pytest.mark.asyncio
async def test_upload_pdf_empty_image_only(
    async_client: AsyncClient,
    normal_user_token_headers: dict[str, str],
    valid_pdf_bytes: bytes
):
    files = {"file": ("test.pdf", valid_pdf_bytes, "application/pdf")}
    data = {"title": "PDF Upload"}
    
    response = await async_client.post(
        "/api/v1/meetings/upload",
        headers=normal_user_token_headers,
        data=data,
        files=files
    )
    # The dummy PDF has no text, so it should be rejected as image-only
    assert response.status_code == status.HTTP_400_BAD_REQUEST

@pytest.mark.asyncio
async def test_upload_mismatch(
    async_client: AsyncClient,
    normal_user_token_headers: dict[str, str]
):
    # Extension .pdf but MIME is text/plain
    files = {"file": ("test.pdf", b"fake", "text/plain")}
    data = {"title": "Mismatch"}
    response = await async_client.post(
        "/api/v1/meetings/upload",
        headers=normal_user_token_headers,
        data=data,
        files=files
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST

@pytest.mark.asyncio
async def test_upload_oversized(
    async_client: AsyncClient,
    normal_user_token_headers: dict[str, str]
):
    # 10MB + 1 byte
    large_bytes = b"a" * (10 * 1024 * 1024 + 1)
    files = {"file": ("test.txt", large_bytes, "text/plain")}
    data = {"title": "Oversized Upload"}
    
    response = await async_client.post(
        "/api/v1/meetings/upload",
        headers=normal_user_token_headers,
        data=data,
        files=files
    )
    assert response.status_code == status.HTTP_413_REQUEST_ENTITY_TOO_LARGE

@pytest.mark.asyncio
async def test_cross_user_isolation(
    async_client: AsyncClient,
    normal_user_token_headers: dict[str, str],
    admin_token_headers: dict[str, str]
):
    # User 1 creates meeting
    response = await async_client.post(
        "/api/v1/meetings/text",
        headers=normal_user_token_headers,
        json={"title": "User 1 Meeting", "text": "Secret"}
    )
    meeting_id = response.json()["id"]
    
    # User 2 tries to read it
    read_resp = await async_client.get(
        f"/api/v1/meetings/{meeting_id}",
        headers=admin_token_headers
    )
    assert read_resp.status_code == status.HTTP_404_NOT_FOUND
    
    read_transcript_resp = await async_client.get(
        f"/api/v1/meetings/{meeting_id}/transcript",
        headers=admin_token_headers
    )
    assert read_transcript_resp.status_code == status.HTTP_404_NOT_FOUND
