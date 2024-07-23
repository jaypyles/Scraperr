# Build python dependencies
FROM python:3.10-slim AS pybuilder

RUN apt update && apt install -y uvicorn
RUN python -m pip --no-cache-dir install pdm
RUN pdm config python.use_venv false

COPY pyproject.toml pdm.lock /project/app/
COPY ./api/ /project/app/api

WORKDIR /project/app
RUN pdm install

# Build next dependencies
FROM node:latest as jsbuilder
WORKDIR /app

COPY package*.json ./

RUN npm install

COPY public /app/public
COPY src /app/src
COPY tsconfig.json /app/tsconfig.json
COPY tailwind.config.js /app/tailwind.config.js
COPY next.config.mjs /app/next.config.mjs
COPY postcss.config.js /app/postcss.config.js

RUN npm run build

# Create final image
FROM python:3.10-slim

RUN apt-get update
RUN apt-get install -y wget gnupg supervisor
RUN wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add -
RUN sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
RUN apt-get update
RUN apt-get install -y google-chrome-stable

ENV PYTHONPATH=/project/pkgs
COPY --from=pybuilder /usr/local/lib/python3.10/site-packages /usr/local/lib/python3.10/site-packages
COPY --from=pybuilder /usr/local/bin /usr/local/bin
COPY --from=pybuilder /project/app /project/
# COPY --from=jsbuilder /app/dist /project/dist

COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

EXPOSE 8000

WORKDIR /project/

CMD [ "supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf" ]

