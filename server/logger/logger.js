var winston = require('winston');

winston.configure({
    level: 'debug',
    transports: [
        new (winston.transports.Console)({
            handleExceptions: true,
            humanReadableUnhandledException: true
        }),
        new (winston.transports.File)({
            name: 'info-file',
            filename: 'logs/server-info.log',
            level: 'info',
            handleExceptions: true
        }),
        new (winston.transports.File)({
            name: 'error-file',
            filename: 'logs/server-error.log',
            level: 'error',
            handleExceptions: true
        })
    ]
});


module.exports = winston;