import os
import json

from api.backend.job import get_queued_job, update_job
from api.backend.scraping import scrape
from api.backend.models import Element
from fastapi.encoders import jsonable_encoder

import asyncio
import traceback

from api.backend.database.startup import init_database

from api.backend.worker.post_job_complete.post_job_complete import post_job_complete
from api.backend.worker.logger import LOG


NOTIFICATION_CHANNEL = os.getenv("NOTIFICATION_CHANNEL", "")
NOTIFICATION_WEBHOOK_URL = os.getenv("NOTIFICATION_WEBHOOK_URL", "")
SCRAPERR_FRONTEND_URL = os.getenv("SCRAPERR_FRONTEND_URL", "")
EMAIL = os.getenv("EMAIL", "")
TO = os.getenv("TO", "")
SMTP_HOST = os.getenv("SMTP_HOST", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
USE_TLS = os.getenv("USE_TLS", "false").lower() == "true"


async def process_job():
    job = await get_queued_job()
    status = "Queued"

    if job:
        LOG.info(f"Beginning processing job: {job}.")
        try:
            _ = await update_job([job["id"]], field="status", value="Scraping")

            proxies = job["job_options"]["proxies"]

            if proxies and isinstance(proxies[0], str) and proxies[0].startswith("{"):
                try:
                    proxies = [json.loads(p) for p in proxies]
                except json.JSONDecodeError:
                    LOG.error(f"Failed to parse proxy JSON: {proxies}")
                    proxies = []

            scraped = await scrape(
                job["url"],
                [Element(**j) for j in job["elements"]],
                job["job_options"]["custom_headers"],
                job["job_options"]["multi_page_scrape"],
                proxies,
                job["job_options"]["site_map"],
                job["job_options"]["collect_media"],
                job["job_options"]["custom_cookies"],
            )
            LOG.info(
                f"Scraped result for url: {job['url']}, with elements: {job['elements']}\n{scraped}"
            )
            _ = await update_job(
                [job["id"]], field="result", value=jsonable_encoder(scraped)
            )
            _ = await update_job([job["id"]], field="status", value="Completed")
            status = "Completed"

        except Exception as e:
            _ = await update_job([job["id"]], field="status", value="Failed")
            _ = await update_job([job["id"]], field="result", value=e)
            LOG.error(f"Exception as occured: {e}\n{traceback.print_exc()}")
            status = "Failed"
        finally:
            job["status"] = status
            await post_job_complete(
                job,
                {
                    "channel": NOTIFICATION_CHANNEL,
                    "webhook_url": NOTIFICATION_WEBHOOK_URL,
                    "scraperr_frontend_url": SCRAPERR_FRONTEND_URL,
                    "email": EMAIL,
                    "to": TO,
                    "smtp_host": SMTP_HOST,
                    "smtp_port": SMTP_PORT,
                    "smtp_user": SMTP_USER,
                    "smtp_password": SMTP_PASSWORD,
                    "use_tls": USE_TLS,
                },
            )


async def main():
    LOG.info("Starting job worker...")

    init_database()

    while True:
        await process_job()
        await asyncio.sleep(5)


if __name__ == "__main__":
    asyncio.run(main())
