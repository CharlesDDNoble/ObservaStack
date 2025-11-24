FROM node:20-alpine AS builder

WORKDIR /app

COPY control/frontend/package*.json ./

RUN npm install

COPY control/frontend/ ./

RUN npm run build

FROM nginx:1.27-alpine

COPY control/gateway/nginx.conf /etc/nginx/nginx.conf

COPY --from=builder /app/build /usr/share/nginx/html