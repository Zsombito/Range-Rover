var express = require('express');
var fileSystem = require('fs');
var mysql = require('mysql');
var bodyParser=require('body-parser');

var server = express();

server.use(express.static('.'));
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended:true}));

const con = mysql.createConnection({
    host: '18.130.61.27',
    user: 'client',
    password: 'andy',
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

var drivemode = "man"
var inst = 0
var ve = 5
var manmode = "fullmanual"
var corner = "1"

var datapckt = {drive:"auto",velocity:5}

/* example object from ESP32
    obj = {
        "table":""

    }
*/

server.get('/', function(req, res) {
    dirvemode = "home"
    res.sendFile('home.html', { root: 'html' });
});

server.get('/command', function(req, res){
    res.sendFile('index.html', { root: 'html' });
});

server.post('/drive', function(req,res) {
    let d = req.body;
    drivemode = Object.keys(d)[0];
    console.log(drivemode)
    res.end()
});

server.post('/drive/directed', function(req,res) {
    let c = req.body
    let x = c.xcord;
    let y = c.ycord;
    inst = x +','+ y;
    manmode = "coordinate"
    console.log(inst)
    res.end()
});

server.post('/drive/velocity', function(req,res) {
    let vel = req.body;
    ve = Object.keys(vel)[0]
    console.log(ve)
    res.end();
});

server.post('/drive/manual', function(req,res) { //todo change to send strings of instruction back to ESP32
    let d = req.body;
    inst = Object.keys(d)[0]
    manmode = "fullmanual"
    console.log(inst)
    res.end();
});

server.post('/drive/manual/inst', function(req,res) {
    let obj = {
        drivemode:manmode,
        method:inst
    }
    console.log(obj)
    res.send(obj);
    res.end();
})

server.post('/rcv', function(req,res) {
    let starttime = performance.now()
    data = req.body;
    let latencyserveresp = performance.now() - starttime
    console.log(latencyserveresp)
    console.log(data)
    table = data.table;
    req = insert_SQL(data)
   /* con.query(req, function (err, result) {
        if (err) throw err;
    });*/
    datapckt.drive = drivemode
    datapckt.velocity = ve
    console.log(datapckt)
    res.send(datapckt)
})

/*
json1 = {
    drivemode:fullmanual or coord
    method:n or x,y

}

json2 = {
    drive: man are auto
    velocity: v
}
*/

var j =0
server.get('/view/roverpos',function(req,res){
    let q = "SELECT x_pos,y_pos FROM Position WHERE time = (SELECT MAX(time) FROM Position);"
    var r
    /*res.writeHead(200, {'Content-Type':'application/json'})
    obj = {x_pos:1000,y_pos:600}
    //console.log(obj)
    j++
    if(j>100){
        j = 0;
    }
    res.end(JSON.stringify(obj))*/
    let starttime = performance.now()
    con.query(q, (err, result) => {
        if (err) throw err;
        let latencysql = performance.now() - starttime
        r = JSON.parse(JSON.stringify(result))[0];
        console.log(r)
        if(typeof(r)!="undefined"){
            res.writeHead(200, {'Content-Type':'application/json'})
            res.end(JSON.stringify(r)) 
        }
    })
})

server.get('/startcorner',function(req,res){
    res.end(corner)
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
