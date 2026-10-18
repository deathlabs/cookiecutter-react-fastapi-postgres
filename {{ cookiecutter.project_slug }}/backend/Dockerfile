FROM alpine:3.24
LABEL image.authors="{{ cookiecutter.author }}>"
SHELL ["/bin/ash", "-o", "pipefail", "-c"]
WORKDIR /home/backend/
COPY entrypoint.sh entrypoint.sh
COPY {{ cookiecutter.project_slug }}/ {{ cookiecutter.project_slug }}/
ENV UV_PYTHON_INSTALL_DIR=/home/backend/.uv-python
RUN apk add --no-cache python3=3.14.8-r0 uv=0.11.19-r0 && \
    apk upgrade --no-cache libcrypto3 libssl3 zlib &&\
    uv sync --directory {{ cookiecutter.project_slug }} --frozen --python /usr/bin/python3 && \
    uv run --directory {{ cookiecutter.project_slug }} python -m pip uninstall pip -y || true &&\
    addgroup -g 1000 {{ cookiecutter.project_slug }} &&\
    adduser -D -G {{ cookiecutter.project_slug }} -u 1000 {{ cookiecutter.project_slug }} -h /home/backend/ &&\
    chmod u+x /home/backend/entrypoint.sh &&\
    chown -R {{ cookiecutter.project_slug }}:{{ cookiecutter.project_slug }} /home/backend/
ENV PATH="/home/backend/{{ cookiecutter.project_slug }}/.venv/bin:$PATH"
USER 1000
EXPOSE 8000
CMD [ "./entrypoint.sh" ]
