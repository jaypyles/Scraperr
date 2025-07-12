# STL
import json
import asyncio
import traceback
import subprocess

# PDM
from fastapi.encoders import jsonable_encoder

# LOCAL
from api.backend.job import update_job, get_queued_job
from api.backend.job.models import Element
from api.backend.worker.logger import LOG
from api.backend.ai.agent.agent import scrape_with_agent
from api.backend.worker.constants import (
    TO,
    EMAIL,
    USE_TLS,
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASSWORD,
    RECORDINGS_DIR,
    RECORDINGS_ENABLED,
    NOTIFICATION_CHANNEL,
    SCRAPERR_FRONTEND_URL,
    NOTIFICATION_WEBHOOK_URL,
)
from api.backend.job.scraping.scraping import scrape
from api.backend.worker.post_job_complete.post_job_complete import post_job_complete


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
                scraped = await scrape_with_agent(job)
            else:
                scraped = await scrape(
                    job["id"],
                    job["url"],
                    [Element(**j) for j in job["elements"]],
                    {**job["job_options"], "proxies": proxies},
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

    RECORDINGS_DIR.mkdir(parents=True, exist_ok=True)

    while True:
        await process_job()
        await asyncio.sleep(5)


if __name__ == "__main__":
    asyncio.run(main())
