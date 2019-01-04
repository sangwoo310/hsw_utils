const Promise = require('bluebird');
const fetch = require('node-fetch');

/* 
// router/main 안에 들어가는 함수
app.get('/liveCheck', (req, res) => {
    var liveCheck = require('../utils/liveCheck.js');
    liveCheck.liveCheck(web3).then((_res) => {
        if(_res.result == "0"){
            fnLogEvent("liveCheck", null, "success", JSON.stringify(_res), function(resValue){});
            res.end(JSON.stringify(_res));
            return true;
        } else {
            fnLogEvent("liveCheck", null, "error", JSON.stringify(_res), function(resValue){});
            res.end(JSON.stringify(_res));
            return true;
        }
    });
});
*/

exports.liveCheck = function(web3){
    return coreCheck(web3).then((_res) => {
        return _res;
    });
}

/*
//web3 release version 
const coreCheck = function(web3){
    var resObj = {};
    return new Promise((resolve, reject) => {
        var sync = web3.eth.syncing;
        if(sync == false){
            resObj.result = "0";
            resObj.blockDif = 0;
            resolve(resObj);
            return true;
        } else {
            resObj.result = "-1";
            resObj.blockDif = sync.highestBlock-sync.currentBlock;
            resolve("-1");
            return true;
        }
    });
}
*/

//web3 beta version
const coreCheck = async (web3) => {
    var resObj = {};
    try {
        var exApi = await preCoreCheck().catch(e => {
            console.log(e);
            return true;
        });
    
        var blockNumber = await getBlockCount(web3).catch(e => {
            console.log(e);
            return true;
        });
    
        var blockGap = exApi - blockNumber;

        if(blockGap > 30) {
            resObj.result = "-1"
            resObj.blockDif = blockGap;
            return resObj;
        } else {
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
                            return true;
                        } else {
                            resObj.result = "-1";
                            resObj.blockDif = docs.highestBlock-docs.currentBlock;
                            resolve(resObj);
                        }
                    }
                });
            });
        }
    } catch(e) {
        resObj.result = "-99";
        resObj.blockDif = "error on catch\n"+e;
        resolve(resObj);
    }
}

const preCoreCheck = () => {
    return new Promise((resolve, reject) => {
        fetch('https://api.infura.io/v1/jsonrpc/mainnet/eth_blockNumber',{method:'GET'}).then( res => {
            return res.json();
        }).then(_res => {
            resolve(parseInt(_res, 16));
        }).catch((e)=>{
            reject(e);
        });
    });
}

var getBlockCount = (web3) => {
    return new Promise((resolve, reject) => {
        web3.eth.getBlockNumber((err, docs) => {
            try {
                if(err){
                    reject(e);
                } else {
                    resolve(docs);
                }
            } catch(e) {
                reject(e);
            }
        });
    });
}