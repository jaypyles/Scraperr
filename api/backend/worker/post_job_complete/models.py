from typing import TypedDict


class PostJobCompleteOptions(TypedDict):
    channel: str
    webhook_url: str
    scraperr_frontend_url: str
    email: str
    to: str
    smtp_host: str
    smtp_port: int
    smtp_user: str
    smtp_password: str
    use_tls: bool


JOB_COLOR_MAP = {
    "Queued": 0x0000FF,
    "Scraping": 0x0000FF,
    "Completed": 0x00FF00,
    "Failed": 0xFF0000,
}
