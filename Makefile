.DEFAULT_GOAL := help

COMPOSE_DEV = docker-compose -f docker-compose.yml -f docker-compose.dev.yml
COMPOSE_PROD = docker-compose -f docker-compose.yml

.PHONY: help setup deps build up up-prod up-dev down

help:
	@echo "Usage:"
	@echo "  make logs    - Check Docker container logs"
	@echo "  make deps    - Build frontend assets"
	@echo "  make build   - Build Docker images"
	@echo "  make up-prod - Start production environment"
	@echo "  make up-dev  - Start development environment"
	@echo "  make down    - Stop and remove containers, networks, images, and volumes"

logs:
	docker-compose logs -f

deps:
	pdm install
	npm install
	npm run build

build:
	$(COMPOSE_DEV) build

up-prod:
	$(COMPOSE_PROD) up -d

up-dev:
	$(COMPOSE_DEV) up -d

down:
	$(COMPOSE_DEV) down
	$(COMPOSE_PROD) down
