var express = require('express');
var fileSystem = require('fs');
var server = express();
var bodyParser=require('body-parser');
server.use(express.static('.'));
server.use(express.json())
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended:true}));
addr = '127.0.0.1'

server.post('/', function(req,res){
    console.log(req.body);
    res.send(JSON.stringify({"ur":"cute"}))
});

server.get('/man', function(req,res){
    res.send()
})

server.get('/', function(req,res){
    res.sendFile('data.html', { root: 'html' });
})

console.log("Hello")
server.listen(5000, addr)