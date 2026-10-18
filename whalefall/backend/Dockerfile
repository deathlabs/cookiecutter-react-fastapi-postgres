FROM alpine:3.24
LABEL image.authors="Victor Fernandez III, @cyberphor"
SHELL ["/bin/ash", "-o", "pipefail", "-c"]
WORKDIR /home/backend/
COPY entrypoint.sh entrypoint.sh
COPY whalefall/ whalefall/
ENV UV_PYTHON_INSTALL_DIR=/home/backend/.uv-python
RUN apk add --no-cache python3=3.14.8-r0 uv=0.11.19-r0 && \
    apk upgrade --no-cache libcrypto3 libssl3 zlib &&\
    uv sync --directory whalefall --frozen --python /usr/bin/python3 && \
    uv run --directory whalefall python -m pip uninstall pip -y || true &&\
    addgroup -g 1000 whalefall &&\
    adduser -D -G whalefall -u 1000 whalefall -h /home/backend/ &&\
    chmod u+x /home/backend/entrypoint.sh &&\
    chown -R whalefall:whalefall /home/backend/
ENV PATH="/home/backend/whalefall/.venv/bin:$PATH"
USER 1000
EXPOSE 8000
CMD [ "./entrypoint.sh" ]
