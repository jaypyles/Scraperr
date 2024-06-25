.DEFAULT_GOAL := help

COMPOSE_DEV = docker-compose -f docker-compose.yml -f docker-compose.dev.yml
COMPOSE_PROD = docker-compose -f docker-compose.yml

HOSTNAME_PROD = ...
HOSTNAME_DEV = localhost

.PHONY: help deps build pull up-prod up-dev down

help:
	@echo "Usage:"
	@echo "  make logs    - Check Docker container logs"
	@echo "  make deps    - Build frontend assets"
	@echo "  make build   - Build Docker images"
	@echo "  make pull    - Pull Docker images"
	@echo "  make up-prd  - Start production environment"
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

pull:
	docker-compose pull

up-prd:
	HOSTNAME=$(HOSTNAME_PROD) $(COMPOSE_PROD) up -d

up-dev:
	HOSTNAME=$(HOSTNAME_DEV) $(COMPOSE_DEV) up -d

down:
	$(COMPOSE_DEV) down
	$(COMPOSE_PROD) down
