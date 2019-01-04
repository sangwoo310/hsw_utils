const Web3 = require('web3');
const Promise = require('bluebird');


// 코인캐피탈, 플랜비트, 비트빅뱅, 트라도피아, 써니7, 마이크립토, wmubc, 바이낸스
const ipList = ["10.10.0.105:8545", "10.10.0.121:8545", "10.10.0.218:8545", "10.10.0.222:8545", "10.10.0.51:8545", "10.10.0.75:8545", "10.10.0.61:8545", "10.10.0.57:8545"];

exports.coreConnect = function(ip){
    return syncingCheck(ip).then((web3) => {
        return web3;
    });
}


var syncingCheck = function(ip){
    return new Promise((resolve, reject) => {
        var web3 = new Web3(new Web3.providers.HttpProvider('http://'+ip));
        var sync = web3.eth.syncing;
        console.log(sync)
        if(sync == false){
            console.log("*** "+ ip +" syncing success ***")
            resolve(web3);
            return true;
        } else {
            console.log("!!! "+ip+" syncing fail !!!")
            var random = Math.floor(Math.random() * (ipList.length));
            ip = ipList[random];
            resolve(syncingCheck(ip));
            return true;
        }
    });
}