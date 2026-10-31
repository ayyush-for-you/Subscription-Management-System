.PHONY: up down seed test story bench

up:
	docker compose up --build

down:
	docker compose down

seed:
	npm run seed:demo

test:
	npm test

story:
	npm run test:story

bench:
	npm run bench
