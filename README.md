![logo_picture](https://github.com/jaypyles/www-scrape/blob/master/docs/logo_picture.png)

<div align="center">
  <img src="https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next JS" />
  <img src="https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="TailwindCSS" />
</div>

# Summary

Scraperr is a self-hosted web application that allows users to scrape data from web pages by specifying elements via XPath. Users can submit URLs and the corresponding elements to be scraped, and the results will be displayed in a table.

From the table, users can download an excel sheet of the job's results, along with an option to rerun the job.

View the [docs](https://scraperr-docs.pages.dev) for a quickstart guide and more information.

## Features

### Submitting URLs for Scraping

- Submit/Queue URLs for web scraping
- Add and manage elements to scrape using XPath
- Scrape all pages within same domain
- Add custom json headers to send in requests to URLs
- Display results of scraped data
- Download media found on the page (images, videos, etc.)

![main_page](https://github.com/jaypyles/www-scrape/blob/master/docs/main_page.png)

### Managing Previous Jobs

- Download csv containing results
- Rerun jobs
- View status of queued jobs
- Favorite and view favorited jobs

![job_page](https://github.com/jaypyles/www-scrape/blob/master/docs/job_page.png)

### User Management

- User login/signup to organize jobs (optional)

![login](https://github.com/jaypyles/www-scrape/blob/master/docs/login.png)

### Log Viewing

- View app logs inside of web ui

![logs](https://github.com/jaypyles/www-scrape/blob/master/docs/log_page.png)

### Statistics View

- View a small statistics view of jobs ran

![statistics](https://github.com/jaypyles/www-scrape/blob/master/docs/stats_page.png)

### AI Integration

- Include the results of a selected job into the context of a conversation
- Currently supports:

1. Ollama
2. OpenAI

![chat](https://github.com/jaypyles/www-scrape/blob/master/docs/chat_page.png)

## API Endpoints

Use this service as an API for your own projects. Due to this using FastAPI, a docs page is available at `/docs` for the API.

![docs](https://github.com/jaypyles/www-scrape/blob/master/docs/docs_page.png)

## Troubleshooting

Q: When running Scraperr, I'm met with "404 Page not found".  
A: This is probably an issue with MongoDB related to running Scraperr in a VM. You should see something liks this in `make logs`:

```
WARNING: MongoDB 5.0+ requires a CPU with AVX support, and your current system does not appear to have that!
```

To resolve this issue, simply set CPU host type to `host`. This can be done in Proxmox in the VM settings > Processor. [Related issue](https://github.com/jaypyles/Scraperr/issues/9).

## Legal and Ethical Considerations

When using Scraperr, please ensure that you:

1. **Check Robots.txt**: Verify allowed pages by reviewing the `robots.txt` file of the target website.
2. **Compliance**: Always comply with the website's Terms of Service (ToS) regarding web scraping.

**Disclaimer**: This tool is intended for use only on websites that permit scraping. The author is not responsible for any misuse of this tool.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

### Contributions

Development made easy by developing from [webapp template](https://github.com/jaypyles/webapp-template). View documentation for extra information.

Start development server:

`make deps build up-dev`
