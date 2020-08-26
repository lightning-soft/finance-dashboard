FROM node:12.0-alpine as runner
WORKDIR /app
# Copy dependency definitions
COPY ./dist /app
RUN ls -la
# Serve the app
CMD ["node", "./server/main.js"]
