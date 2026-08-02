# Build from repo `backend/` context (see docker-compose.yml)
FROM node:20-alpine
WORKDIR /app

COPY shared ./shared
COPY api-gateway/package.json ./api-gateway/package.json

WORKDIR /app/api-gateway
RUN npm install --omit=dev --install-links=false \
  && mkdir -p node_modules/@bivvy \
  && ln -sf /app/shared node_modules/@bivvy/shared

COPY api-gateway/src ./src

ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "src/server.js"]
