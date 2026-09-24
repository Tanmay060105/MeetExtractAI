from datetime import datetime
from typing import Optional
from openai import AsyncOpenAI
import json
from pydantic import ValidationError

from app.core.config import settings
from app.services.ai.base import AIProvider
from app.schemas.extraction import ExtractionResult

class OpenAIProvider(AIProvider):
    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.AI_API_KEY)
        self.model = settings.AI_MODEL or "gpt-4o-mini"
        
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
        
        response = await self.client.beta.chat.completions.parse(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Extract action items from the following transcript:\n\n{transcript_text}"}
            ],
            response_format=ExtractionResult,
            temperature=0.0
        )
        
        # The parsed response is strongly typed against our schema
        extraction_result = response.choices[0].message.parsed
        return extraction_result
