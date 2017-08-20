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
        newUser.privateUUID = uuid();
        newUser.publicUUID = uuid();
        newUser.createDate = new Date();
        newUser.ip = [req.headers['x-forwarded-for'] || req.connection.remoteAddress];
        newUser.enable = false;
        newUser.workerId = randomString(8,"#aA");
        newUser.systemInfo = {};

        logger.info("Create new user: %j", newUser);
        createUser(newUser, res);
    });

    app.get('/user/login', function (req, res) {
        let uuid = req.query.privateUUID;
        if (!uuid) {
            res.send({codeMessage: `В запросе отсутсвует uuid`});
            return;
        }

        guser.findOne({"privateUUID": uuid},function (err, result) {
            if (err) {
                logger.error("Error while try get user by uuid: %s", uuid);
                res.send(err);
            } else {
                if (result)
                    res.send(result);
                else
                    res.send({codeMessage: `Пользователь с таким uuid:"${uuid}" не найден`});
            }
        });
    });

    app.get('/user/info', function (req, res) {
        let uuid = req.query.publicUUID;
        if (!uuid) {
            res.send({codeMessage: `В запросе отсутсвует uuid`});
            return;
        }

        guser.findOne({"publicUUID": uuid}, {"privateUUID": 0},function (err, result) {
            if (err) {
                logger.error("Error while try get user by uuid: %s", uuid);
                res.send(err);
            } else {
                if (result) {
                    res.send(result);
                } else
                    res.send({codeMessage: `Пользователь с таким uuid:"${uuid}" не найден`});
            }
        });
    });
};