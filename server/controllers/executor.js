const express = require('express');
const logger = require('../logger/logger');
const env = require('../server-enviroment');

// Routes
const systemRoute = require('./system/system');

module.exports = function () {
    const app = express();
    logger.info(`Starting server on port ${env.port}`);
    systemRoute(app);
    app.listen(env.port);
};