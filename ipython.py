# STL
import asyncio

# LOCAL
from api.backend.scraping import scrape


async def main():
    url = "https://darksouls3.wiki.fextralife.com/Dark+Souls+3"
    xpaths = [".//h3[@class='bonfire']", ".//div[@class='comment']"]
    scraped = await scrape(url, xpaths)

    print(scraped)


if __name__ == "__main__":
    asyncio.run(main())
