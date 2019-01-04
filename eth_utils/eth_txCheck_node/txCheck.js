    app.get('/txCheck/:tx', (req, res) => {
        var tx = req.params.tx;

        var param = {};
        param.txid = tx;

        web3.eth.getTransactionReceipt(tx).then( docs => {
            if(docs == null) {
                fnLogEvent("txCheck", param, 'pending', "-10", function(resValue){});
                res.end('{"result":"","code":"-10","message":"-10"}');
            } else {
                if(docs.status == true) {
                    fnLogEvent("txCheck", param, 'success', "0", function(resValue){});
                    req.end('{"result":"","code":"0","message":"0"}');
                } else if(docs.status == false) {
                    fnLogEvent("txCheck", param, 'error', "-20", function(resValue){});
                    res.end('{"result":"","code":"-20","message":"-20"}');
                } else {
                    fnLogEvent("txCheck", param, 'error', "-99", function(resValue){});
                    res.end('{"result":"","code":"-99","message":"-99"}');
                }
            }
        }).catch(e => {
            fnLogEvent("txCheck", param, 'error', e, function(resValue){});
            res.end('{"result":"","code":"-100","message":'+e+'}');
        });
    });
