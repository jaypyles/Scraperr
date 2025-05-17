<div align="center">
  <img src="https://github.com/jaypyles/www-scrape/blob/master/docs/logo_picture.png" alt="Scraperr Logo" width="250px">
  
  **A powerful self-hosted web scraping solution**
  
  <div>
    <img src="https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
    <img src="https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi" alt="FastAPI" />
    <img src="https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next JS" />
    <img src="https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="TailwindCSS" />
  </div>
</div>

## 📋 Overview

Scrape websites without writing a single line of code.

> 📚 **[Check out the docs](https://scraperr-docs.pages.dev)** for a comprehensive quickstart guide and detailed information.

<div align="center">
  <img src="https://github.com/jaypyles/www-scrape/blob/master/docs/main_page.png" alt="Scraperr Main Interface" width="800px">
</div>

## ✨ Key Features

- **XPath-Based Extraction**: Precisely target page elements
- **Queue Management**: Submit and manage multiple scraping jobs
- **Domain Spidering**: Option to scrape all pages within the same domain
- **Custom Headers**: Add JSON headers to your scraping requests
- **Media Downloads**: Automatically download images, videos, and other media
- **Results Visualization**: View scraped data in a structured table format
- **Data Export**: Export your results in markdown and csv formats
- **Notifcation Channels**: Send completion notifcations, through various channels

## 🚀 Getting Started

### Docker

```bash
make up
```

### Helm

> Refer to the docs for helm deployment: https://scraperr-docs.pages.dev/guides/helm-deployment

## ⚖️ Legal and Ethical Guidelines

When using Scraperr, please remember to:

1. **Respect `robots.txt`**: Always check a website's `robots.txt` file to verify which pages permit scraping
2. **Terms of Service**: Adhere to each website's Terms of Service regarding data extraction
3. **Rate Limiting**: Implement reasonable delays between requests to avoid overloading servers

> **Disclaimer**: Scraperr is intended for use only on websites that explicitly permit scraping. The creator accepts no responsibility for misuse of this tool.

## 💬 Join the Community

Get support, report bugs, and chat with other users and contributors.

👉 [Join the Scraperr Discord](https://discord.gg/89q7scsGEK)

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 👏 Contributions

Development made easier with the [webapp template](https://github.com/jaypyles/webapp-template).

To get started, simply run `make build up-dev`.