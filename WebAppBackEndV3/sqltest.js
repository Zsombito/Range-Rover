var mysql = require('mysql');
var http = require('http');
//Some sample code below shows
//how to connect to the mysql database
// First you need to create a connection to the database
// Be sure to replace 'user' and 'password' with the correct values
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

/*
insert_SQL = (obj) => {
    table = obj.table
    str = "INSERT INTO "+table+" ("
    for (let i in obj){
        if (i != "table"){
            str += i+","
        }
    }
    str+="\b) VALUES ("
    for (let i in obj){
        if (i != "table"){
            v = obj[i]
            if(typeof(v) == "string"){
                v = "'"+v+"'"
            }
            str+=v+","
        }
    }
    return str+"\b);"
 }

{"table":"Obstacles", 
 "x_pos":32, 
 "y_pos":432, 
 "time":155, 
 "obstacle":"alien", 
 "color":"#FF0000"}))
*/

let q = "INSERT INTO `Position`(x_pos,y_pos,`time`,id) VALUES(1,1,1,100);"
 var r
 con.query(q, (err, result) => {
     if (err) throw err;
     //res.writeHead(200, {'Content-Type':'application/json'})
     if(typeof(result)!="undefined"){
        r = JSON.parse(JSON.stringify(result))[0];
        console.log(r)
     }
     //res.end(JSON.stringify(r))  
 })