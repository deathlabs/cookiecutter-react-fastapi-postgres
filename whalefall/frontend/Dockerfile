FROM node:lts-alpine3.24 AS stage_1
ARG VITE_BACKEND_URL
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}
SHELL ["/bin/ash", "-eo", "pipefail", "-c"]
WORKDIR /home/whalefall/
COPY whalefall/ .
RUN echo "[*] VITE_BACKEND_URL has been set to '$VITE_BACKEND_URL'" &&\
    npm install &&\
    npm run build

FROM alpine:3.24
LABEL image.authors="Victor Fernandez III, @cyberphor"
WORKDIR /var/lib/nginx/
RUN apk add --no-cache gettext nginx &&\
    mkdir -p conf.d &&\
    chown nginx:nginx conf.d
COPY nginx.conf /etc/nginx/nginx.conf
COPY default.conf /etc/nginx/templates/default.conf.template
COPY --chmod=755 docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
COPY --from=stage_1 /home/whalefall/dist/ html/
EXPOSE 5173
USER nginx
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
