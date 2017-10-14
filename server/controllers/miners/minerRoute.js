const logger = require('../../logger/logger');

module.exports = function (app, db) {

    const gminer    = db.collection('gminer');
    const guser     = db.collection('guser');

    app.get('/miners/lastversion', function (req, res) {
        let uuid = req.query.privateUUID;
        if (!uuid) {
            res.status(400);
            res.send({codeMessage: `В запросе отсутсвует uuid`});
            return;
        }

        guser.findOne({"privateUUID": uuid},function (err, user) {
            if (err) {
                logger.error("Ошибка при получение пользователя по UUID: %s", uuid);
                res.status(400);
                res.send(err);
            } else {
                if (user) {
                    if (!user.gpuInfo){
                        res.status(400);
                        res.send({codeMessage: `У пользователя отсутсвует информация о видеокартах`});
                    }

                    let map = [];

                    let i = 0;
                    let callback = function (err, miners) {
                        if (i < user.gpuInfo.length) {
                            map.push({
                                gpu: user.gpuInfo[i],
                                miners: miners
                            });
                            if (++i < user.gpuInfo.length)
                                gminer.find({"producers":  { $in : [user.gpuInfo[i].producer]  }}).toArray(callback);
                            else
                                gminer.find({"producers":  null}).toArray(callback);
                        } else {
                            map.push({
                                gpu: null,
                                miners: miners
                            });
                            res.send(map);
                        }
                    };

                    gminer.find({"producers":  { $in : [user.gpuInfo[0].producer]  }}).toArray(callback);
                } else {
                    res.status(400);
                    res.send({codeMessage: `Пользователь с таким uuid:"${uuid}" не найден`});
                }
            }
        });
    });
};