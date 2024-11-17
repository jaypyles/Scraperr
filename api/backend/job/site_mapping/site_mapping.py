from api.backend.job.models.site_map import Action, SiteMap
from selenium import webdriver
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.common.by import By
from typing import Any
import logging
import time
from copy import deepcopy

from api.backend.job.scraping.scraping_utils import scrape_content
from selenium.webdriver.support.ui import WebDriverWait
from seleniumwire.inspect import TimeoutException
from seleniumwire.webdriver import Chrome
from selenium.webdriver.support import expected_conditions as EC

LOG = logging.getLogger(__name__)


def clear_done_actions(site_map: dict[str, Any]):
    """Clear all actions that have been clicked."""
    cleared_site_map = deepcopy(site_map)

    cleared_site_map["actions"] = [
        action for action in cleared_site_map["actions"] if not action["do_once"]
    ]

    return cleared_site_map


def handle_input(action: Action, driver: webdriver.Chrome):
    try:
        element = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, action.xpath))
        )
        LOG.info(f"Sending keys: {action.input} to element: {element}")

        element.send_keys(action.input)

    except NoSuchElementException:
        LOG.info(f"Element not found: {action.xpath}")
        return False

    except TimeoutException:
        LOG.info(f"Timeout waiting for element: {action.xpath}")
        return False

    except Exception as e:
        LOG.info(f"Error handling input: {e}")
        return False

    return True


def handle_click(action: Action, driver: webdriver.Chrome):
    try:
        element = driver.find_element(By.XPATH, action.xpath)
        LOG.info(f"Clicking element: {element}")

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
        action_handler = ACTION_MAP[action.type]
        if not action_handler(action, driver):
            return

        time.sleep(2)

    _ = scrape_content(driver, pages)

    cleared_site_map_dict = clear_done_actions(site_map_dict)

    if cleared_site_map_dict["actions"]:
        await handle_site_mapping(cleared_site_map_dict, driver, pages)
