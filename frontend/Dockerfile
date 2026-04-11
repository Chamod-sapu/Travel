FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy source files
COPY . .

# Expose Vite's default dev server port
EXPOSE 5173

# Start Vite dev server and expose to 0.0.0.0 so Docker can map the port
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
