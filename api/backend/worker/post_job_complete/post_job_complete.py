# STL
from typing import Any

# LOCAL
from api.backend.worker.post_job_complete.models import PostJobCompleteOptions
from api.backend.worker.post_job_complete.email_notifcation import (
    send_job_complete_email,
)
from api.backend.worker.post_job_complete.discord_notification import (
    discord_notification,
)


async def post_job_complete(job: dict[str, Any], options: PostJobCompleteOptions):
    if options["channel"] == "":
        return

    if not options.values():
        return

    match options["channel"]:
        case "discord":
            discord_notification(job, options)
        case "email":
            send_job_complete_email(job, options)
        case _:
            raise ValueError(f"Invalid channel: {options['channel']}")
