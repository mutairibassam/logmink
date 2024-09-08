start:
	docker compose -f compose.yaml up -d

restart:
	docker compose down && docker compose -f compose.yaml up -d

refresh:
	docker compose down -v && docker compose -f compose.yaml up -d

stop:
	docker container stop database.mongo.boki
	docker container stop express.mongo.boki
	docker container stop boki.master

delete:
	docker compose down -v

# used to deploy single unit of compose file
deploy-boki:
	docker compose down -v boki.master
	docker compose up -d boki.master