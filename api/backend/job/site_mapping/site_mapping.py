import logging
import asyncio
from copy import deepcopy
from typing import Any

from playwright.async_api import Page

from api.backend.job.models.site_map import Action, SiteMap
from api.backend.job.scraping.scraping_utils import scrape_content

LOG = logging.getLogger(__name__)


def clear_done_actions(site_map: dict[str, Any]) -> dict[str, Any]:
    """Clear all actions that have been clicked."""
    cleared_site_map = deepcopy(site_map)
    cleared_site_map["actions"] = [
        action for action in cleared_site_map["actions"] if not action["do_once"]
    ]

    return cleared_site_map


async def handle_input(action: Action, page: Page) -> bool:
    try:
        element = page.locator(f"xpath={action.xpath}")
        await element.wait_for(state="visible", timeout=10000)
        LOG.info(f"Sending keys: {action.input} to element: {action.xpath}")
        await element.fill(action.input)
        return True
    except Exception as e:
        LOG.warning(f"Error handling input for xpath '{action.xpath}': {e}")
        return False


async def handle_click(action: Action, page: Page) -> bool:
    try:
        element = page.locator(f"xpath={action.xpath}")
        await element.wait_for(state="visible", timeout=10000)
        LOG.info(f"Clicking element: {action.xpath}")
        await element.click()
        return True
    except Exception as e:
        LOG.warning(f"Error clicking element at xpath '{action.xpath}': {e}")
        return False


ACTION_MAP = {
    "click": handle_click,
    "input": handle_input,
}


async def handle_site_mapping(
    site_map_dict: dict[str, Any],
    page: Page,
    pages: set[tuple[str, str]],
    collect_media: bool = False,
):
    site_map = SiteMap(**site_map_dict)

    for action in site_map.actions:
        action_handler = ACTION_MAP[action.type]
        success = await action_handler(action, page)

        if not success:
            return

        await asyncio.sleep(2)

    await scrape_content(page, pages, collect_media=collect_media)

    cleared_site_map_dict = clear_done_actions(site_map_dict)

    if cleared_site_map_dict["actions"]:
        await handle_site_mapping(
            cleared_site_map_dict, page, pages, collect_media=collect_media
        )
