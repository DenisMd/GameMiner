const env = require('../../server-enviroment');

module.exports = function (app) {
    app.get('/', function (req, res) {
        res.send("App works");
    });
    app.get('/info', function (req, res) {
        res.send(env.info)
    })
};