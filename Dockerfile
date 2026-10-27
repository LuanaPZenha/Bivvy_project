FROM node:22-alpine AS web-build
WORKDIR /web
COPY web/package.json ./
RUN npm install
COPY web/ ./
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY server/package.json ./server/
RUN cd server && npm install --omit=dev
COPY server/ ./server/
COPY --from=web-build /web/dist ./web/dist
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
CMD ["node", "server/src/index.js"]
