FROM redis:5.0.3-alpine

RUN mkdir /var/redis
RUN chown redis:redis /var/redis

COPY redis.conf /usr/local/etc/redis/redis.conf

CMD [ "redis-server", "/usr/local/etc/redis/redis.conf" ]
