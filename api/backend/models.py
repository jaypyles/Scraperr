# STL
from typing import Any, Optional

# PDM
import pydantic


class Element(pydantic.BaseModel):
    name: str
    url: str
    xpath: str


class CapturedElement(pydantic.BaseModel):
    xpath: str
    text: str
    name: str


class SubmitScrapeJob(pydantic.BaseModel):
    id: Optional[str] = None
    url: str
    elements: list[Element]
    user: str
    time_created: str
    result: Optional[dict[str, Any]] = None


class RetrieveScrapeJobs(pydantic.BaseModel):
    user: str


class DownloadJob(pydantic.BaseModel):
    id: str
