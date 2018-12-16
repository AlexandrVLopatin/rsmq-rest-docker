require('dotenv').config({ path: '../.env' });

const logger = require('./lib/winston.logger').createLogger();

const rsmq = require('./rsmq.connection').createConnection(
  process.env.REDIS_HOST,
  process.env.REDIS_PORT
);

const restify = require('restify');
const server = restify.createServer();

server.use(function (req, res, next) {
  next();

  setTimeout(function () {
    if (!res.finished) {
      logger.error('Request timeout.');
      res.send(408, 'Request timeout');
      res.end('');
      return;
    }
  }, 5000);
});

server.use(restify.plugins.bodyParser());

require('./rsmq.routes').applyRoutes(server);

server.listen(process.env.RSMQ_REST_SERVER_PORT, process.env.RSMQ_REST_SERVER_HOST, () => {
  logger.info('Server listening on %s:%s', process.env.RSMQ_REST_SERVER_HOST, process.env.RSMQ_REST_SERVER_PORT);
});

let shutdownInProgress = false;

function shutdown(signal) {
  if (shutdownInProgress) {
    return;
  }
  shutdownInProgress = true;

  logger.info('%s received. Waiting for server shutdown...', signal);

  const timer = setTimeout(() => {
    logger.warn('Forcibly terminated after 5 seconds.');
    // eslint-disable-next-line no-process-exit
    process.exit(1);
  }, 5000);

  server.close(() => {
    rsmq.quit();
    clearTimeout(timer);
    logger.info('Gracefully stopped.');
  });
}

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    shutdown(signal);
  });
}
