require('../db.js');
const mongoose = require('mongoose');

const fetch = require('node-fetch');

const txLiveList = (sendInfo) => {
    fetch('http://10.10.0.225:4001/tx/txLiveList', {method : 'POST', body :JSON.stringify(sendInfo), headers:{'Content-Type':'application/json'}}).catch((e)=>{
        console.log(e);
    });
}

module.exports = function(app){
    app.post('/sendTxInsert', (req, res) => {
        try {
            //checking for api call status
            var category = (req.body.category).charAt(0).toUpperCase()+((req.body.category).toLowerCase()).slice(1);
            var market = (req.body.market).toLowerCase();
            var core = (req.body.core).charAt(0).toUpperCase()+((req.body.core).toLowerCase()).slice(1);

            var date = new Date();

            //db insert parameter
            var fnName = req.body.function;
            var time = date.toString().substring(0,24);
            var from = req.body.from;
            var to = req.body.to;
            var amt = req.body.amt;
            var state = req.body.state;
            var result = req.body.result;
            var error = req.body.error;

            //make db collection model
            var collectionName = market+core+"SendTx"+category;
            const sendCompareDB = mongoose.model(collectionName);

            //make object that where insert db collection
            var sendInfo = {
                "function" : fnName,
                "time" : time,
                "from" : from,
                "to" : to, 
                "amt" : amt,
                "state" : state,
                "result" : result,
                "error" : error
            }

            var liveListInfo = sendInfo;
            liveListInfo.category = category;
            liveListInfo.market = market;
            liveListInfo.core = core;

            txLiveList(liveListInfo);

            //db insert query
            sendCompareDB.collection.insert(sendInfo).then((err, docs) => {
                try {
                    if(err){
                        throw err;
                    } else {
                        console.log(collectionName);
                        console.log(JSON.stringify(sendInfo));
                        res.end(true);
                        return true;
                    }
                } catch(e) {
                    console.log(e);
                    res.end(e);
                    return true;
                }
            });
        } catch(e) {
            console.log("!!! sendTxInsert Error !!!"+e);
            return true;
        }
    });

    app.get('/getMainSendTxList/:market/:core/:pageNum', async (req, res) => {
        try {
            var market = (req.params.market).toLowerCase();
            var core = (req.params.core).charAt(0).toUpperCase()+((req.params.core).toLowerCase()).slice(1);
            var pageNum = req.params.pageNum;

            CoreCollectionName = market+core+"SendTxCore";
            const sendCompareCoreDB = mongoose.model(CoreCollectionName);

            ApiCollectionName = market+core+"SendTxApi";
            const sendCompareApiDB = mongoose.model(ApiCollectionName);

            var coreInfo = sendCompareCoreDB.find().lean(true).sort('-time').skip((pageNum-1)*10).limit(10);
            var apiInfo = sendCompareApiDB.find().lean(true).sort('-time').skip((pageNum-1)*10).limit(10);
            var totalCount = sendCompareCoreDB.find().count();

            var coreInfoData;
            var apiInfoData;
            var totalCountData;

            await coreInfo.exec().then( docs => {
                coreInfoData = docs;
                return true;
            }).catch(e => {
                console.log("!!! get coreInfoData is error !!!\n"+e);
                return true;    
            });
            
            await apiInfo.exec().then( docs => {
                apiInfoData = docs;
                return true;
            }).catch(e => {
                console.log("!!! get apiInfoData is error !!!\n"+e);
                return true;
            });

            await totalCount.exec().then(docs => {
                totalCountData = docs;
                return true;
            }).catch( e => {
                console.log("!!! get totalcount is error !!!\n"+e);
                return true;
            });

            var retrunObj = {};
            retrunObj.coreInfoData = coreInfoData;
            retrunObj.apiInfoData = apiInfoData;
            retrunObj.totalCountData = totalCountData;

            res.end(JSON.stringify(retrunObj));
            return true;
            
        } catch(e) {
            console.log("!!! getSendCompareInfo Error !!!\n"+e);
            return true;
        }
    });

    app.get('/getFindSendTxList/:market/:core/:findOpt/:findVal/:pageNum', async (req, res) => {
        try {
            var market = (req.params.market).toLowerCase();
            var core = (req.params.core).charAt(0).toUpperCase()+((req.params.core).toLowerCase()).slice(1);
            var findOpt = req.params.findOpt;
            var findVal = req.params.findVal;
            var pageNum = req.params.pageNum;

            CoreCollectionName = market+core+"SendTxCore";
            const sendCompareCoreDB = mongoose.model(CoreCollectionName);

            ApiCollectionName = market+core+"SendTxApi";
            const sendCompareApiDB = mongoose.model(ApiCollectionName);

            console.log(findOpt +" :: "+findVal)

            if (findOpt == 'txid') {
                find = {
                    'result': findVal
                }
            } else if (findOpt == 'from') {
                find = {
                    'from': findVal
                }
            }  else if (findOpt == 'to') {
                find = {
                    'to': findVal
                }
            }

            var coreInfo = sendCompareCoreDB.find(find).lean(true).sort('-time').skip((pageNum-1)*10).limit(10);
            var apiInfo = sendCompareApiDB.find(find).lean(true).sort('-time').skip((pageNum-1)*10).limit(10);
            var totalCount = sendCompareCoreDB.find(find).count();

            var coreInfoData;
            var apiInfoData;
            var totalCountData;

            await coreInfo.exec().then( docs => {
                coreInfoData = docs;
                return true;
            }).catch(e => {
                console.log("!!! get coreInfoData is error !!!\n"+e);
                return true;    
            });
            
            await apiInfo.exec().then( docs => {
                apiInfoData = docs;
                return true;
            }).catch(e => {
                console.log("!!! get apiInfoData is error !!!\n"+e);
                return true;
            });

            await totalCount.exec().then(docs => {
                totalCountData = docs;
                return true;
            }).catch( e => {
                console.log("!!! get totalcount is error !!!\n"+e);
                return true;
            });

            var retrunObj = {};
            retrunObj.coreInfoData = coreInfoData;
            retrunObj.apiInfoData = apiInfoData;
            retrunObj.totalCountData = totalCountData;

            res.end(JSON.stringify(retrunObj));
            return true;
            
        } catch(e) {
            console.log("!!! getSendCompareInfo Error !!!\n"+e);
            return true;
        }
    });

    app.get('/getTxLiveList/:market', async (req, res) => {
        try {
            var market = (req.params.market).toLowerCase();
    
            const planbit = ["Btc","Bch","Eth","Xrp","Stg","Hdac","Btg","Ltc","Dash","Qtum","Secret","Vstc"];
            const bitbigbang = ["Btc","Bch","Eth","Xrp","Gca"];
            const tradopia = ["Btc","Bch","Eth","Xrp","G3","Hit","Omw"];
            const corex = ["Btc","Bch","Eth","Xrp","Ltc","Eos"];
            var dbCollectionCore = {};
            var dbCollectionApi = {};
            var txInfo = {
                "core" : {},
                "api" : {}
            };
            
            if(market == "planbit") {
                for(let i=0; i<planbit.length; i++) {
                    var coreCollectionName = market+planbit[i]+"SendTxCore";
                    var apiCollectionName = market+planbit[i]+"SendTxApi";

                    dbCollectionCore[market+planbit[i]] = mongoose.model(coreCollectionName);
                    dbCollectionApi[market+planbit[i]] = mongoose.model(apiCollectionName);
                }
            } else if(market == "bitbigbang") {
                for(let i=0; i<bitbigbang.length; i++) {
                    var coreCollectionName = market+bitbigbang[i]+"SendTxCore";
                    var apiCollectionName = market+bitbigbang[i]+"SendTxApi";

                    dbCollectionCore[market+bitbigbang[i]] = mongoose.model(coreCollectionName);
                    dbCollectionApi[market+bitbigbang[i]] = mongoose.model(apiCollectionName);
                }
            } else if(market == "tradopia") {
                for(let i=0; i<tradopia.length; i++) {
                    var coreCollectionName = market+tradopia[i]+"SendTxCore";
                    var apiCollectionName = market+tradopia[i]+"SendTxApi";

                    dbCollectionCore[market+tradopia[i]] = mongoose.model(coreCollectionName);
                    dbCollectionApi[market+tradopia[i]] = mongoose.model(apiCollectionName);
                }
            } else if(market == "corex") {
                for(let i=0; i<corex.length; i++) {
                    var coreCollectionName = market+corex[i]+"SendTxCore";
                    var apiCollectionName = market+corex[i]+"SendTxApi";

                    dbCollectionCore[market+corex[i]] = mongoose.model(coreCollectionName);
                    dbCollectionApi[market+corex[i]] = mongoose.model(apiCollectionName);
                }
            } else {
                console.log("getTxLiveList Error");
                return true;
            }

            for(let i=0; i<Object.keys(dbCollectionCore).length; i++){
                txInfo.core[Object.keys(dbCollectionCore)[i]+"Info"] = await new Promise((resolve, reject) => {
                    Object.values(dbCollectionCore)[i].find({},"time, state, result, error").lean(true).sort('-time').limit(1)
                    .exec().then(docs => {
                        docs.market = market+Object.keys(dbCollectionCore)[i];
                        resolve(docs[0]);
                    }).catch(e => {
                        throw e;
                        resolve(e);
                    });
                });

                txInfo.api[Object.keys(dbCollectionApi)[i]+"Info"] = await new Promise((resolve, reject) => { 
                    Object.values(dbCollectionApi)[i].find({},"time, state, result, error").lean(true).sort('-time').limit(1)
                    .exec().then(docs => {
                        docs.market = market+Object.keys(dbCollectionApi)[i];
                        resolve(docs[0]);
                    }).catch(e => {
                        throw e;
                        resolve(e);
                    });
                });
            }

            res.send(JSON.stringify(txInfo));
            res.end();
            return true;
        } catch(e) {
            console.log("!!! getTxLiveList Error !!!\n"+e+"\n");
            txInfo = {};
            txInfo.core = null;
            txInfo.api = null;
            res.end(JSON.stringify(txInfo));
        }
    });
}
