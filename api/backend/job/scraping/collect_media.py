import os
import requests
from pathlib import Path
from selenium.webdriver.common.by import By
from seleniumwire import webdriver
from urllib.parse import urlparse

from api.backend.utils import LOG


def collect_media(driver: webdriver.Chrome):
    media_types = {
        "images": "img",
        "videos": "video",
        "audio": "audio",
        "pdfs": 'a[href$=".pdf"]',
        "documents": 'a[href$=".doc"], a[href$=".docx"], a[href$=".txt"], a[href$=".rtf"]',
        "presentations": 'a[href$=".ppt"], a[href$=".pptx"]',
        "spreadsheets": 'a[href$=".xls"], a[href$=".xlsx"], a[href$=".csv"]',
    }

    base_dir = Path("media")
    base_dir.mkdir(exist_ok=True)

    media_urls = {}

    for media_type, selector in media_types.items():
        elements = driver.find_elements(By.CSS_SELECTOR, selector)
        urls: list[dict[str, str]] = []

        media_dir = base_dir / media_type
        media_dir.mkdir(exist_ok=True)

        for element in elements:
            if media_type == "images":
                url = element.get_attribute("src")
            elif media_type == "videos":
                url = element.get_attribute("src") or element.get_attribute("data-src")
            else:
                url = element.get_attribute("href")

            if url and url.startswith(("http://", "https://")):
                try:
                    filename = os.path.basename(urlparse(url).path)

                    if not filename:
                        filename = f"{media_type}_{len(urls)}"

                        if media_type == "images":
                            filename += ".jpg"
                        elif media_type == "videos":
                            filename += ".mp4"
                        elif media_type == "audio":
                            filename += ".mp3"
                        elif media_type == "pdfs":
                            filename += ".pdf"
                        elif media_type == "documents":
                            filename += ".doc"
                        elif media_type == "presentations":
                            filename += ".ppt"
                        elif media_type == "spreadsheets":
                            filename += ".xls"

                    response = requests.get(url, stream=True)
                    response.raise_for_status()

                    # Save the file
                    file_path = media_dir / filename
                    with open(file_path, "wb") as f:
                        for chunk in response.iter_content(chunk_size=8192):
                            if chunk:
                                f.write(chunk)

                    urls.append({"url": url, "local_path": str(file_path)})
                    LOG.info(f"Downloaded {filename} to {file_path}")

                except Exception as e:
                    LOG.error(f"Error downloading {url}: {str(e)}")
                    continue

        media_urls[media_type] = urls

    with open(base_dir / "download_summary.txt", "w") as f:
        for media_type, downloads in media_urls.items():
            if downloads:
                f.write(f"\n=== {media_type.upper()} ===\n")
                for download in downloads:
                    f.write(f"URL: {download['url']}\n")
                    f.write(f"Saved to: {download['local_path']}\n\n")

    return media_urls
