const RedisSMQ = require('rsmq');

var rsmq;

exports.createConnection = (redisHost, redisPort) => {
  if (!rsmq) {
    rsmq = new RedisSMQ({
      host: redisHost,
      port: redisPort,
      ns: 'rsmq'
    });
  }

  return rsmq;
};

