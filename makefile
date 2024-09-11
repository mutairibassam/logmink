init:
#   network name should match what it's specified in
# 	the compose file for both [hub, and agent].

#	the predefined network is logmink_network which can be changed.
	@if [ -z "$$(docker network ls --filter name=logmink_network -q)" ]; then \
		echo "Creating Docker network 'logmink_network'..."; \
		docker network create logmink_network; \
	else \
		echo "Docker network 'logmink_network' already exists."; \
	fi

#	[todo] deploy the hub, and agent to a registry.
	docker compose -f logmink-hub/compose.yaml up -d
	docker build -t logmink/agent:0.9 ./logmink-agent