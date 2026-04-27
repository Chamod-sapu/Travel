FROM nginx:alpine

# Copy built files
COPY dist /usr/share/nginx/html

# Copy a custom nginx configuration to handle React/Vite routing if needed
# (Optional, but often needed for SPAs)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
