ARG NODE_IMAGE=node:24-bookworm-slim

FROM ${NODE_IMAGE} AS base
RUN apt-get update \
 && apt-get install -y --no-install-recommends dumb-init \
 && rm -rf /var/lib/apt/lists/*

# ----------------------------
# Stage 1: Install all dependencies (incl. dev)
# ----------------------------
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ----------------------------
# Stage 2: Build the application
# ----------------------------
FROM deps AS build
WORKDIR /app
COPY . .
RUN node ace build

# ----------------------------
# Stage 3: Production runtime
# ----------------------------
FROM base AS production
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3333 \
    HOST=0.0.0.0

COPY --from=build /app/build ./
RUN npm ci --omit=dev \
 && chown -R node:node /app

USER node
EXPOSE 3333
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "bin/server.js"]
