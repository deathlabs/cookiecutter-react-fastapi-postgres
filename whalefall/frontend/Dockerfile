FROM node:lts-alpine3.24 AS stage_1
WORKDIR /home/frontend
COPY whalefall/package*.json ./
RUN npm ci
COPY whalefall/ .
RUN npm run build

FROM node:lts-alpine3.24
LABEL image.authors="Victor Fernandez III, @cyberphor"
WORKDIR /home/frontend
RUN apk upgrade --no-cache libcrypto3 libssl3
USER 65532:65532
EXPOSE 5173
CMD ["node", "server.js"]
