# Install dependencies only when needed
FROM node:16.20.2-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json yarn.lock .yarnrc.yml .
COPY .yarn ./.yarn
COPY packages/api/package.json ./packages/api/package.json
COPY packages/shared/package.json ./packages/shared/package.json
COPY packages/types/package.json ./packages/types/package.json
COPY packages/web/package.json ./packages/web/package.json
RUN yarn --immutable

# Rebuild the source code only when needed
FROM node:16.20.2-alpine AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN yarn build && yarn workspaces focus --all --production

# Production image
FROM node:16.20.2-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

COPY --from=builder /app/package.json /app/yarn.lock /app/.yarnrc.yml .
COPY --from=builder /app/.yarn ./.yarn
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/node_modules ./node_modules

CMD ["yarn", "workspace", "api", "start"]
