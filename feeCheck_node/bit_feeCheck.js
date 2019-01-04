app.get('/feeCheck/:tx', (req, res) => {
    var tx = req.params.tx;

    var config = require('../config');
    var bitcoin_rpc = require('node-bitcoin-rpc')
    bitcoin_rpc.init(config.host, config.port, config.user, config.pass);

    var param = {};
    param.txid = tx;

    bitcoin_rpc.call('gettransaction', [tx], (err, docs) => {
        try {
            if(err) {
                fnLogEvent('feeCheck', param, 'error', err);
                res.end("{\"result\":\"\", \"code\" :\"-99\", \"message\":\""+err+"\" }");
            } else {
                var fee = String(docs.result.fee);
                fee = fee.replace('-', "");
                fnLogEvent('feeCheck', param, 'success', "{\"result\":\""+ fee +"\", \"code\" :\"0\", \"message\":\"\" }");
                res.end("{\"result\":\""+ fee +"\", \"code\" :\"0\", \"message\":\"\" }");
            }
        } catch(e) {
            fnLogEvent('feeCheck', param, 'error', e);
            res.end("{\"result\":\"\", \"code\" :\"-99\", \"message\":\""+e+"\" }");
        }
    });

});
