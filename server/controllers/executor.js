const express = require('express');
const logger = require('../logger/logger');
const env = require('../server-enviroment');


module.exports = function () {
    const app = express();
    logger.info(`Starting server on port ${env.port}`);
    app.listen(env.port);
};