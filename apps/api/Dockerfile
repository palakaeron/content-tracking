FROM node:22-alpine AS build
WORKDIR /app
COPY . .
RUN corepack enable && pnpm install --no-frozen-lockfile && pnpm --filter @cut/api prisma:generate && pnpm --filter @cut/api build
FROM node:22-alpine
WORKDIR /app
COPY --from=build /app /app
EXPOSE 4000
CMD ["pnpm","--filter","@cut/api","start"]
