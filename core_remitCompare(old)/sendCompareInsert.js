const express = require('express');
const bodyParser = require('body-parser');

const app = express();

const socket = require('socket.io-client');
const cors = require('cors');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));

const io = socket.connect('http://61.97.253.163:5000')

const server = app.listen(5100, '0.0.0.0', ()=>{
    console.log("port 5100 is ready");
});

const router = require('./router/main')(app, io);