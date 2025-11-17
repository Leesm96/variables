FROM node:20-alpine

WORKDIR /app

COPY backend/package.json ./backend/package.json
RUN cd backend && npm install --omit=dev

COPY backend ./backend

EXPOSE 3000
CMD ["node", "backend/src/server.js"]
