.PHONY: reup build build-force pull up 

build:
	docker compose build

build-force:
	docker compose build --no-cache

pull:
	docker compose pull

up:
	docker compose up -d

reup: destroy build up pull build-force
