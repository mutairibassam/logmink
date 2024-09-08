const winston = require("winston");
const { createLogger, transports } = require("winston");
const logform = require("logform");
const { combine } = logform.format;

class Logger {
  constructor() {
    this._logger = this.initializeLogger();
  }

  initializeLogger() {
    return createLogger({
      format: combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
      transports: [
        new transports.Console(),
        new transports.File({
          filename: "./logs/agent.log",
        }),
      ],
    });
  }
}

module.exports = new Logger