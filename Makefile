.PHONY: build up deps

deps:
	npm run build

build:
	docker-compose build

up:
	docker-compose up -d
