FROM node:24-slim AS base
ENV PNPM_HOME="/pnpm" 
RUN npm install -g pnpm@^10

FROM base AS builder
WORKDIR /src
RUN npm install -g turbo@^2
COPY . .
RUN turbo prune @fwu/vidis-rostering-api --docker


FROM base AS installer
WORKDIR /src
COPY --from=builder /src/out/json/ .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
COPY --from=builder /src/out/full/ .
RUN pnpm build


FROM base AS production
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /src/out/json/ .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile
COPY --from=builder /src/out/full/ .
COPY --chown=node:node --from=installer /src/apps/api/dist /app/apps/api/dist
USER node

# start being relative for migrations
WORKDIR /app/apps/api
CMD ["node", "dist/src/main.js"]