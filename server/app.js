const logger = require('./logger/logger');
var express = require('express');
var app = express();

logger.debug('1');
logger.info('2');
logger.warn('3');
logger.error('4');