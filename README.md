# Logmink.hub

**Logmink.hub** is a centralized logging hub designed to store all logs sent by agents deployed across containers. It aims to provide a seamless, "Plug-N-Play" experience for capturing HTTP logs from containers without requiring any code modifications. This project addresses the challenges of working with other log management tools like Logstash, Filebeat, Loki, Prometheus, Dynatrace, etc., by offering a straightforward setup.

### Logmink.hub stack:
1. **Node.js Server**: The core application that listens on the `/capture` endpoint for incoming log data.
2. **MongoDB**: A NoSQL database used to store all log data received by `Logmink.hub`.
3. **Mongo Express (Optional)**: A web-based UI for interacting with the MongoDB database, providing an easy way to view and manage logs.


## How It Works
1. **Setup**: Deploy Logmink.hub and agents within your containerized environment.
2. **Agents Capture Logs**: Agents are responsible for capturing all outgoing and incoming HTTP requests from the containers. These agents do not store any data locally.
3. **Data Sent to Logmink.hub**: Captured logs are sent to the `/capture` endpoint of Logmink.hub.
4. **Storage**: Logmink.hub stores the logs in a MongoDB database for future analysis and monitoring.
5. **Visualization**: Optionally, use Mongo Express to visualize and manage the stored logs.

#### Initial setup:
  ```bash
  # clone project repo
  git clone --recurse-submodules https://github.com/mutairibassam/logmink.hub.git
  cd logmink.hub

  # pull latest changes from hub or agent repo (if needed)
  # git submodule update --remote

  # ensure network name similar to is specified in the image (default is logmink_network)
  docker network create logmink_network

  # `make init` is going to build and run `Logmink.hub` container, then is going to build the `Logmink-agent` image only without running it since agents need to be attached to other containers as (sidecar) for listening.
  make init
  ```
#### Attach agent:

Below compose configuration is a skelton for sidecar implementation for `Logmink.agent`. Below config should be copied and modified to another compose file and attach to a valid service. 

```yml
service_name: # recommended to start with agent ex; (agent.service_name)
    
    image: logmink/agent:0.9      # default image
    # build: ../http-agent        # or local Dockerfile
    
    container_name: anyname_or_service_name
    network_mode: "service:{service_name}" # {service_name} should match the same service_name
    depends_on:
      - parent_service # agent should depends_on container that we want to capture its http traffic.

    environment:
      PORT: 32000   # or any available port
      LOGMINK_HUB_URL: http://service_name

      mongoUrl: mongodb://{hub.service_name}:27017/logdb
      # ex;     mongodb://mongo.logmink.hub:27017/logdb-dev

    entrypoint: ["node", "agent.js"]

```
#### Details:
*Note: You can modify `compose.yaml` file to change default password.*
- mongo express (http://localhost:8081)
  - username (default): admin
  - password (default): pass

- Logmink container:
  - service name (default): logmink.hub
  - service port (default): 32000

Please contribute.
