var winston = require('winston');

/*
winston.level = 'debug';
winston.add(winston.transports.File, {filename: 'some.log'});
winston.remove(winston.transports.Console);
*/

winston.configure({
    level: 'debug',
    transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({
            name: 'info-file',
            filename: 'server-info.log',
            level: 'info'
        }),
        new (winston.transports.File)({
            name: 'error-file',
            filename: 'server-error.log',
            level: 'error'
        })
    ]
});

winston.handleExceptions(new winston.transports.File({ filename: 'exceptions.log' }))

throw new Error();


winston.info('Test');
winston.error('Wowo');