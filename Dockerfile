FROM node:22-alpine AS base
ENV PNPM_HOME=/pnpm
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Install dependencies only when needed
FROM base AS deps

RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --prod

FROM base AS build
COPY . .

RUN pnpm install --frozen-lockfile --prefer-offline --ignore-scripts
RUN pnpm build

FROM base AS productions

WORKDIR /app

ENV NODE_ENV production
ENV DATABASE_URL file:/app/data/impostor.db

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nextjs:nodejs /app/dist ./dist
COPY --from=build --chown=nextjs:nodejs /app/.next ./.next
COPY --chown=nextjs:nodejs ./package.json ./
COPY --chown=nextjs:nodejs ./public ./public
COPY --chown=nextjs:nodejs ./next.config.mjs ./

COPY entrypoint.sh ./

RUN chmod +x ./entrypoint.sh

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME 0.0.0.0

ENTRYPOINT ["./entrypoint.sh"]
CMD ["node", "dist/server.js"]
