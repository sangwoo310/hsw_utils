const Promise = require('bluebird');

/*
// router/main에 들어가는 함수
app.get('/liveCheck', (req, res) => {
    var liveCheck = require('../utils/liveCheck.js');
    
    var config = require('../config');
    var bitcoin_rpc = require('node-bitcoin-rpc');
    bitcoin_rpc.init(config.host, config.port, config.user, config.pass);
    
    liveCheck.liveCheck(bitcoin_rpc).then((_res) => {
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

//liveCheck
exports.liveCheck = async (bitcoin) => {
    var coreChecking = await coreCheck(bitcoin);
    return coreChecking;
}


//coreCheck
const coreCheck = async (bitcoin) => {
    var exApi = await preCoreCheck().catch(e => {
        console.log(e);
    });
    var resObj = {};

    return new Promise((resolve, reject) => {
        bitcoin.call('getblockcount', [] ,(err, _res) => {
            try{
                if(err){
                    resObj.result = "-1";
                    resObj.message = err;
                    resolve(resObj);
                } else {
                    var blockGap = exApi-_res.result;
                    if(-10<=blockGap<=10){
                        resObj.result = "0";
                        resObj.message = _res.result;
                        resolve(resObj);
                    } else {
                        resObj.result = "-3";
                        resObj.message = "external api and core blockGap is too hight. blockGap is :: "+blockGap;
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

const preCoreCheck = () => {
    return new Promise((resolve, reject) => {
        fetch('https://chain.api.btc.com/v3/block/latest',{method:'GET'}).then( res => {
            return res.json();
        }).then(_res => {
            resolve(_res.data.height);
        }).catch((e)=>{
            reject(e)
        });
    });
}