FROM node:22-alpine
WORKDIR /app
COPY server/package.json server/package-lock.json ./server/
RUN cd server && npm install --omit=dev
COPY server ./server
COPY web ./web
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
CMD ["node", "server/src/index.js"]
