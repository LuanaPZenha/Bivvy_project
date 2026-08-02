FROM node:20-alpine
WORKDIR /app

COPY shared ./shared
COPY core-service/package.json ./core-service/package.json

WORKDIR /app/core-service
RUN npm install --omit=dev --install-links=false \
  && mkdir -p node_modules/@bivvy \
  && ln -sf /app/shared node_modules/@bivvy/shared

COPY core-service/src ./src

ENV NODE_ENV=production
EXPOSE 3002
CMD ["node", "src/server.js"]
