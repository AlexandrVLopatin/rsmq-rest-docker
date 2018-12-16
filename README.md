### RUN

``` shell
cp rsmq.rest.server/.env.dist rsmq.rest.server/.env
cp rsmq.chatbase.worker/.env.dist rsmq.chatbase.worker/.env

docker-compose up --scale rsmq.chatbase.worker=2 -d
```

### REST API
See examples of REST queries [here](https://github.com/AlexandrVLopatin/rsmq-rest-docker/blob/master/example.http)