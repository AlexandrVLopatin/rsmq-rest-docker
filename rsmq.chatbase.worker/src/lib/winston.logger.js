/* eslint-disable no-console */

const { createLogger, format, transports } = require('winston');

var logger;

exports.createLogger = function () {
  if (!logger) {
    logger = createLogger({
      format: format.combine(
        format.splat(),
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.printf(info => `${info.timestamp} [${info.level}]: ${info.message}`)
      ),
      transports: [
        new transports.Console({
          level: process.env.LOGGING_LEVEL || 'info',
          handleExceptions: true,
          format: format.combine(
            format.colorize(),
            format.printf((info) => {
              const meta = (info.meta && Object.keys(info.meta).length) ? ('\n\n' + JSON.stringify(info.meta, null, 2) + '\n') : '';
              return `${info.timestamp} [${info.level}]: ${info.message}${meta}`;
            })
          )
        })
      ]
    });
  }

  return logger;
};

exports.consoleProxy = function (logger) {
  if (logger === undefined || !logger.hasOwnProperty('info')) {
    throw new Error('Invalid logger instance passed.');
  }

  console.log = function () {
    logger.info.apply(logger, arguments);
  };
  console.info = function () {
    logger.info.apply(logger, arguments);
  };
  console.warn = function () {
    logger.warn.apply(logger, arguments);
  };
  console.error = function () {
    logger.error.apply(logger, arguments);
  };
  console.debug = function () {
    logger.debug.apply(logger, arguments);
  };
};
