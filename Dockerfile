FROM node:20-slim

WORKDIR /app

COPY package.json /app
COPY yarn.lock /app


# Install dependencies
RUN yarn install


COPY . /app

ENV CLOUD_ENV=production \
    ALLOWED_ORIGINS=http://localhost:3000,localhost,*,undefined,http://127.0.0.1:5173,http://localhost:5173,https://app.easyinvoice.ai

CMD [ "yarn", "start" ]
