FROM node:22-slim AS base
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

CMD ["node", "apps/api/dist/src/main.js"]