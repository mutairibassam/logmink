init:
	docker compose -f logmink-hub/compose.yaml up -d
	docker build -t logmink/agent:0.9 ./logmink-agent