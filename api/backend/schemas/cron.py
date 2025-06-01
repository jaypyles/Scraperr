from typing import Optional, Union
from datetime import datetime
import pydantic


class CronJob(pydantic.BaseModel):
    id: Optional[str] = None
    user_email: str
    job_id: str
    cron_expression: str
    time_created: Optional[Union[datetime, str]] = None
    time_updated: Optional[Union[datetime, str]] = None


class DeleteCronJob(pydantic.BaseModel):
    id: str
    user_email: str
