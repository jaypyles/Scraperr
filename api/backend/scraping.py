# STL
import logging

# PDM
from bs4 import BeautifulSoup
from lxml import etree
from selenium import webdriver
from lxml.etree import _Element  # type: ignore [reportPrivateImport]
from fake_useragent import UserAgent
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.chrome.service import Service

# LOCAL
from api.backend.models import Element, CapturedElement

LOG = logging.getLogger(__name__)


class HtmlElement(_Element): ...


def clean_xpath(xpath: str) -> str:
    parts = xpath.split("/")
    clean_parts: list[str] = []
    for part in parts:
        if part == "":
            clean_parts.append("/")
        else:
            clean_parts.append(part)
    clean_xpath = "//".join(clean_parts).replace("////", "//")

    clean_xpath = clean_xpath.replace("'", "\\'")
    return clean_xpath


def sxpath(context: _Element, xpath: str) -> list[HtmlElement]:
    return context.xpath(xpath)  # type: ignore [reportReturnType]


async def make_site_request(url: str) -> str:
    """Make basic `GET` request to site using Selenium."""
    ua = UserAgent()

    chrome_options = ChromeOptions()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument(f"user-agent={ua.random}")

    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(options=chrome_options, service=service)

    try:
        driver.get(url)
        _ = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )
        page_source = driver.page_source
    finally:
        driver.quit()

    LOG.debug(f"Page source for url: {url}\n{page_source}")
    return page_source


async def collect_scraped_elements(page: str, xpaths: list[Element]):
    soup = BeautifulSoup(page, "lxml")
    root = etree.HTML(str(soup))

    elements: dict[str, list[CapturedElement]] = dict()

    for elem in xpaths:
        el = sxpath(root, clean_xpath(elem.xpath))
        text = ["\t".join(str(e) for e in e.itertext()) for e in el]
        captured_element = CapturedElement(
            xpath=elem.xpath, text=",".join(text), name=elem.name
        )

        if elem.name in elements:
            elements[elem.name].append(captured_element)
            continue

        elements[elem.name] = [captured_element]

    return elements


async def scrape(url: str, xpaths: list[Element]):
    page = await make_site_request(url)
    elements = await collect_scraped_elements(page, xpaths)

    return elements
