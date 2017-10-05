const logger = require('../../logger/logger');

module.exports = function (app, db) {

    const gminer    = db.collection('gminer');
    const guser     = db.collection('guser');

    app.get('/miners/lastversion', function (req, res) {
        let uuid = req.query.privateUUID;
        if (!uuid) {
            res.send({codeMessage: `В запросе отсутсвует uuid`});
            res.status(400);
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

                    user.gpuInfo.forEach((gpu)=>{
                        map.push({
                                gpu: gpu,
                                miners: gminer.find({"producer": gpu.producer, "minimum-ram": {$lt: gpu.AdapterRAM}}).toArray()
                        });
                    }); // Находим совместимые GPU

                    res.send(map);
                } else {
                    res.status(400);
                    res.send({codeMessage: `Пользователь с таким uuid:"${uuid}" не найден`});
                }
            }
        });
    });
};