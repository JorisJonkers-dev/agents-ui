# syntax=docker/dockerfile:1.7

FROM node:26-alpine AS build
# Node 25's alpine image dropped corepack from the base layer but still
# ships /usr/local/bin/yarn, which makes `npm install -g corepack` fail
# with EEXIST. Install pnpm directly at the packageManager version in
# package.json instead of going through corepack's shim dance.
RUN npm install -g pnpm@9.15.4
WORKDIR /app
ARG NODE_AUTH_TOKEN=
COPY .npmrc package.json ./
RUN --mount=type=secret,id=github_token \
    NODE_AUTH_TOKEN="${NODE_AUTH_TOKEN:-$(cat /run/secrets/github_token 2>/dev/null || true)}" \
    pnpm config set //npm.pkg.github.com/:_authToken "${NODE_AUTH_TOKEN}" \
    && pnpm config set @jorisjonkers-dev:registry https://npm.pkg.github.com \
    && pnpm install --no-frozen-lockfile
COPY . .
ARG VITE_AUTH_URL=https://auth.jorisjonkers.dev
ARG VITE_FARO_URL=https://faro.jorisjonkers.dev/collect
ARG VITE_GITHUB_APP_SLUG=jorisjonkers-dev-agents
RUN VITE_AUTH_URL=${VITE_AUTH_URL} \
    VITE_FARO_URL=${VITE_FARO_URL} \
    VITE_GITHUB_APP_SLUG=${VITE_GITHUB_APP_SLUG} \
    pnpm build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
