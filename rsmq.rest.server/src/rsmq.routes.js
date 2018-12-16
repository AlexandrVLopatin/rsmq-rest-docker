const logger = require('./lib/winston.logger').createLogger();
const rsmq = require('./rsmq.connection').createConnection();

const Router = require('restify-router').Router;
const router = new Router();

// Queues list
router.get('/queues', (req, res) => {
  return rsmq.listQueues((err, resp) => {
    if (err) {
      logger.error('Queues list error:', err);
      res.send(err, 500);
      return;
    }
    res.send({
      queues: resp
    });
  });
});

// Queue attributes
router.get('/queues/:qname', (req, res) => {
  return rsmq.getQueueAttributes({
    qname: req.params.qname
  }, (err, resp) => {
    if (err) {
      logger.error('Queue attributes error:', err);
      res.send(err, 500);
      return;
    }
    res.send(resp);
  });
});

// Create queue
router.post('/queues/:qname', (req, res) => {
  const params = { ...req.body, qname: req.params.qname };

  rsmq.createQueue(params, (err, resp) => {
    if (err) {
      logger.error('Create queue error:', err);
      res.send(err, 500);
      return;
    }
    res.send({
      result: resp
    });
  });
});

// Delete queue
router.del('/queues/:qname', (req, res) => {
  return rsmq.deleteQueue({
    qname: req.params.qname
  }, (err, resp) => {
    if (err) {
      logger.error('Delete queue error:', err);
      res.send(err, 500);
      return;
    }
    res.send({
      result: resp
    });
  });
});

// Send message to queue
router.post('/messages/:qname', (req, res) => {
  const params = {
    message: JSON.stringify(req.body),
    qname: req.params.qname
  };

  rsmq.sendMessage(params, (err, resp) => {
    if (err) {
      logger.error('Send message to queue error:', err);
      res.send(err, 500);
      return;
    }
    res.send({
      id: resp
    });
  });
});

// Recieve  messages from queue
router.get('/messages/:qname', (req, res) => {
  rsmq.receiveMessage({
    qname: req.params.qname,
    vt: req.param('vt')
  }, (err, resp) => {
    if (err) {
      logger.error('Recieve message error:', err);
      res.send(err, 500);
      return;
    }
    res.send(resp);
  });
});

// Change message visibility
router.put('/messages/:qname/:id', (req, res) => {
  rsmq.changeMessageVisibility({
    qname: req.params.qname,
    id: req.params.id,
    vt: req.param('vt')
  }, (err, resp) => {
    if (err) {
      logger.error('Change message visibility error:', err);
      res.send(err, 500);
      return;
    }
    res.send({
      result: resp
    });
  });
});

// Delete message
router.del('/messages/:qname/:id', (req, res) => {
  rsmq.deleteMessage(req.params, (err, resp) => {
    if (err) {
      logger.error('Delete message error:', err);
      res.send(err, 500);
      return;
    }
    res.send({
      result: resp
    });
  });
});

module.exports = router;
