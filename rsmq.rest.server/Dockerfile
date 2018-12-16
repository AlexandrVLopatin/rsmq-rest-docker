FROM node:10.14.1-alpine

EXPOSE 8888

WORKDIR /rsmq-rest-server

COPY package*.json yarn.lock ./
RUN yarn install --production=true --ignore-optional

COPY ./src ./

CMD [ "node", "rsmq.rest.server.js" ]
