FROM node:alpine
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package*.json /usr/src/app
RUN npm ci
COPY . /usr/src/app
CMD [ "npm","run","dev"]