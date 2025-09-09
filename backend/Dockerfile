FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache curl

RUN apk add --no-cache python3 make g++

COPY package*.json ./

RUN npm install

RUN npm install mongoose


COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
