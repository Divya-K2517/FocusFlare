# Use official Node image to build the app
FROM node:18-alpine AS build

WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
RUN apk add --no-cache git
RUN npm install
COPY . .
RUN npm run build

# Use Nginx to serve the build
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]