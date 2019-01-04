const Promise = require('bluebird');

/*
// router/main에 들어가는 함수
var liveCheck = (req, res) => {
    var liveCheck = require('../utils/liveCheck.js');
    
    liveCheck.liveCheck(bitcoin, Block).then((_res) => {
        console.log(JSON.stringify(_res));
        res.end(JSON.stringify(_res));
        return true;
    });
};
*/

//liveCheck
exports.liveCheck = async (bitcoin, Block) => {
    return coreCheck(bitcoin).then((_res) => {
        if(_res.result == 0) {
            return dbCheck(_res.message, Block)
        } else {
            return _res;
        }
    })
}


//coreCheck
const coreCheck = (bitcoin) => {
    var resObj = {};
    return new Promise((resolve, reject) => {
        bitcoin.call('getblockcount', [] ,(err, _res) => {
            try{
                if(err){
                    resObj.result = "-1";
                    resObj.message = err;
                    resolve(resObj);
                } else {
                    resObj.result = "0";
                    resObj.message = _res.result;
                    resolve(resObj);
                }
            } catch(e) {
                resObj.result = "-99";
                resObj.message = e;
                resolve(resObj);
            }
        });
    });
}

//dbCheck
const dbCheck = function(coreBlock, Block){
    var resObj = {};
    var latestNumber = Block.find({}, "height").lean(true).sort('-height').limit(1);
    return new Promise((resolve, reject) => {
        latestNumber.exec((err, docs) => {
            try {
                if(err){
                    resObj.result = "-99";
                    resObj.message = err;
                    resolve(resObj);
                } else {
                    var dbBlock = docs[0].height+3;
                    var blockGap = coreBlock - dbBlock;
                    if(blockGap > 20) {
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
                }
            } catch(e) {
                resObj.result = "-99";
                resObj.message = e;
                resolve(resObj);
            }
        });
    });
}