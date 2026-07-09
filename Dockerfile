# Stage 1: Build the Angular app
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build -- --configuration production

# Stage 2: Serve the app with Nginx
FROM nginx:alpine
# Copy the custom Nginx config to handle Angular routing
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copy the built files from Stage 1 to Nginx HTML directory
COPY --from=build /app/dist/task-manager-ui/browser /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
