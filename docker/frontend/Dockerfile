# Build next dependencies
FROM node:23.1-slim
WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package.json yarn.lock ./

# Install dependencies in a separate layer
RUN yarn install --frozen-lockfile --network-timeout 600000

# Copy the rest of the application
COPY tsconfig.json /app/tsconfig.json
COPY tailwind.config.js /app/tailwind.config.js
COPY next.config.mjs /app/next.config.mjs
COPY postcss.config.js /app/postcss.config.js

COPY public /app/public
COPY src /app/src

# Build the application
RUN yarn build

EXPOSE 3000