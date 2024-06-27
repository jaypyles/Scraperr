# Webapp Template

Template designed to quickly build full stack apps.

Utilizes Github Actions and Ansible to build Docker images to quickly deploy onto an AWS EC2 Debian instance.

## Technologies

- Containerization: Docker/Docker Compose

- Frontend: React/Next.js

- Backend: FastAPI

- Frameworks/Libraries: PDM, TailwindCSS

## Prerequisites

- Install Ansible

- Create a Dockerhub account/repo and fill out the Github repo environmental variables:

  - DOCKERHUB_TOKEN
  - DOCKERHUB_USERNAME
  - DOCKERHUB_REPO

- Complete the `config.yaml` and the `inventory.yaml` in the `ansible` directory

  - `github_repo`: Github repo clone address
  - `deploy_path`: Path where to clone the repo to on the server
  - `deploy_command`: `Make` command to run to deploy on the server

- Add your domain in HOSTNAME_PROD in the `Makefile`

## Deployment

### Local Deployment

Uses `make` to quickly dispatch `docker-compose` commands.

- `deps`: rebuilds the frontend to deploy statically using the api

- `build`: builds the container using `docker-compose build `

- `up-prd`: ups the container using `docker-compose -f docker-compose.yml up`

- `up-dev`: ups the container using `docker-compose -f docker-compose.yml -f docker-compose.dev.yml up`
  which will deploy with local volumes.

Ex: `make deps build up-dev`

### Server Deployment

Easy deployment using `make setup deploy` after completing the required config files.

- `setup`: Install dependencies and clone repo onto server

- `deploy`: Deploy on server

To use a SSL certificate, uncomment the volumes under the `traefik` service. Add your own certificates for use in Traefik.

```yaml
volumes:
  - "/var/run/docker.sock:/var/run/docker.sock:ro"
  - "./dynamic_conf.yaml:/etc/traefik/dynamic_conf.yaml"
  - "/etc/letsencrypt/live/domain/fullchain.pem:/etc/certs/ssl-cert.pem"
  - "/etc/letsencrypt/live/domain/privkey.pem:/etc/certs/ssl-cert.key"
```
