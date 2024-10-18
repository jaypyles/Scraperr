# Build next dependencies
FROM node:latest
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY tsconfig.json /app/tsconfig.json
COPY tailwind.config.js /app/tailwind.config.js
COPY next.config.mjs /app/next.config.mjs
COPY postcss.config.js /app/postcss.config.js

COPY public /app/public
COPY src /app/src

RUN npm run build

EXPOSE 3000

# CMD [ "npm", "run" ]
