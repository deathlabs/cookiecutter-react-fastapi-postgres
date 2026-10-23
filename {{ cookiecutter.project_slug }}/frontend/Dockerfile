FROM node:lts-alpine3.24 AS stage_1
SHELL ["/bin/ash", "-eo", "pipefail", "-c"]
WORKDIR /home/{{ cookiecutter.project_slug }}/
COPY {{ cookiecutter.project_slug }}/package.json {{ cookiecutter.project_slug }}/package-lock.json ./
RUN npm ci
COPY {{ cookiecutter.project_slug }}/ ./
RUN npm run build

FROM alpine:3.24
LABEL image.authors="Victor Fernandez III, @cyberphor"
WORKDIR /var/lib/nginx/
RUN apk add --no-cache gettext nginx &&\
    mkdir -p conf.d &&\
    chown nginx:nginx conf.d
COPY nginx.conf /etc/nginx/nginx.conf
COPY default.conf /etc/nginx/templates/default.conf.template
COPY --chmod=755 docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
COPY --from=stage_1 /home/{{ cookiecutter.project_slug }}/dist/ html/
EXPOSE 5173
USER nginx
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
