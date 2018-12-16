FROM node:10.14.1-alpine

WORKDIR /rsmq-chatbase-worker

COPY package*.json yarn.lock ./
RUN yarn install --production=true --ignore-optional

COPY ./src ./

CMD [ "node", "chatbase.worker.js" ]
