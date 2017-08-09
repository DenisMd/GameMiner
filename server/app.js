const logger = require('./logger/logger');
const executor = require('./controllers/executor');

logger.info('Application start');
executor();