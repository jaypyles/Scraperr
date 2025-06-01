# STL
import random
from typing import Any

# PDM
from camoufox import AsyncCamoufox
from playwright.async_api import Page

# LOCAL
from api.backend.ai.clients import ask_ollama, ask_open_ai, open_ai_key
from api.backend.job.models import CapturedElement
from api.backend.worker.logger import LOG
from api.backend.ai.agent.utils import (
    parse_response,
    capture_elements,
    convert_to_markdown,
)
from api.backend.ai.agent.prompts import (
    EXTRACT_ELEMENTS_PROMPT,
    ELEMENT_EXTRACTION_PROMPT,
)
from api.backend.job.scraping.add_custom import add_custom_items
from api.backend.job.scraping.collect_media import collect_media

ask_ai = ask_open_ai if open_ai_key else ask_ollama


async def scrape_with_agent(agent_job: dict[str, Any]):
    LOG.info(f"Starting work for agent job: {agent_job}")
    pages = set()

    if agent_job["job_options"]["proxies"]:
        proxy = random.choice(agent_job["job_options"]["proxies"])
        LOG.info(f"Using proxy: {proxy}")

    async with AsyncCamoufox(headless=True) as browser:
        page: Page = await browser.new_page()

        await add_custom_items(
            agent_job["url"],
            page,
            agent_job["job_options"]["custom_cookies"],
            agent_job["job_options"]["custom_headers"],
        )

        try:
            await page.set_viewport_size({"width": 1920, "height": 1080})
            await page.goto(agent_job["url"], timeout=60000)

            if agent_job["job_options"]["collect_media"]:
                await collect_media(agent_job["id"], page)

            html_content = await page.content()
            markdown_content = convert_to_markdown(html_content)

            response = await ask_ai(
                ELEMENT_EXTRACTION_PROMPT.format(
                    extraction_prompt=EXTRACT_ELEMENTS_PROMPT,
                    webpage=markdown_content,
                    prompt=agent_job["prompt"],
                )
            )

            xpaths = parse_response(response)

            captured_elements = await capture_elements(page, xpaths)

            final_url = page.url

            pages.add((html_content, final_url))
        finally:
            await page.close()
            await browser.close()

    name_to_elements = {}

    for page in pages:
        for element in captured_elements:
            if element.name not in name_to_elements:
                name_to_elements[element.name] = []

            name_to_elements[element.name].append(element)

    scraped_elements: list[dict[str, dict[str, list[CapturedElement]]]] = [
        {
            page[1]: name_to_elements,
        }
        for page in pages
    ]

    return scraped_elements
