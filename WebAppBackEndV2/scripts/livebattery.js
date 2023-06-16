function addbattery(posdelta,percent,ctx){
    rad = rad_obj[type]+0.5
    ctx.fillRect(pos.x_pos,pos.y_pos,2*rad,2*rad)
    console.log("rover removed")
    old_pos = curr_pos
}

function subbattery(negdelta,ctx){

}

async function writebattery(pos,ctx){
    curr_pos = pos
    await deleteobj(pos,"rover",ctx)
    ctx.fillStyle = "#000000"
    ctx.beginpath()
    ctx.arc(pos.x_pos, pos.y_pos, rad_obj["rover"],0,2*Math.PI)
    ctx.fill()
    ctx.closePath()
}

async function rcvrovdata(url,c) {
    let response = await fetch(url);
    let data = await response.json();
    await writerover(data, c)
    await rcvrovdata(url,c)
}

var curr_pos = {x_pos: 0, y_pos:0}
var old_pos = {x_pos: 0, y_pos:0}
url_obj = ""
url_location = "/view/roverpos"

var canvas = document.getElementById('lmap');
var ctx = canvas.getContext('2d');

rcvrovdata(url_location,ctx)
//rcvobjdata(url_obj,ctx)
