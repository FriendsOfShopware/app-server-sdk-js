FROM node:alpine

WORKDIR /app
RUN npm install -g nodemon ts-node

EXPOSE 80