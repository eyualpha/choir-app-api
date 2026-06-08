FROM node:20.19.2-bookworm-slim

ENV NODE_ENV=production
ENV PORT=3000
ENV PROJECT_NAME="Choir App API"

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY . .

RUN npm ci --omit=dev --no-audit --no-fund

EXPOSE 3000

CMD ["node", "index.js"]
