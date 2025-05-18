from api.backend.ai.agent.actions import AgentJob
from camoufox import AsyncCamoufox
from playwright.async_api import Page

from api.backend.ai.agent.utils import (
    capture_elements,
    convert_to_markdown,
    parse_next_page,
    parse_response,
)

from api.backend.ai.clients import ask_open_ai, ask_ollama, open_ai_key

from api.backend.ai.agent.prompts import (
    ELEMENT_EXTRACTION_PROMPT,
    EXTRACT_ELEMENTS_PROMPT,
)

ask_ai = ask_open_ai if open_ai_key else ask_ollama


async def start_work(agent_job: AgentJob):
    pages = set()

    async with AsyncCamoufox(headless=True) as browser:
        page: Page = await browser.new_page()

        try:
            await page.set_viewport_size({"width": 1920, "height": 1080})
            await page.goto(agent_job["url"], timeout=60000)

            html_content = await page.content()
            markdown_content = convert_to_markdown(html_content)

            print(markdown_content)

            response = await ask_ai(
                ELEMENT_EXTRACTION_PROMPT.format(
                    extraction_prompt=EXTRACT_ELEMENTS_PROMPT,
                    webpage=markdown_content,
                    prompt=agent_job["prompt"],
                )
            )

            print(response)

            xpaths = parse_response(response)
            next_page = parse_next_page(response)

            print(xpaths)
            print(next_page)

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

    return [
        {
            page[1]: name_to_elements,
        }
        for page in pages
    ]
