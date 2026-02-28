FROM node:18-slim

WORKDIR /app

COPY package.json yarn.lock ./

# Install all dependencies (dotenv is now in production deps)
RUN yarn install --frozen-lockfile --production

COPY . .

CMD ["node", "app.js"]
