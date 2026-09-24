from datetime import datetime
from typing import Optional

from google import genai
from google.genai import types

from app.core.config import settings
from app.services.ai.base import AIProvider
from app.schemas.extraction import ExtractionResult

def _remove_additional_properties(schema: dict) -> dict:
    """
    Recursively remove 'additionalProperties' from a JSON schema.
    The Gemini Developer API rejects schemas containing this key.
    """
    if isinstance(schema, dict):
        schema.pop("additionalProperties", None)
        for key, value in schema.items():
            _remove_additional_properties(value)
    elif isinstance(schema, list):
        for item in schema:
            _remove_additional_properties(item)
    return schema

class GeminiProvider(AIProvider):
    def __init__(self):
        # The genai SDK automatically looks for GEMINI_API_KEY if not passed explicitly,
        # but since our env var is AI_API_KEY, we pass it explicitly.
        self.client = genai.Client(api_key=settings.AI_API_KEY)
        self.model = settings.AI_MODEL or "gemini-2.5-flash"
        
    async def extract_action_items(self, transcript_text: str, reference_date: Optional[datetime] = None) -> ExtractionResult:
        date_context = ""
        if reference_date:
            date_context = f"\n        The transcript was recorded on or around {reference_date.isoformat()}. Use this as a fallback reference date to resolve relative deadlines (e.g., 'next Wednesday') into absolute ISO8601 datetimes. Do not assume this is the exact recording date unless confirmed by the transcript."

        system_prompt = f"""
        You are an AI assistant designed to extract action items from meeting transcripts.
        Identify explicit and reasonably implied action items from the transcript.{date_context}
        
        For each action item attempt to extract:
        - task: The concrete action that someone committed to performing. Do not fabricate.
        - owner_name: The person responsible, if identifiable. Null if not explicitly stated or implied.
        - deadline: The deadline if explicitly stated or can be safely resolved from the transcript. Format as ISO8601. If a relative deadline cannot be safely resolved from the available reference date/context, return null.
        - status: Usually PENDING.
        - confidence: A provisional model confidence value (0.0 to 1.0).
        - evidence: A concise supporting quote/reference from the transcript. Null if none.
        - source_location: Can be left null.
        
        Important:
        - Do not fabricate information.
        - If an owner is not identifiable, owner_name = null
        - If a deadline is not identifiable, deadline = null
        - If evidence cannot be reliably identified, do not invent evidence.
        - If no actionable item exists, return an empty actions list.
        - Distinguish action items from general discussion. Avoid converting every statement into a task.
        """
        
        # Generate and clean the JSON schema
        raw_schema = ExtractionResult.model_json_schema()
        cleaned_schema = _remove_additional_properties(raw_schema)
        
        # We must await the async models.generate_content call
        response = await self.client.aio.models.generate_content(
            model=self.model,
            contents=[f"Extract action items from the following transcript:\n\n{transcript_text}"],
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
                response_mime_type="application/json",
                response_schema=cleaned_schema,
                temperature=0.0
            )
        )
        
        # If the SDK populated response.parsed (or for mocked tests)
        if hasattr(response, "parsed") and response.parsed is not None:
            if isinstance(response.parsed, ExtractionResult):
                return response.parsed
            
        # Parse Gemini's returned JSON string using Pydantic
        return ExtractionResult.model_validate_json(response.text)
