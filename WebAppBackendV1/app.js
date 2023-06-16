var express = require('express');
var fileSystem = require('fs');
var server = express();
var bodyParser=require('body-parser');
const req = require('express/lib/request');
server.use(express.static('.'));
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended:true}));

var drivemode = "auto"
var coord

const outpath = '/mnt/c/Users/andyw/OneDrive/Documents/GitHub/RangeRover/WebAppBackendV1/out.txt';

server.get('/', function(req, res) {
    dirvemode = "auto"
    fileSystem.stat(outpath, function(err, stat) {
        if(err == null) {
            fileSystem.unlink(outpath,err => {
                if (err) {
                    console.error(err);
                }
            })
        } else if(err.code === 'ENOENT') {
            // file does not exist
            fileSystem.writeFile(outpath, '', err => {
                if (err) {
                    console.error(err);
                }
            });
        } else {
            console.log('Some other error: ', err.code);
        }
    });
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
    console.log(coord)

    try {
        var htmlc = fileSystem.readFileSync('/mnt/c/Users/andyw/OneDrive/Documents/GitHub/RangeRover/WebAppBackendV1/html/drive_directed.html', 'utf8');
      } catch (err) {
        console.error(err);
      }

    res.writeHead(200, {'Content-Type':'text/html'});
    res.end(htmlc);
});

server.post('/directed/directed/inst', function(req,res){
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
    let data = Object.keys(d)[0]
    fileSystem.writeFile(outpath, data, {flag: 'a+'}, err => {
        if (err) {
            console.error(err);
        }
    });
    res.end();

});

server.post('/drive/manual/inst', function(req,res) {
    /*
    TODO send strings back to ESP32
   {
       0:nothin
       1:forward
       2:backwaqrd
       3:turn right
       4:turn left
   }
   */
})

server.post('/rcv', function(req,res) {
    data = req.body;
    res.send(drivemode)
})

server.get('/view', function(req, res) {
    res.sendFile('view.html', { root: 'html' });
});


console.log('Server is running on port 3000');
server.listen(3000,'127.0.0.1');