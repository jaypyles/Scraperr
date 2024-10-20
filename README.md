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

## Features

### Submitting URLs for Scraping

- Submit/Queue URLs for web scraping
- Add and manage elements to scrape using XPath
- Scrape all pages within same domain
- Add custom json headers to send in requests to URLs
- Display results of scraped data

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

## Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/jaypyles/scraperr.git

   ```

2. Set environmental variables and labels in `docker-compose.yml`.

```yaml
scraperr:
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.scraperr.rule=Host(`localhost`)" # change this to your domain, if not running on localhost
      - "traefik.http.routers.scraperr.entrypoints=web" # websecure if using https
      - "traefik.http.services.scraperr.loadbalancer.server.port=3000"

scraperr_api:
 environment:
      - LOG_LEVEL=INFO
      - MONGODB_URI=mongodb://root:example@webscrape-mongo:27017 # used to access MongoDB
      - SECRET_KEY=your_secret_key # used to encode authentication tokens (can be a random string)
      - ALGORITHM=HS256 # authentication encoding algorithm
      - ACCESS_TOKEN_EXPIRE_MINUTES=600 # access token expire minutes
  labels:
        - "traefik.enable=true"
        - "traefik.http.routers.scraperr_api.rule=Host(`localhost`) && PathPrefix(`/api`)" # change this to your domain, if not running on localhost
        - "traefik.http.routers.scraperr_api.entrypoints=web" # websecure if using https
        - "traefik.http.middlewares.api-stripprefix.stripprefix.prefixes=/api"
        - "traefik.http.routers.scraperr_api.middlewares=api-stripprefix"
        - "traefik.http.services.scraperr_api.loadbalancer.server.port=8000"

mongo:
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: example
```

Don't want to use `traefik`? This configuration can be used in other reverse proxies, as long as the API is proxied to `/api` of the frontend container. This is currently
not able to be used without a reverse proxy, due to limitations of runtime client-side environmental variables in `next.js`.

3. Deploy

```sh
make up
```

The app provides its own `traefik` configuration to use independently, but can easily be reverse-proxied by any other app, or your own reverse-proxy.

## Usage

1. Open the application in your browser at `http://localhost`.
2. Enter the URL you want to scrape in the URL field.
3. Add elements to scrape by specifying a name and the corresponding XPath.
4. Click the "Submit" button to queue URL to be scraped.
5. View queue in the "Previous Jobs" section.

## API Endpoints

Use this service as an API for your own projects. Due to this using FastAPI, a docs page is available at `/docs` for the API.

![docs](https://github.com/jaypyles/www-scrape/blob/master/docs/docs_page.png)

## AI

Currently supports either an Ollama instance or OpenAI's ChatGPT, using your own API key. Setting up is easy as either setting the Ollama url or the OpenAI API key in the API's environmental variables in the `docker-compose.yml` file:

```yaml
scraperr_api:
  environment:
    - OLLAMA_URL=http://ollama:11434
    - OLLAMA_MODEL=llama3.1
    # or
    - OPENAI_KEY=<your_key>
    - OPENAI_MODEL=gpt3.5-turbo
```

The model's names are taken from the documentation of their respective technologies.

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
