FROM sitespeedio/node:ubuntu-24-04-nodejs-20.17.0-b

# below packages are required for pcap package
RUN apt-get update && apt-get install -y \
    libpcap-dev \
    gcc \
    g++ \
    make \
    python3 \
    python3-pip \
    libc-dev \
    sudo \
    && rm -rf /var/lib/apt/lists/*
    
USER root
COPY package*.json .
RUN npm i
COPY . .
CMD ["npm","run","dev"]