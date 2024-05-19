# Build python dependencies
FROM python:3.10-slim AS pybuilder

RUN apt update && apt install -y uvicorn
RUN python -m pip --no-cache-dir install pdm
RUN pdm config python.use_venv false

COPY pyproject.toml pdm.lock /project/app/
COPY ./api/backend/ /project/app/backend
COPY ./build/ /project/app/build

WORKDIR /project/app
RUN pdm install

# Build js dependencies
FROM node:latest AS jsbuilder

WORKDIR /project/app
COPY package*.json ./

RUN npm install
COPY public ./public
COPY src ./src
COPY tsconfig.json tailwind.config.js ./

# Create final image
FROM python:3.10-slim

ENV PYTHONPATH=/project/pkgs
COPY --from=pybuilder /usr/local/lib/python3.10/site-packages /usr/local/lib/python3.10/site-packages
COPY --from=pybuilder /usr/local/bin /usr/local/bin
COPY --from=pybuilder /project/app /project/api

COPY --from=jsbuilder /usr/local/lib/node_modules /usr/local/lib/node_modules
COPY --from=jsbuilder /usr/local/bin /usr/local/bin
COPY --from=jsbuilder /project/app /project/app

EXPOSE 8000

WORKDIR /project/api

CMD ["pdm", "run", "python", "-m", "uvicorn", "backend.app:app", "--reload", "--host", "0.0.0.0", "--port", "8000"]

