FROM node:lts-alpine3.24 AS stage_1
WORKDIR /home/{{ cookiecutter.project_slug }}
COPY {{ cookiecutter.project_slug }}/package*.json ./
RUN npm ci
COPY {{ cookiecutter.project_slug }}/ .
RUN npm run build

FROM node:lts-alpine3.24
LABEL image.authors="{{ cookiecutter.author }}"
WORKDIR /home/{{ cookiecutter.project_slug }}
#ENV NODE_ENV=production
#ENV PORT=8080
#ENV HOSTNAME=0.0.0.0
#ENV LANGGRAPH_DEPLOYMENT_URL=http://{{ cookiecutter.project_slug }}-inference:8001/api/v1
COPY --from=stage_1 /home/{{ cookiecutter.project_slug }}/.next/standalone ./
COPY --from=stage_1 /home/{{ cookiecutter.project_slug }}/.next/static ./.next/static
COPY --from=stage_1 /home/{{ cookiecutter.project_slug }}/public ./public
RUN apk upgrade --no-cache libcrypto3 libssl3 &&\
    rm -rf \
        /home/{{ cookiecutter.project_slug }}/node_modules/next/dist/compiled/tar \
        /usr/local/lib/node_modules/npm/node_modules/brace-expansion \
        /usr/local/lib/node_modules/npm/node_modules/http-cache-semantics \
        /usr/local/lib/node_modules/npm/node_modules/ip-address \
        /usr/local/lib/node_modules/npm/node_modules/postcss-selector-parser \
        /usr/local/lib/node_modules/npm/node_modules/tar \
        /usr/local/lib/node_modules/npm/node_modules/undici
USER 65532:65532
EXPOSE 8080
CMD ["node", "server.js"]
