const Promise = require('bluebird');

/*
// router/main 안에 들어가는 함수
app.get('/liveCheck', (req, res) => {
    var web3 = new Web3(new Web3.providers.HttpProvider('http://10.10.0.222:8545'));
    var liveCheck = require('../utils/liveCheck.js');
    liveCheck.liveCheck(web3, Block).then((_res) => {
        console.log('result : ' + JSON.stringify(_res));
        res.end(JSON.stringify(_res));
    });
});
*/

exports.liveCheck = async function(web3, Block){
    return coreCheck(web3).then(async (_res) => {
        if(_res.result == "0") {
            return dbCheck(web3, Block);
        } else {
            return _res;
        }
    });
}


//web3 release version 
const coreCheck = function(web3){
    var resObj = {};
    return new Promise((resolve, reject) => {
        var sync = web3.eth.syncing;
        if(sync == false){
            resObj.result = "0";
            resObj.blockDif = 0;
            resolve(resObj);
        } else {
            resObj.result = "-1";
            resObj.blockDif = sync.highestBlock-sync.currentBlock;
            resolve(resObj);
        }
    });
}


/*
//web3 beta version
const coreCheck = function(web3){
    var resObj = {};
    return new Promise((resolve, reject) => {
        web3.eth.isSyncing((err, docs) => {
            if(err){
                resObj.result = "-99";
                resObj.blockDif = -99;
                resolve(resObj);
            } else {
                if(docs == false){
                    resObj.result = "0";
                    resObj.blockDif = 0;
                    resolve(resObj);
                } else {
                    resObj.result = "-1";
                    resObj.blockDif = docs.highestBlock-docs.currentBlock;
                    resolve(resObj);
                }
            }
        });
    });
}
*/

const blockNumber = function(web3) {
    return new Promise((resolve, reject) => {
        web3.eth.getBlockNumber((err, docs) => {
            if(err) {
                reject(err);
            } else {
                resolve(docs);
            }
        });
    });
}

const dbCheck = function(web3, Block) {
    var resObj = {};
    var latestNumber = Block.find({}, "number").lean(true).sort('-number').limit(1);
    return new Promise((resolve, reject) => {
        latestNumber.exec((err, docs) => {
            try {
                if(err) {
                    resObj.result = "-99";
                    resObj.blockDif = -99;
                    resObj.message = err;
                    resolve(resObj);
                } else {
                    var dbBlock = docs[0].number+3;
                    blockNumber(web3).then((coreBlock) => {
                        var blockGap = coreBlock - docs[0].number;
                        if(blockGap > 20){
                            resObj.result = "-2";
                            resObj.blockDif = blockGap;
                            resObj.message = "db sync error";
                            resolve(resObj);
                        } else {
                            resObj.result = "0";
                            resObj.blockDif = blockGap;
                            resObj.message = "success";
                            resolve(resObj);
                        }
                    }).catch((e) => {
                        resObj.result = "-99";
                        resObj.blockDif = -99;
                        resObj.message = e;
                        resolve(resObj);
                    });
                }
            } catch(e) {
                resObj.result = "-99";
                resObj.blockDif = -99;
                resObj.message = e;
                resolve(resObj);
            }
        });
    }); 
}