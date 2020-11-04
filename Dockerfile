FROM node:12.0-alpine as runner
WORKDIR /app
# Copy dependency definitions
COPY ./dist/browser /app
RUN ls -la
# Serve the app
CMD ["node", "./index.js"]
