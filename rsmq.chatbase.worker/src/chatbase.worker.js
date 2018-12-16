require('dotenv').config({ path: '../.env' });

const logger = require('./lib/winston.logger').createLogger();

const chatbase = require('@google/chatbase');

const messageSchema = require('./message.schema.json');
const Validator = require('jsonschema').Validator;
const validator = new Validator();

const RSMQWorker = require('rsmq-worker');

const worker = new RSMQWorker(process.env.RSMQ_QUEUE, {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  interval: process.env.RSMQ_WORKER_POLLING_INTERVAL,
  timeout: process.env.RSMQ_WORKER_TASK_TIMEOUT
});

worker.on('message', async (msg, next, id) => {
  let data;
  try {
    data = JSON.parse(msg);
  } catch (err) {
    logger.debug(err);
    next();
    return;
  }

  logger.debug('Message recieved. ID: %s. Message:', id, data);

  const validatorResult = validator.validate(data, messageSchema);
  if (validatorResult.errors.length > 0) {
    logger.debug('Message is not valid:', validatorResult.errors);
    next();
    return;
  }

  const cbMessage = chatbase.newMessage(process.env.CHATBASE_TOKEN)
    .setUserId(data.user_id)
    .setPlatform(data.platform)
    .setIntent(data.intent)
    .setMessage(data.message);

  if (data.hasOwnProperty('not_handled')) {
    if (data.not_handled) {
      cbMessage.setAsNotHandled();
    } else {
      cbMessage.setAsHandled();
    }
  }

  if (data.type == 'agent') {
    cbMessage.setAsTypeAgent();
  } else if (data.type == 'user') {
    cbMessage.setAsTypeUser();
  }

  let res;
  try {
    res = await cbMessage.send();
  } catch (err) {
    logger.error('Error sending chatbase message.', err);
    next();
    return;
  }

  logger.debug('Message send succesfully.', res);

  next();
});

worker.on('ready', () => {
  logger.info('Worker stared. Redis server: %s:%s. Queue name: %s',
    process.env.REDIS_HOST,
    process.env.REDIS_PORT,
    process.env.RSMQ_QUEUE);
});

// error listeners
worker.on('error', (err, msg) => {
  logger.error('Common error. ID: %s. Error message:', msg.id, err);
});
worker.on('exceeded', (msg) => {
  logger.error('Work exceeded. ID: %s. Message:', msg.id, msg);
});
worker.on('timeout', (msg) => {
  logger.error('Work timeout. ID: %s.', msg.id, msg.rc);
});

worker.start();
