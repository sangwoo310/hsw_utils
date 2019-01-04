app.get('/feeCheck/:tx', (req, res) => {
    var tx = req.params.tx;

    var param = {};
    param.txid = tx;

    web3.eth.getTransaction(tx).then(  _res => {
        try {
            var gas = _res.gas;
            var gasPrice = _res.gasPrice;
            var fee = web3.utils.fromWei(String(gas*gasPrice));

            fnLogEvent('feeCheck', param, "success", fee, function(resValue){});
            res.end("{\"result\":\""+fee+"\", \"code\" :\"0\", \"message\":\"\" }");
        } catch(e) {
            fnLogEvent('feeCheck', param, "error", e, function(resValue){});
            res.end("{\"result\":\"\", \"code\" :\"-99\", \"message\":\""+e+"\" }");
        }
    });
});