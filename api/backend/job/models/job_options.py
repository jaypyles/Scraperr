from pydantic import BaseModel
from typing import Any, Optional
from api.backend.job.models.site_map import SiteMap


class FetchOptions(BaseModel):
    chat: Optional[bool] = None


class JobOptions(BaseModel):
    multi_page_scrape: bool = False
    custom_headers: dict[str, Any] = {}
    proxies: list[str] = []
    site_map: Optional[SiteMap] = None
