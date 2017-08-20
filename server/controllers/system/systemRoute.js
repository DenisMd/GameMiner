const env = require('../../server-enviroment');

module.exports = function (app) {
    app.get('/', function (req, res) {
        res.send("GServer works");
    });
    app.get('/info', function (req, res) {
        const info = env.info;
        if (info.engineeringWorks === false) {
            delete info.engineeringWorks;
            delete info.engineeringWorksMess;
        }
        res.send(env.info)
    })
};