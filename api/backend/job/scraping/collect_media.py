import os
from pathlib import Path
from urllib.parse import urlparse
from typing import Dict, List

import aiohttp
from playwright.async_api import Page

from api.backend.utils import LOG


async def collect_media(page: Page) -> dict[str, list[dict[str, str]]]:
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

    async with aiohttp.ClientSession() as session:
        for media_type, selector in media_types.items():
            elements = await page.query_selector_all(selector)
            urls: List[Dict[str, str]] = []

            media_dir = base_dir / media_type
            media_dir.mkdir(exist_ok=True)

            for element in elements:
                if media_type == "images":
                    url = await element.get_attribute("src")
                elif media_type == "videos":
                    url = await element.get_attribute(
                        "src"
                    ) or await element.get_attribute("data-src")
                else:
                    url = await element.get_attribute("href")

                if url and url.startswith("/"):
                    root_url = urlparse(page.url)
                    root_domain = f"{root_url.scheme}://{root_url.netloc}"
                    url = f"{root_domain}{url}"

                if url and url.startswith(("http://", "https://")):
                    try:
                        parsed = urlparse(url)
                        filename = (
                            os.path.basename(parsed.path) or f"{media_type}_{len(urls)}"
                        )

                        if "." not in filename:
                            ext = {
                                "images": ".jpg",
                                "videos": ".mp4",
                                "audio": ".mp3",
                                "pdfs": ".pdf",
                                "documents": ".doc",
                                "presentations": ".ppt",
                                "spreadsheets": ".xls",
                            }.get(media_type, "")
                            filename += ext

                        file_path = media_dir / filename

                        async with session.get(url) as response:
                            response.raise_for_status()
                            with open(file_path, "wb") as f:
                                while True:
                                    chunk = await response.content.read(8192)
                                    if not chunk:
                                        break
                                    f.write(chunk)

                        urls.append({"url": url, "local_path": str(file_path)})
                        LOG.info(f"Downloaded {filename} to {file_path}")

                    except Exception as e:
                        LOG.error(f"Error downloading {url}: {str(e)}")
                        continue

            media_urls[media_type] = urls

    # Write summary
    with open(base_dir / "download_summary.txt", "w") as f:
        for media_type, downloads in media_urls.items():
            if downloads:
                f.write(f"\n=== {media_type.upper()} ===\n")
                for download in downloads:
                    f.write(f"URL: {download['url']}\n")
                    f.write(f"Saved to: {download['local_path']}\n\n")

    return media_urls
