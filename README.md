# Webapp Template

Template designed to quickly build full stack apps.

## Technologies

- Containerization: Docker/Docker Compose

- Frontend: React/Next.js

- Backend: FastAPI

- Frameworks/Libraries: PDM, TailwindCSS

## Deployment

Uses `make` to quickly dispatch `docker-compose` commands.

- `deps`: rebuilds the frontend to deploy statically using the api

- `build`: builds the container using `docker-compose build `

- `up-dev`: ups the container using `docker-compose -f docker-compose.yml up`

- `up-prd`: ups the container using `docker-compose -f docker-compose.yml -f docker-compose.dev.yml up`
  which will deploy with local volumes.

Ex: `make deps build up-dev`
