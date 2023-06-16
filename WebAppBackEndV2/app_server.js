var express = require('express');
var fileSystem = require('fs');
var mysql = require('mysql');
var bodyParser=require('body-parser');

const req = require('express/lib/request');
const { query } = require('express');
var server = express();

server.use(express.static('.'));
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended:true}));

const con = mysql.createConnection({
    host: '34.235.116.136',
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

insert_SQL = (obj) => {
    var s = 0
    table = obj.table
    if(table == "Position"){ table == "`Position`"}
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
var coord
var n

/* example object from ESP32
    obj = {
        "table":""

    }
*/

server.get('/', function(req, res) {
    dirvemode = "auto"
    res.sendFile('homepage.html', { root: 'html' });
});

server.get('/data', function(req, res) {
    res.sendFile('data.html', { root: 'html' });
});

server.get('/drive', function(req, res) {
    drivemode="auto";
    res.sendFile('drive_home.html', { root: 'html' });
    console.log(drivemode)
});

server.post('/drive', function(req,res) {
    let d = req.body;
    drivemode = Object.keys(d)[0];
    res.end()
});

server.get('/drive/directed', function(req,res){
    drivemode = 'directed';
    res.sendFile('drive_directed.html', { root: 'html'});
    console.log(drivemode)
});

server.post('/drive/directed', function(req,res) {
    let c = req.body;
    let x = c.xcord;
    let y = c.ycord;
    coord = x +','+ y;

    try {
        var htmlc = fileSystem.readFileSync('/Users/andyw/OneDrive/Documents/GitHub/RangeRover/WebAppBackEndV2/html/drive_directed.html', 'utf8');
      } catch (err) {
        console.error(err);
      }

    res.writeHead(200, {'Content-Type':'text/html'});
    res.end(htmlc);
});

server.post('/drive/directed/inst', function(req,res){
    res.send(coord);
    res.end();
});

server.get('/drive/manual', function(req,res) {
    drivemode = "manual";
    res.sendFile('drive_manual.html', { root: 'html' });
    console.log(drivemode)
});

server.post('/drive/manual', function(req,res) { //todo change to send strings of instruction back to ESP32
    let d = req.body;
    n = Object.keys(d)[0]
    res.end();
});

server.post('/drive/manual/inst', function(req,res) {
    res.send(n);
    res.end();
})

server.post('/rcv', function(req,res) {
    data = req.body;
    data_obj = JSON.parse(data)
    table = data_obj.table;
    req = insert_SQL(data_obj)
    con.query(req, function (err, result) {
        if (err) throw err;
    });
    res.send(drivemode)
})

server.get('/view/roverpos',function(req,res){
    let q = "SELECT x_pos,y_pos FROM Position WHERE time = (SELECT MAX(time) FROM Position);"
    var r
    con.query(q, (err, result) => {
        if (err) throw err;
        res.writeHead(200, {'Content-Type':'application/json'})
        r = JSON.parse(JSON.stringify(result))[0];
        console.log(r)
        res.end(JSON.stringify(r))  
    })
})

server.get('/view/objpos',function(req,res){
    let q = "SELECT x_pos,y_pos,colour,obstacle FROM Obstacles WHERE time = (SELECT MAX(time) FROM Obstacles);" /*fix select*/ 
    var r
    con.query(q, (err, result) => {
        if (err) throw err;
        res.writeHead(200, {'Content-Type':'application/json'})
        r = JSON.parse(JSON.stringify(result))[0];
        console.log(r)
        res.end(JSON.stringify(r))  
    })
})

server.get('/view', function(req, res) {
    res.sendFile('view.html', { root: 'html' });
});


console.log('Server is running on port 3000');
server.listen(3000,'0.0.0.0');