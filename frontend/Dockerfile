FROM node:20.19-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN rm -f /etc/nginx/conf.d/default.conf
COPY --from=builder --chown=appuser:appgroup /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN chown -R appuser:appgroup /var/cache/nginx /var/run /var/log/nginx
USER appuser
EXPOSE 5173
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD wget -q --spider http://localhost:5173/ || exit 1
CMD ["nginx", "-g", "daemon off;"]
