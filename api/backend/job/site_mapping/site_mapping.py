from api.backend.job.models.site_map import Action, SiteMap
from selenium import webdriver
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.common.by import By
from typing import Any
import logging
import time
from copy import deepcopy

from api.backend.job.scraping.scraping_utils import scrape_content
from seleniumwire.webdriver import Chrome

LOG = logging.getLogger(__name__)


def clear_done_actions(site_map: dict[str, Any]):
    """Clear all actions that have been clicked."""
    cleared_site_map = deepcopy(site_map)

    cleared_site_map["actions"] = [
        action for action in cleared_site_map["actions"] if not action["click_once"]
    ]

    return cleared_site_map


def handle_input(action: Action, driver: webdriver.Chrome):
    try:
        element = driver.find_element(By.XPATH, action.xpath)
        element.send_keys(action.input)
    except NoSuchElementException:
        LOG.info(f"Element not found: {action.xpath}")
        return False

    return True


def handle_click(action: Action, driver: webdriver.Chrome):
    try:
        element = driver.find_element(By.XPATH, action.xpath)
        element.click()
    except NoSuchElementException:
        LOG.info(f"Element not found: {action.xpath}")
        return False

    return True


ACTION_MAP = {
    "click": handle_click,
    "input": handle_input,
}


async def handle_site_mapping(
    site_map_dict: dict[str, Any],
    driver: Chrome,
    pages: set[tuple[str, str]],
):
    site_map = SiteMap(**site_map_dict)
    LOG.info(f"Handling site map: {site_map}")

    for action in site_map.actions:
        LOG.info(f"Handling action: {action}")
        action_handler = ACTION_MAP[action.type]
        if not action_handler(action, driver):
            return
        time.sleep(2)

    page_source = scrape_content(driver, pages)
    with open("scraping/page_source.html", "w") as f:
        f.write(page_source)

    cleared_site_map_dict = clear_done_actions(site_map_dict)

    if cleared_site_map_dict["actions"]:
        LOG.info(f"Found more actions to perform: {cleared_site_map_dict}")
        await handle_site_mapping(cleared_site_map_dict, driver, pages)
