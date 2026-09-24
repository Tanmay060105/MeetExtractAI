import re
import io
import pypdf
import docx

def normalize_text(raw_text: str) -> str:
    """
    Normalizes transcript text deterministically:
    - Converts CRLF to LF
    - Trims leading/trailing whitespace
    - Collapses 3 or more consecutive newlines into exactly 2 newlines
    - Preserves timestamps and speaker labels
    """
    text = raw_text.replace('\r\n', '\n').strip()
    # Collapse >= 3 newlines to exactly 2
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text

def extract_pdf(file_bytes: bytes) -> str:
    """
    Extracts text from a PDF file in-memory.
    Raises ValueError for encrypted or corrupted PDFs.
    Raises ValueError for image-only (empty) PDFs.
    """
    try:
        reader = pypdf.PdfReader(io.BytesIO(file_bytes))
        if reader.is_encrypted:
            raise ValueError("Encrypted PDFs are not supported.")
            
        extracted_text = []
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                extracted_text.append(page_text)
                
        text = "\n".join(extracted_text)
        if not text.strip():
            raise ValueError("PDF contains no extractable text (image-only or scanned).")
            
        return text
    except pypdf.errors.PdfReadError as e:
        raise ValueError(f"Corrupt PDF file: {str(e)}")

def extract_docx(file_bytes: bytes) -> str:
    """
    Extracts paragraph text sequentially from a DOCX file in-memory.
    Raises ValueError for corrupt or empty DOCX files.
    """
    try:
        doc = docx.Document(io.BytesIO(file_bytes))
        extracted_text = []
        for para in doc.paragraphs:
            if para.text:
                extracted_text.append(para.text)
                
        text = "\n".join(extracted_text)
        if not text.strip():
            raise ValueError("DOCX contains no text.")
            
        return text
    except Exception as e: # docx raises package errors which are sometimes generic PackageNotFoundError
        raise ValueError(f"Corrupt DOCX file: {str(e)}")

def extract_txt(file_bytes: bytes) -> str:
    """
    Decodes UTF-8 text, handling optional BOM.
    """
    try:
        text = file_bytes.decode("utf-8-sig")
        if not text.strip():
            raise ValueError("TXT file contains no text.")
        return text
    except UnicodeDecodeError:
        raise ValueError("Invalid encoding. Only UTF-8 is supported.")
