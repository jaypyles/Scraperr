# STL
from typing import Any, Optional

# PDM
from pydantic import BaseModel

# LOCAL
from api.backend.job.models.site_map import SiteMap


class Proxy(BaseModel):
    server: str
    username: Optional[str] = None
    password: Optional[str] = None


class FetchOptions(BaseModel):
    chat: Optional[bool] = None


class JobOptions(BaseModel):
    multi_page_scrape: bool = False
    custom_headers: dict[str, Any] = {}
    proxies: list[Proxy] = []
    site_map: Optional[SiteMap] = None
    collect_media: bool = False
    custom_cookies: list[dict[str, Any]] = []
