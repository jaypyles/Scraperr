# STL
from typing import Any

# PDM
import pydantic


class AI(pydantic.BaseModel):
    messages: list[Any]
