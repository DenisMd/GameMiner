const express   = require('express');
const logger    = require('../logger/logger');
const env       = require('../server-enviroment');
const bodyParser = require("body-parser");

const MongoClient   = require('mongodb').MongoClient;
const RateLimit     = require('express-rate-limit');

// Routes
const systemRoute = require('./system/systemRoute');
const userRoute = require('./users/usersRoute');

const limiter = new RateLimit({
    windowMs: 10*60*1000, // 15 minutes
    max: 200, // limit each IP to 100 requests per windowMs
    delayMs: 0 // disable delaying - full speed until the max limit is reached
});

const userCreateLimit = new RateLimit({
    windowMs: 60*60*1000, // 60 minutes
    max: 500, // limit each IP to 3 requests per windowMs
    delayMs: 0, // disable delaying - full speed until the max limit is reached
    message: "Превышен запрос на создание пользователей, повторите через 1 час"
});

module.exports = function () {
    // Use connect method to connect to the server
    MongoClient.connect(env.dburl, function(err, db) {
        if (!err) {
            logger.info("Connected successfully to mongodb");

            const app = express();

            app.enable('trust proxy');
            app.use(limiter);
            app.use('/user/new', userCreateLimit);
            app.use( bodyParser.json() );       // to support JSON-encoded bodies
            app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
                extended: true
            }));

            logger.info(`Starting server on port ${env.port}`);
            systemRoute(app);

            if (!env.info.engineeringWorks) {
                db.collection('guser').createIndex( { "privateUUID": 1 }, { unique: true } );
                db.collection('guser').createIndex( { "publicUUID": 1 }, { unique: true } );
                db.collection('guser').createIndex( { "workerId": 1 }, { unique: true } );
                userRoute(app, db);
            }

            app.listen(env.port);

        } else
            logger.error("Connetion to mongodb failed %j", err);
    });
};