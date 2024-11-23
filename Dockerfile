# Use Apify's base image with Node.js 16
FROM apify/actor-node:16

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install production dependencies
RUN npm --quiet set progress=false \
    && npm install --only=prod --no-optional \
    && echo "Installed NPM packages:" \
    && (npm list --all || true) \
    && echo "Node.js version:" \
    && node --version \
    && echo "NPM version:" \
    && npm --version

# Copy the rest of the files
COPY . ./

# Disable outdated warnings
ENV APIFY_DISABLE_OUTDATED_WARNING 1
ENV npm_config_loglevel=silent

# Set default memory and headless mode
ENV APIFY_MEMORY_MBYTES=2048
ENV APIFY_HEADLESS=1

# Start the Actor
CMD ["npm", "start"]
