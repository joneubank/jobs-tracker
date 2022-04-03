FROM node:17-alpine as builder
# Create app directory
WORKDIR /app
RUN chown -R node:node /app
USER node
# copy the package json and install first to optimize docker cache for node modules
COPY package.json /app/
COPY package-lock.json /app/
RUN npm ci
COPY . ./
RUN npm run build

# Runtime image
FROM node:17-alpine
ENV APP_UID=9999
ENV APP_GID=9999
RUN apk --no-cache add shadow
RUN groupmod -g $APP_GID node 
RUN usermod -u $APP_UID -g $APP_GID node
WORKDIR /app
RUN chown -R node:node /app
USER node
RUN mkdir dist && mkdir node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
ARG COMMIT_ID
ENV SERVICE_COMMIT=${COMMIT_ID}
ARG VERSION
ENV SERVICE_VERSION=${VERSION}
EXPOSE 3000
CMD ["node", "dist/index.js"]