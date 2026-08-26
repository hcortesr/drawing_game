FROM node:22-alpine3.18

WORKDIR /app

COPY package*.json ./
RUN npm install


EXPOSE 8080

CMD ["npm", "run", "start"]