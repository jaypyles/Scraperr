import json
from typing import Any

import requests

from api.backend.worker.logger import LOG
from api.backend.worker.post_job_complete.models import (
    PostJobCompleteOptions,
    JOB_COLOR_MAP,
)


def discord_notification(job: dict[str, Any], options: PostJobCompleteOptions):
    webhook_url = options["webhook_url"]
    scraperr_frontend_url = options["scraperr_frontend_url"]

    LOG.info(f"Sending discord notification to {webhook_url}")

    embed = {
        "title": "Job Completed",
        "description": "Scraping job has been completed.",
        "color": JOB_COLOR_MAP[job["status"]],
        "url": f"{scraperr_frontend_url}/jobs?search={job['id']}&type=id",
        "image": {
            "url": "https://github.com/jaypyles/Scraperr/raw/master/docs/logo_picture.png",
        },
        "author": {
            "name": "Scraperr",
            "url": "https://github.com/jaypyles/Scraperr",
        },
        "fields": [
            {
                "name": "Status",
                "value": "Completed",
                "inline": True,
            },
            {
                "name": "URL",
                "value": job["url"],
                "inline": True,
            },
            {
                "name": "ID",
                "value": job["id"],
                "inline": False,
            },
            {
                "name": "Options",
                "value": f"```json\n{json.dumps(job['job_options'], indent=4)}\n```",
                "inline": False,
            },
        ],
    }

    payload = {"embeds": [embed]}
    requests.post(webhook_url, json=payload)
