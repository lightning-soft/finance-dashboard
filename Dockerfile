FROM node:12.0-alpine as runner
WORKDIR /app
# Copy dependency definitions
COPY ./dist/browser /app
RUN ls -la
RUN npm install http-server@13.0.2
# Serve the app
CMD ["node", "./index.js"]
