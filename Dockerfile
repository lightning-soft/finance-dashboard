FROM node:12.0-alpine as runner
WORKDIR /app
# Copy dependency definitions
COPY ./dist/browser /app
RUN ls -la
RUN npm i -g http-server
# Serve the app
CMD ["node", "./index.js"]
