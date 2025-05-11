from typing import Any

from api.backend.worker.post_job_complete.models import PostJobCompleteOptions
from api.backend.worker.post_job_complete.email_notifcation import (
    send_job_complete_email,
)
from api.backend.worker.post_job_complete.discord_notification import (
    discord_notification,
)


async def post_job_complete(job: dict[str, Any], options: PostJobCompleteOptions):
    if not options.values():
        return

    if options["channel"] == "discord":
        discord_notification(job, options)
    elif options["channel"] == "email":
        send_job_complete_email(job, options)
    else:
        raise ValueError(f"Invalid channel: {options['channel']}")
