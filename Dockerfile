#ETAPA 1: BUILDER (ANGULAR)
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

#ETAPA 2: RUNTIME NGINX
FROM nginxinc/nginx-unprivileged:alpine AS runtime

#copiar template de nginx
COPY default.conf.template /etc/nginx/templates/default.conf.template

#copiar los estaticos generados por angular
COPY --from=builder /app/dist/casino-frontend/browser/ /usr/share/nginx/html/

EXPOSE 8080
