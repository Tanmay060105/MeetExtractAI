from typing import Any
from sqlalchemy.orm import DeclarativeBase, declared_attr
from sqlalchemy.ext.asyncio import AsyncAttrs
import re

def camel_to_snake(name: str) -> str:
    name = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
    return re.sub('([a-z0-9])([A-Z])', r'\1_\2', name).lower()

class Base(AsyncAttrs, DeclarativeBase):
    id: Any
    __name__: str
    
    # Generate __tablename__ automatically
    @declared_attr.directive
    def __tablename__(cls) -> str:
        snake_name = camel_to_snake(cls.__name__)
        # simple pluralization
        if snake_name.endswith('s'):
            return snake_name
        return snake_name + 's'
