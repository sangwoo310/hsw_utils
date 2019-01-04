require('../db.js');
const mongoose = require('mongoose');

const remit = mongoose.model('remitDB');

const checkDB = (checkInfo) => {
    return new Promise((resolve, reject) => {
        remit.find({"id" : checkInfo.id}).lean(true).then(docs => {
            if( checkInfo.state == "error") {
                if(checkInfo.exchange == docs[0].exchange &&
                    checkInfo.coin == docs[0].coin &&
                    checkInfo.from == docs[0].from &&
                    checkInfo.to == docs[0].to &&
                    checkInfo.amt == docs[0].amt) {
                    resolve(0);
                } else {
                    resolve(-1);
                }
            } else if( checkInfo.state == "success" ){
                if(checkInfo.exchange == docs.exchange &&
                    checkInfo.coin == docs.coin &&
                    checkInfo.txid == docs.txid &&
                    checkInfo.from == docs.from &&
                    checkInfo.to == docs.to &&
                    checkInfo.amt == docs.amt) {
                    resolve(0);
                } else {
                    resolve(-1);
                }
            }
        });
    });
}

const preCheckDB = (id) => {
    return new Promise((resolve, reject) => {
        remit.find({"id" : id}).lean(true).count().then(docs => {
            console.log(docs);
            resolve(docs);
        }).catch(e => {
            reject(e);
        })
    });
}

const remitInsertDB = (remitInfo) => {
    return new Promise((resolve, reject) => {
        remit.collection.insert(remitInfo).then( docs => {
            console.log("\n*** remit info insert success ***\n"+docs);
            resolve("0");
        }).catch(e => {
            console.log("\n!!! remit insert unKnown Error on DB !!!\n"+e.message);
            reject(e);
        });
    })
}

const check_YN_Update = (id) => {
    return new Promise((resolve, reject) => {
        remit.update({"id" : id}, {$set : {"check_yn" : "Y"}}).then( docs => {
            console.log("\n*** remitDB update success ***");
            resolve("0");
        }).catch(e => {
            console.log("\n!!! remitDB update fail !!!");
            resolve("-1");
        });
    })
}

