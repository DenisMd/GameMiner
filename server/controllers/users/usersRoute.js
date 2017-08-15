var uuid = require('uuid/v4');
const logger = require('../../logger/logger');

module.exports = function (app, db) {

    function randomString(length, chars) {
        let mask = '';
        if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz';
        if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (chars.indexOf('#') > -1) mask += '0123456789';
        if (chars.indexOf('!') > -1) mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
        let result = '';
        for (let i = length; i > 0; --i) result += mask[Math.floor(Math.random() * mask.length)];
        return result;
    }

    function createUser(user, res, level, error) {
        if (!level)
            level = 1;
        if (level === 10) {
            res.send(error);
            return;
        }
        guser.insertOne(user)
            .then(
                (result) => {
                    res.send(result.ops[0]);
                }
            )
            .catch(
                (error) => {
                    logger.error("Error while create new user: %j, error: %j, level: %d", newUser, error, level);
                    user.workerId = randomString(8,"#aA");
                    createUser(user, res, ++level, error)
                }
            );
    }

    const guser = db.collection('guser');

    app.get('/user/new', function (req, res) {
        const newUser = {};
        newUser.uuid = uuid();
        newUser.createDate = new Date();
        newUser.nickname = "Аноним";
        newUser.ip = [req.headers['x-forwarded-for'] || req.connection.remoteAddress];
        newUser.enable = false;
        newUser.workerId = randomString(8,"#aA");
        newUser.systemInfo = {};

        logger.info("Create new user: %j", newUser);
        createUser(newUser, res);
    });
};