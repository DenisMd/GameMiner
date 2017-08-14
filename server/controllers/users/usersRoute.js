module.exports = function (app, db) {
    app.get('/user/create', function (req, res) {
        res.send("GServer works");
    });
};