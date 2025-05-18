import os
import json
from pathlib import Path

from api.backend.job import get_queued_job, update_job
from api.backend.scraping import scrape
from api.backend.models import Element
from fastapi.encoders import jsonable_encoder
import subprocess

import asyncio
import traceback

from api.backend.database.startup import init_database

from api.backend.worker.post_job_complete.post_job_complete import post_job_complete
from api.backend.worker.logger import LOG

from api.backend.ai.agent.agent import start_work


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

RECORDINGS_ENABLED = os.getenv("RECORDINGS_ENABLED", "true").lower() == "true"
RECORDINGS_DIR = Path("/project/app/media/recordings")


async def process_job():
    job = await get_queued_job()
    ffmpeg_proc = None
    status = "Queued"

    if job:
        LOG.info(f"Beginning processing job: {job}.")

        try:
            output_path = RECORDINGS_DIR / f"{job['id']}.mp4"

            if RECORDINGS_ENABLED:
                ffmpeg_proc = subprocess.Popen(
                    [
                        "ffmpeg",
                        "-y",
                        "-video_size",
                        "1280x1024",
                        "-framerate",
                        "15",
                        "-f",
                        "x11grab",
                        "-i",
                        ":99",
                        "-codec:v",
                        "libx264",
                        "-preset",
                        "ultrafast",
                        output_path,
                    ]
                )

            _ = await update_job([job["id"]], field="status", value="Scraping")

            proxies = job["job_options"]["proxies"]

            if proxies and isinstance(proxies[0], str) and proxies[0].startswith("{"):
                try:
                    proxies = [json.loads(p) for p in proxies]
                except json.JSONDecodeError:
                    LOG.error(f"Failed to parse proxy JSON: {proxies}")
                    proxies = []

            if job["agent_mode"]:
                scraped = await start_work(job)
            else:
                scraped = await scrape(
                    job["id"],
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

            if ffmpeg_proc:
                ffmpeg_proc.terminate()
                ffmpeg_proc.wait()


async def main():
    LOG.info("Starting job worker...")

    init_database()

    RECORDINGS_DIR.mkdir(parents=True, exist_ok=True)

    while True:
        await process_job()
        await asyncio.sleep(5)


if __name__ == "__main__":
    asyncio.run(main())
