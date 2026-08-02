FROM node:20-alpine
WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY shared ./shared
COPY auth-service/package.json ./auth-service/package.json

WORKDIR /app/auth-service
RUN npm install --omit=dev --install-links=false \
  && mkdir -p node_modules/@bivvy \
  && ln -sf /app/shared node_modules/@bivvy/shared

COPY auth-service/src ./src

ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "src/server.js"]
