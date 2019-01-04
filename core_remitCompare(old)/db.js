var mongoose = require( 'mongoose' );
var Schema   = mongoose.Schema;

var remitDB = new Schema(
    {
        "id" : String,
        "exchange" : String,
        "coin" : String, 
        "txId" : String,
        "from" : String,
        "to" : String,
        "amt" : String,
        "state" : String,
        "message" : String,
        "time" : String,
        "check_yn" : String
    });

module.exports.remitDB = mongoose.model('remitDB', remitDB);

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/remitDB');