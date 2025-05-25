from typing import Any, Literal, Optional, Union
from datetime import datetime
from api.backend.job.models.job_options import JobOptions
import pydantic

from api.backend.job.models import Element, CapturedElement


class Job(pydantic.BaseModel):
    id: Optional[str] = None
    url: str
    elements: list[Element]
    user: str = ""
    time_created: Optional[Union[datetime, str]] = None
    result: list[dict[str, dict[str, list[CapturedElement]]]] = []
    job_options: JobOptions
    status: str = "Queued"
    chat: Optional[str] = None
    agent_mode: bool = False
    prompt: Optional[str] = None
    favorite: bool = False


class RetrieveScrapeJobs(pydantic.BaseModel):
    user: str


class DownloadJob(pydantic.BaseModel):
    ids: list[str]
    job_format: Literal["csv", "md"]


class DeleteScrapeJobs(pydantic.BaseModel):
    ids: list[str]


class UpdateJobs(pydantic.BaseModel):
    ids: list[str]
    field: str
    value: Any
