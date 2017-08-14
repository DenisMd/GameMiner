var uuid = require('uuid/v4');

module.exports = function (app, db) {

    const guser = db.collection('guser');
    const seq = db.collection('sequences');
    seq.insertOne({name:"workerSeq", seq: 0});

    function getNextWorker(name) {
        var ret = seq.findAndModify(
            {
                query: {name: name},
                update: { $inc: { seq: 1 } },
                new: true
            }
        ).catch((err)=>{
            console.log(err);
        });

        return ret.seq;
    }

    app.get('/user/new', function (req, res) {
        const newUser = {};
        newUser.uuid = uuid();
        newUser.createDate = new Date();
        newUser.nickname = "Аноним";
        newUser.ip = [req.headers['x-forwarded-for'] || req.connection.remoteAddress];
        newUser.enable = false;
        newUser.workerId = getNextWorker("workerSeq");
        newUser.systemInfo = {};

        guser.insertOne(newUser)
            .then(
                (result) => {
                    res.send(result.ops[0]);
                }
            );
    });
};