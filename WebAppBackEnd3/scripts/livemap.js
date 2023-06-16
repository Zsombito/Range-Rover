var rad_obj = {
    "alien":5,
    "build":10,
    "fan":10,
    "rover":15
}

function writeobj(x_pos,y_pos, color,type,ctx){
    rad = rad_obj[type]
    
    ctx.fillStyle = color 
    
    if(type == "fan"){
        ctx.fillRect(x_pos,y_pos,2*rad,2*rad)
    }
    else{
        ctx.beginPath()
        ctx.arc(x_pos, y_pos, rad,0,2*Math.PI)
        ctx.fill()
        ctx.closePath()
    }
    
}

function deleteobj(pos,type,ctx){
    rad = rad_obj[type]
    ctx.clearRect(pos.x_pos-rad,pos.y_pos-rad,2*rad+2,2*rad+2)
    old_pos = curr_pos
    console.log("rover removed")
}

async function writerover(pos,ctx){
    curr_pos = pos
    await deleteobj(old_pos,"rover",ctx)
    ctx.fillStyle = "#000000"
    ctx.beginPath()
    ctx.arc(pos.x_pos, pos.y_pos, rad_obj["rover"],0,2*Math.PI)
    ctx.fill()
    ctx.closePath()
    console.log("rover placed")
}

async function rcvrovdata(url,c) {
    let response = await fetch(url);
    let data = await response.json();
    await writerover(data, c)
    await rcvrovdata(url,c)
}

/*async function rcvobjdata(url,c) {
    let response = await fetch(url);
    if(/*not undefined){
        let data = await response.json();
        writeobj(data.x_pos,data.y_pos,data.color,data.type, c)
    }
    await rcvobjdata(url,c)
}*/

var curr_pos = {x_pos: 0, y_pos:0}
var old_pos = {x_pos: 0, y_pos:0}
url_obj = ""
url_location = "/view/roverpos"

var canvas = document.getElementById('lmap');
var ctx = canvas.getContext('2d');

rcvrovdata(url_location,ctx)
//rcvobjdata(url_obj,ctx)
