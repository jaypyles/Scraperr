# STL
from typing import Any, Optional
from datetime import datetime

# PDM
import pydantic


class Element(pydantic.BaseModel):
    name: str
    xpath: str
    url: Optional[str] = None


class CapturedElement(pydantic.BaseModel):
    xpath: str
    text: str
    name: str


class JobOptions(pydantic.BaseModel):
    multi_page_scrape: bool
    custom_headers: Optional[dict[str, Any]]


class SubmitScrapeJob(pydantic.BaseModel):
    id: Optional[str] = None
    url: str
    elements: list[Element]
    user: Optional[str] = None
    time_created: Optional[datetime] = None
    result: Optional[dict[str, Any]] = None
    job_options: JobOptions
    status: str = "Queued"


class RetrieveScrapeJobs(pydantic.BaseModel):
    user: str


class DownloadJob(pydantic.BaseModel):
    ids: list[str]


class DeleteScrapeJobs(pydantic.BaseModel):
    ids: list[str]


class GetStatistics(pydantic.BaseModel):
    user: str