module.exports = (app, io) => {
    app.get('/test/:data', (req, res) => {
        var data = req.params.data;
        console.log(data);
        io.emit('test', data);
        res.end();
        return true;
    })

    app.post('/test2', (req, res) => {
        console.log(req.body.test2);
        res.end();
    })

    app.post('/remitInsert', async (req, res) => {
        var id = (req.body.id).toLowerCase();
        var exchange = (req.body.exchange).toLowerCase();
        var coin = (req.body.coin).toLowerCase();
        var core = req.body.core;
        try {
            var date = new Date();

            var txid = req.body.txid;
            var from = req.body.from;
            var to = req.body.to;
            var amt = req.body.amt;
            var state = req.body.state;
            var message = req.body.message;
            var time = date.toString().substring(0,24);
            var check_yn = "N";

            //make object that where insert db collection
            var remitInfo = {
                "id" : id,
                "exchange" : exchange,
                "coin" : coin,
                "txid" : txid,
                "from" : from,
                "to" : to,
                "amt" : amt,
                "state" : state,
                "message" : message,
                "time" : time,
                "check_yn" : check_yn
            }

            var errInfo = {};
            errInfo.id = id;

            //precheck => 0 : insert / else : update
            var preCheck = await preCheckDB(id).catch(e => {
                errInfo.errPosition = "preCheckDB";
                errInfo.message = e.message;
                errInfo.code = -99;
                io.emit('remitError', errInfo);
                res.end();
                return true;
            });


            if(preCheck == 0) {
                console.log("remitInsert ==> id :: core == "+ id + " :: " + core);
                //remitInsert => 0 : success  // else : fail
                var remitInsert = await remitInsertDB(remitInfo).catch(e => {
                    errInfo.errPosition = "remitInsertDB";
                    errInfo.message = e.message;
                    errInfo.code = -99;

                    io.emit('remitError', errInfo);
                    res.end();
                    return true;
                });

                if(remitInsert == "0") {
                    io.emit('remitInsert', remitInfo);
                    res.end();
                    return true;
                }
            } else {
                console.log("remitUpdate ==> id :: core == "+ id + " :: " + core);
                var check = await checkDB(remitInfo);

                if(check == 0) {
                    var check_yn = await check_YN_Update(id);

                    if(check_yn == "0") {
                        console.log("remitUpdateSuccess ==> id :: core == "+ id + " :: " + core);
                        remitInfo.check_yn = "Y";

                        io.emit('remitUpdate', remitInfo);
                        res.end();
                        return true;
                    } else if(check_yn == "-1"){
                        console.log("!!! check_yn_update error !!!\n");
                        // code -3 : unknown check_yn_update error
                        errInfo.errPosition = "function check_yn_update";
                        errInfo.message = "check_yn_update error";
                        errInfo.code = -3;

                        io.emit('remitError', errInfo);
                        res.end();
                        return true;
                    } else {
                        console.log("$$$$$$$$$$$$$$$$$$$$")
                        console.log("why!!!!!!!!!!")
                        console.log("$$$$$$$$$$$$$$$$$$$$")
                    }
                } else if(check == -1) {
                    console.log("\n!!! checkDB fail error !!!");
                    // code -2 : checkDB fail
                    errInfo.errPosition = "checking fail";
                    errInfo.message = "checking db fail";
                    errInfo.code = -2;

                    io.emit('remitError', errInfo);
                    res.end();
                    return true;
                } else {
                    console.log("\n!!! known error !!!");
                    errInfo.errPosition = "node";
                    errInfo.message = e.message;
                    errInfo.code = -99;

                    io.emit('remitError', errInfo);
                    res.end();
                    return true;
                }
            }
        } catch(e) {
            console.log("\n!!! remitDB insert unKnown Error !!!\n"+e);
            var e = new Error(e);

            var errInfo = {};
            errInfo.id = id;
            errInfo.exchange = exchange;
            errInfo.coin = coin;
            errInfo.errPosition = "node";
            errInfo.message = e.message;
            errInfo.code = -99;

            console.log(errInfo)
            io.emit('remitError', errInfo);
            res.end();
            return true;
        }
    });
/*
    app.post('/remitUpdate', async (req, res) => {
        var id = (req.body.id).toLowerCase();
        var exchange = (req.body.exchange).toLowerCase();
        var coin = (req.body.coin).toLowerCase();
        try {
            const checkInfo = {};
            checkInfo.id = id;
            checkInfo.exchange = exchange;
            checkInfo.coin = coin;
            checkInfo.txId = req.body.txId;
            checkInfo.from = req.body.from;
            checkInfo.to = req.body.to;
            checkInfo.amt = req.body.amt;
            checkInfo.state = req.body.state;

            const errInfo = {}
            errInfo.id = id;

            var checkDB = await checkDB(checkInfo);

            if(checkDB == 0) {
                await check_YN_Update(id);
                if(check_YN_Update == 0) {
                    console.log("\n*** check_yn_update success ***")
                    updateInfo.check = 0;
                    io.emit('remitUpdate', updateInfo);
                    return true;
                } else if(check_YN_Update == -1){
                    console.log("!!! check_yn_update error !!!\n");
                    // code -3 : unknown check_yn_update error
                    errInfo.errPosition = "function check_yn_update";
                    errInfo.message = "check_yn_update error";
                    errInfo.code = -3;
                    io.emit('remitError', errInfo);
                    return true;
                }
            } else if(checkDB == -1) {
                console.log("\n!!! checkDB fail error !!!");
                // code -2 : checkDB fail
                errInfo.errPosition = "checking fail";
                errInfo.message = "checking db fail";
                errInfo.code = -2;
                io.emit('remitError', updateInfo);
                return true;
            } else {
                console.log("\n!!! known error !!!");
                var errInfo = {};
                errInfo.id = id;
                errInfo.errPosition = "node";
                errInfo.message = e.message;
                errInfo.code = -99;

                io.emit('remitError', errInfo);
                return true;
            }
        } catch(e) {
            console.log("\n!!! remitDB update unKnown Error !!!\n"+e);
            var e = new Error(e);

            var errInfo = {};
            errInfo.id = id;
            errInfo.errPosition = "node";
            errInfo.message = e.message;
            errInfo.code = -99;

            io.emit('remitError', errInfo);
            return true;
        }
    });
*/
}