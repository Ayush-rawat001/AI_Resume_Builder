# Build Stage
FROM node:18-alpine AS build
WORKDIR /app

# Copy package files and install
COPY package*.json ./
RUN npm install

# Copy everything else and build
COPY . .
RUN npm run build

# Runtime Stage
FROM nginx:alpine
# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

# 🛠️ Nginx configuration to handle React Router (fixes 404s)
RUN echo 'server { \
    listen 8080; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
