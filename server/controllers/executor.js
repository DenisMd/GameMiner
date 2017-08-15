const express = require('express');
const logger = require('../logger/logger');
const env = require('../server-enviroment');

const MongoClient = require('mongodb').MongoClient;

// Routes
const systemRoute = require('./system/systemRoute');
const userRoute = require('./users/usersRoute');

module.exports = function () {
    // Use connect method to connect to the server
    MongoClient.connect(env.dburl, function(err, db) {
        if (!err) {
            logger.info("Connected successfully to mongodb");

            const app = express();
            logger.info(`Starting server on port ${env.port}`);
            systemRoute(app);
            if (!env.info.engineeringWorks) {
                db.collection('guser').createIndex( { "uuid": 1 }, { unique: true } );
                db.collection('guser').createIndex( { "workerId": 1 }, { unique: true } );
                userRoute(app, db);
            }
            app.listen(env.port);

        } else
            logger.error("Connetion to mongodb failed %j", err);
    });
};