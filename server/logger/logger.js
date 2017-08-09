const winston = require('winston');
const env = require('../server-enviroment');

let transports = [
    new (winston.transports.Console)({
        handleExceptions: true,
        humanReadableUnhandledException: true
    }),
    new (winston.transports.File)({
        name: 'info-file',
        filename: `logs/server-${env.minSeverity}.log`,
        level: env.minSeverity,
        handleExceptions: true
    }),
    new (winston.transports.File)({
        name: 'warning-file',
        filename: 'logs/server-only-warnings.log',
        level: 'warn',
        handleExceptions: true
    }),
    new (winston.transports.File)({
        name: 'error-file',
        filename: 'logs/server-only-errors.log',
        level: 'error',
        handleExceptions: true
    })
];

winston.configure({
    level: 'debug',
    transports: transports
});


module.exports = winston;