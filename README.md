# Webapp Template

Template designed to quickly build full stack apps.

## Technologies

- Containerization: Docker/Docker Compose

- Frontend: React

- Backend: FastAPI

## Deployment

Uses `make` to quickly dispatch `docker-compose` commands.

- `build`: builds the container using `docker-compose build `

- `up`: ups the container using `docker-compose up`

- `deps`: rebuilds the frontend to deploy statically using the api

Ex: `make deps build up`
