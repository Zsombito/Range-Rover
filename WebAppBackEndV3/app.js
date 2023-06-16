var express = require('express');
var fileSystem = require('fs');
var mysql = require('mysql');
var bodyParser=require('body-parser');

var server = express();

server.use(express.static('.'));
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended:true}));

const con = mysql.createConnection({
    host: '35.172.182.180',
    user: 'admin',
    password: 'client',
    port: 3306
});

con.connect(function(err) {
    if (err){
        console.log("Could not connect to the database.");
        throw err;
    }
    console.log("Connected!");
});

con.query("USE RangeRoverData", function (err, result) {
    if (err) throw err;
});

con.query("DELETE FROM `Position`", function (err, result) {
    if (err) throw err;
});

con.query("DELETE FROM `Obstacles`", function (err, result) {
    if (err) throw err;
});

con.query("DELETE FROM `Battery`", function (err, result) {
    if (err) throw err;
});

insert_SQL = (obj) => {
    var s = 0
    table = obj.table
    if(table == "Position"){ table = "`Position`"}
    str = 'INSERT INTO '+table+' ('
    for (let i in obj){
        if (i != "table"){
            if(i == "time"){
             i = "`time`"
            }
            if(s == 0){
               str += i
            }
            else{
               str += ","+i
            }
            s++
        }
    }
    str+=') VALUES ('
    s = 0
    for (let i in obj){
        if (i != "table"){
            v = obj[i]
            if(typeof(v) == "string"){
                v = "'"+v+"'"
            }
            if(s == 0){
               str += v
            }
            else{
               str += ","+v
            }
            s++
        }
    }
    return str+');'
}

var drivemode = "auto"
var inst
var n

/* example object from ESP32
    obj = {
        "table":""

    }
*/

server.get('/', function(req, res) {
    dirvemode = "manual"
    res.sendFile('index.html', { root: 'html' });
});

server.post('/drive', function(req,res) {
    let d = req.body;
    drivemode = Object.keys(d)[0];
    res.end()
});

server.post('/drive/directed', function(req,res) {
    let c = req.body
    let x = c.xcord;
    let y = c.ycord;
    inst = x +','+ y;
    console.log(inst)
    res.end()
});

server.post('/drive/manual', function(req,res) { //todo change to send strings of instruction back to ESP32
    let d = req.body;
    inst = Object.keys(d)[0]
    console.log(inst)
    res.end();
});

server.post('/drive/manual/inst', function(req,res) {
    res.send(inst);
    res.end();

})

server.post('/rcv', function(req,res) {
    data = req.body;
    console.log(data)
    table = data.table;
    req = insert_SQL(data)
    con.query(req, function (err, result) {
        if (err) throw err;
    });
    res.send(drivemode)
})

var j =0
server.get('/view/roverpos',function(req,res){
    let q = "SELECT x_pos,y_pos FROM Position WHERE time = (SELECT MAX(time) FROM Position);"
    var r
    res.writeHead(200, {'Content-Type':'application/json'})
    obj = {x_pos:j*10,y_pos:Math.abs(Math.sin(i*Math.PI/180)*700)}
    //console.log(obj)
    j++
    if(j>100){
        j = 0;
    }
    res.end(JSON.stringify(obj))
    /*con.query(q, (err, result) => {
        if (err) throw err;
        r = JSON.parse(JSON.stringify(result))[0];
        console.log(r)
        if(typeof(r)!="undefined"){
            res.writeHead(200, {'Content-Type':'application/json'})
            res.end(JSON.stringify(r)) 
        }
    })*/
})


server.get('/view/objpos',function(req,res){
    let q = "SELECT x_pos,y_pos,colour,obstacle,valid FROM Obstacles WHERE time = (SELECT MAX(time) FROM Obstacles);"
    var r
    /*res.writeHead(200, {'Content-Type':'application/json'})
    obj = {x_pos:i,y_pos:i}
    i++
    console.log(obj)
    res.end(JSON.stringify(obj))*/
    con.query(q, (err, result) => {
        if (err) throw err;
        r = JSON.parse(JSON.stringify(result))[0];
        console.log(r)
        res.writeHead(200, {'Content-Type':'application/json'})
        if(typeof(r)!="undefined"){
            res.end(JSON.stringify(r)) 
        }
        else{
            res.end(JSON.stringify({valid:0}))
        }
    })
})

var i = 0
server.get('/data/battery',async function(req,res){ 
    setTimeout(() => {
        res.writeHead(200, {'Content-Type':'application/json'})
        rad = i*Math.PI/180
        i++
        val = Math.abs(Math.sin(rad))
        obj = {percent:val}
        res.end(JSON.stringify(obj))},
    200)
    
})

console.log('Server is running on port 3000');
server.listen(3000,'127.0.0.1');
