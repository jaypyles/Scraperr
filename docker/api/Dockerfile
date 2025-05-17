# Build python dependencies
FROM python:3.10.12-slim as pybuilder

RUN apt-get update && \
    apt-get install -y curl && \
    apt-get install -y x11vnc xvfb uvicorn wget gnupg supervisor libgl1 libglx-mesa0 libglx0 vainfo libva-dev libva-glx2 libva-drm2 ffmpeg && \
    curl -LsSf https://astral.sh/uv/install.sh | sh && \
    apt-get remove -y curl && \
    apt-get autoremove -y && \
    rm -rf /var/lib/apt/lists/*

RUN python -m pip --no-cache-dir install pdm
RUN pdm config python.use_venv false

WORKDIR /project/app
COPY pyproject.toml pdm.lock /project/app/

RUN pdm install -v --frozen-lockfile

RUN pdm run playwright install --with-deps

RUN pdm run camoufox fetch

COPY ./api/ /project/app/api

ENV PYTHONPATH=/project/pkgs

COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

EXPOSE 8000

WORKDIR /project/app

RUN mkdir -p /project/app/media
RUN mkdir -p /project/app/data
RUN touch /project/app/data/database.db

EXPOSE 5900

COPY start.sh /project/app/start.sh

CMD [ "supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf" ]