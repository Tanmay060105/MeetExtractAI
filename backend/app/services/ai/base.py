from abc import ABC, abstractmethod
from typing import Any, Optional
from datetime import datetime

from app.schemas.extraction import ExtractionResult

class AIProvider(ABC):
    """
    Abstract base class for AI extraction providers.
    """
    
    @abstractmethod
    async def extract_action_items(self, transcript_text: str, reference_date: Optional[datetime] = None) -> ExtractionResult:
        """
        Extract structured action items from the given transcript text.
        
        Args:
            transcript_text: The normalized transcript text.
            
        Returns:
            An ExtractionResult containing the list of ExtractedAction objects.
            
        Raises:
            Exception: Implementation-specific exceptions that should be caught
                       by the extraction service.
        """
        pass
