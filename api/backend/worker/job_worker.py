from api.backend.job import get_queued_job, update_job
from api.backend.scraping import scrape
from api.backend.models import Element
from fastapi.encoders import jsonable_encoder

import asyncio
import logging
import sys
import traceback

logging.basicConfig(stream=sys.stdout, level=logging.INFO)
LOG = logging.getLogger(__name__)


async def process_job():
    job = await get_queued_job()
    if job:
        LOG.info(f"Beginning processing job: {job}.")
        try:
            _ = await update_job([job["id"]], field="status", value="Scraping")
            scraped = await scrape(
                job["url"],
                [Element(**j) for j in job["elements"]],
                job["job_options"]["custom_headers"],
                job["job_options"]["multi_page_scrape"],
            )
            LOG.info(
                f"Scraped result for url: {job['url']}, with elements: {job['elements']}\n{scraped}"
            )
            _ = await update_job(
                [job["id"]], field="result", value=jsonable_encoder(scraped)
            )
            _ = await update_job([job["id"]], field="status", value="Completed")
        except Exception as e:
            _ = await update_job([job["id"]], field="status", value="Failed")
            _ = await update_job([job["id"]], field="result", value=e)
            LOG.error(f"Exception as occured: {e}\n{traceback.print_exc()}")


async def main():
    LOG.info("Starting job worker...")
    while True:
        await process_job()
        await asyncio.sleep(5)


if __name__ == "__main__":
    asyncio.run(main())
