FROM node:22-alpine AS base
RUN corepack enable

# Install dependencies only when needed
FROM base AS deps

RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

RUN pnpm install --production --ignore-scripts --prefer-offline

FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV DATABASE_URL "file:/app/data/db.sqlite"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=deps --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=deps --chown=nextjs:nodejs /app/next.config.mjs ./
COPY --from=deps --chown=nextjs:nodejs /app/public ./public
COPY --from=deps --chown=nextjs:nodejs /app/.next ./.next
COPY --from=deps --chown=nextjs:nodejs /app/dist ./dist
COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME 0.0.0.0

ENTRYPOINT ["./entrypoint.sh"]

CMD ["node", "dist/server.js"]
