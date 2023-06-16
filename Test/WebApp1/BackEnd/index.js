const express = require('express')
const mysql = require('mysql')
const cors = require('cors')

app=express()
app.use(cors())
port = 5000

const connection = mysql.createConnection({
    host:"localhost",
    database:"iot",
    user:"root",
    password:""
})

app.listen(port,(err)=>err?console.log(err):console.log(`Server Running on port ${port}`))
connection.connect(err=>{err?console.log(err):console.log("Connection to database OK")})

/*app.get('/data',(req,res)=>{
    connection.query('SELECT * FROM `table1`;',(err,rows)=>{
    err?res.send(err):res.send(rows)
    })
})*/


