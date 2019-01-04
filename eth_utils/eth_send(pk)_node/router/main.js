//sendTransaction using pk and port forwording

app.post('/sendTransaction', function(req, res){
  try {
      var _from     = req.body["from"];
      var _to     = req.body["to"];
      var _amt    = req.body["amt"];
      var _passwd      = req.body["passwd"] //'3142CF5196tr@dE$oiN2'; //req.body["passwd"]; 
  } catch(e) {
      res.end("{\"result\":\"\", \"code\" :\"-99\", \"message\":\""+e+"\" }")
  }
  var param = {};
  param.from = _from;
  param.to = _to;
  param.amt = _amt;
  param.passwd = _passwd

  try{
    var amount = web3.utils.toHex(web3.utils.toWei(_amt, 'ether'));
  }catch(err){
    fnLogEvent("sendTransaction", param, 'error', err, function(resValue){});
    res.end("{\"result\":\"\", \"code\" :\"-100\", \"message\":\""+err+"\" }");
    return true;
  }

  isAccount(_from).then(_isAccount => {
      if(_isAccount == false){
          fnLogEvent("sendTransaction", param, 'error', "-2", function(resValue){});
          res.end("{\"result\":\"\", \"code\" :\"-2\", \"message\":\""+"From Address Fail"+"\" }")
          return true;
      }else{
          isAccount(_to).then(__isAccount => {
              if(__isAccount == false){
                  fnLogEvent("sendTransaction", param, 'error', "-2", function(resValue){});
                  res.end("{\"result\":\"\", \"code\" :\"-2\", \"message\":\""+"To Address Fail"+"\" }")
                  return true;
              }else{
                  try {
                      var transactionObject = {
                          from: _from,
                          to: _to,
                          value: amount
                      };
                  } catch(e){
                      res.end("{\"result\":\"\", \"code\" :\"-99\", \"message\":\""+e+"\" }")
                  }
                  const keythereum = require('keythereum');
                  const datadir = '/home/ethereum/ethereum_db';
                  let str;
                  keythereum.importFromFile(_from, datadir, function (keyObject) {
                      keythereum.recover(_passwd, keyObject, function (privateKey) {
                          var _privateKey = "0x"+privateKey.toString('hex');

                          transactionObject.gasPrice = '0x1c67c44400';
                          transactionObject.gas = '0xafc8';

                          const coreConnect = require('../utils/coreConnect.js');
                          coreConnect.coreConnect('10.10.0.215:8545')
                          .then((web3_2) => {
                              web3_2.eth.accounts.signTransaction(transactionObject, _privateKey , function(err, signed){
                                  if(!err){
                                      web3_2.eth.sendSignedTransaction(signed.rawTransaction, function(err, _res){
                                          if(!err){
                                              fnLogEvent("sendTransaction", param, 'success', _res, function(resValue){});
                                              res.end("{\"result\":\""+_res+"\", \"code\" :\"0\", \"message\":\""+_res+"\" }");
                                              return true;
                                          } else {
                                              fnLogEvent("sendTransaction", param, 'error', err, function(resValue){});
                                              res.end("{\"result\":\"\", \"code\" :\"-1\", \"message\":\""+err+"\" }");
                                              return true;
                                          }
                                      });
                                  } else {
                                      fnLogEvent("sendTransaction", param, 'error', err, function(resValue){});
                                      res.end("{\"result\":\"\", \"code\" :\"-1\", \"message\":\""+err+"\" }");
                                      return true;
                                  }
                              }).catch(function (err) {
                                  fnLogEvent("sendTransaction", param, 'error', err, function(resValue){});
                                  res.end("{\"result\":\"\", \"code\" :\"-99\", \"message\":\"err\" }");
                                  return true;
                              });
                          });
                      });
                  });
              }
          });
      }
  });
});
