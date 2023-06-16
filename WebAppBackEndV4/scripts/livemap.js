var rad_obj = {
    "alien":20/3,
    "build":40/3,
    "fan":40/3,
    "rover":20
}

var curr_pos = {x_pos: 0, y_pos:0}
var old_pos = {x_pos: 0, y_pos:0}
var url_obj = '/view/objpos'
var url_location = "/view/roverpos"

var grid_size = 29.6; //1184/40 ~ 29.6
var x_axis_distance_grid_lines = 0;
var y_axis_distance_grid_lines = 0;
var x_axis_starting_point = { number: 1, suffix: '' };
var y_axis_starting_point = { number: 1, suffix: '' };

var img = document.getElementById('rover')
var tooltip = document.getElementById('ctxtbox');
var map = document.querySelector('.mapset');

var canvas = document.getElementById('grid');
var ctx1 = canvas.getContext('2d');

var canvas2 = document.getElementById('lmap');
var ctx2 = canvas2.getContext('2d');

// canvas width
var canvas_width = canvas.width;

// canvas height
var canvas_height = canvas.height;

// no of vertical grid lines
var num_lines_x = Math.floor(canvas_height/grid_size);

// no of horizontal grid lines
var num_lines_y = Math.floor(canvas_width/grid_size);

// Draw grid lines along X-axis
for(var i=0; i<=num_lines_x; i++) {
    ctx1.beginPath();
    ctx1.lineWidth = 1;
    
    // If line represents X-axis draw in different color
    if(i == x_axis_distance_grid_lines) 
        ctx1.strokeStyle = "#FFFFFF";
    else
        ctx1.strokeStyle = "#BDBDBD";
    
    if(i == num_lines_x) {
        ctx1.moveTo(0, grid_size*i);
        ctx1.lineTo(canvas_width, grid_size*i);
    }
    else {
        ctx1.moveTo(0, grid_size*i+0.5);
        ctx1.lineTo(canvas_width, grid_size*i+0.5);
    }
    if (i!=1){
        ctx1.stroke();
    }
}

// Draw grid lines along Y-axis
for(i=0; i<=num_lines_y; i++) {
    ctx1.beginPath();
    ctx1.lineWidth = 1;
    
    // If line represents Y-axis draw in different color
    if(i == y_axis_distance_grid_lines) 
        ctx1.strokeStyle = "#FFFFFF";
    else
        ctx1.strokeStyle = "#BDBDBD";
    
    if(i == num_lines_y) {
        ctx1.moveTo(grid_size*i, 0);
        ctx1.lineTo(grid_size*i, canvas_height);
    }
    else {
        ctx1.moveTo(grid_size*i+0.5, 0);
        ctx1.lineTo(grid_size*i+0.5, canvas_height);
    }
    if (i!=1){
        ctx1.stroke();
    }
}

// Ticks marks along the positive X-axis
for(i=1; i<(num_lines_y - y_axis_distance_grid_lines); i++) {
    ctx1.beginPath();
    ctx1.lineWidth = 1;
    ctx1.strokeStyle = "#ffffff";

    // Draw a tick mark 6px long (-3 to 3)
    ctx1.moveTo(grid_size*i+0.5, -3);
    ctx1.lineTo(grid_size*i+0.5, 3);
    ctx1.stroke();

    // Text value at that point
    ctx1.fillStyle="#FFFFFF"
    ctx1.font = '10px Arial';
    ctx1.textAlign = 'start';
    ctx1.fillText(Math.round(x_axis_starting_point.number*i*93) + x_axis_starting_point.suffix, grid_size*i-2, 15);
}

// Ticks marks along the negative X-axis
for(i=1; i<y_axis_distance_grid_lines; i++) {
    ctx1.beginPath();
    ctx1.lineWidth = 1;
    ctx1.strokeStyle = "#ffffff";

    // Draw a tick mark 6px long (-3 to 3)
    ctx1.moveTo(-grid_size*i+0.5, -3);
    ctx1.lineTo(-grid_size*i+0.5, 3);
    ctx1.stroke();

    // Text value at that point
    ctx1.fillStyle="#FFFFFF"
    ctx1.font = '10x Arial';
    ctx1.textAlign = 'end';
    ctx1.fillText(-Math.round(x_axis_starting_point.number*i*93) + x_axis_starting_point.suffix, -grid_size*i+3, 15);
}

// Ticks marks along the positive Y-axis
// Positive Y-axis of graph is negative Y-axis of the canvas
for(i=1; i<(num_lines_x - x_axis_distance_grid_lines); i++) {
    ctx1.beginPath();
    ctx1.lineWidth = 1;
    ctx1.strokeStyle = "#ffffff";

    // Draw a tick mark 6px long (-3 to 3)
    ctx1.moveTo(-3, grid_size*i+0.5);
    ctx1.lineTo(3, grid_size*i+0.5);
    ctx1.stroke();

    // Text value at that point
    ctx1.font = '10px Arial';
    ctx1.textAlign = 'start';
    ctx1.fillText(Math.round(y_axis_starting_point.number*i*93) + y_axis_starting_point.suffix, 8, grid_size*i+3);
}

// Ticks marks along the negative Y-axis
// Negative Y-axis of graph is positive Y-axis of the canvas
for(i=1; i<x_axis_distance_grid_lines; i++) {
    ctx1.beginPath();
    ctx1.lineWidth = 1;
    ctx1.strokeStyle = "#ffffff";

    // Draw a tick mark 6px long (-3 to 3)
    ctx1.moveTo(-3, -grid_size*i+0.5);
    ctx1.lineTo(3, -grid_size*i+0.5);
    ctx1.stroke();

    // Text value at that point
    ctx1.font = '10px Arial';
    ctx1.textAlign = 'start';
    ctx1.fillText(-Math.round(y_axis_starting_point.number*i*93) + y_axis_starting_point.suffix, 8, -grid_size*i+3);
}

function writeobj(x_pos,y_pos, color,type,c){
    rad = rad_obj[type]
    
    c.fillStyle = color 
    
    if(type == "fan"){
        c.fillRect(x_pos,y_pos,2*rad,2*rad)
    }
    else{
        c.beginPath()
        c.arc(x_pos, y_pos, rad,0,2*Math.PI)
        c.fill()
        c.closePath()
    }
}

function deleteobj(pos,type,c){
    rad = rad_obj[type]
    c.clearRect(pos.x_pos,pos.y_pos,65,65)
    old_pos = curr_pos
}

async function writerover(pos,c){
    curr_pos = pos
    await deleteobj(old_pos,"rover",c)
    c.drawImage(img,pos.x_pos,pos.y_pos)

}

async function rcvrovdata(url,c) {
    let response = await fetch(url);
    let data = await response.json();
    await writerover(data, c)
    await rcvrovdata(url,c)
}

async function rcvobjdata(url,c) {
    let response = await fetch(url);
    let data = await response.json();
    if(data.valid){
        await writeobj(data.x_pos,data.y_pos,data.colour,data.obstacle, c)
    }
    await rcvobjdata(url,c)
}

function CursorPos(canvas, e){
  const rect = canvas.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  return {
      xcord : x,
      ycord : y
  }
};


canvas2.addEventListener('click',e =>{
    if(!(a_switch.checked)){
        senddatajson(CursorPos(canvas2,e),url_coord)
    }
});

function mousetip(e) {
    pos = CursorPos(canvas2,e)
    //console.log(pos)
    tooltip.innerHTML = "("+Math.round(pos.xcord*3)+","+Math.round(pos.ycord*3)+")"
    tooltip.style.left = e.clientX - 450 + 'px';
    tooltip.style.top = e.clientY - 25 + 'px';
}

map.addEventListener('mousemove',mousetip)

//ctx.clearRect(0,0,canvas.width,canvas.height) 
rcvrovdata(url_location,ctx2)

rcvobjdata(url_obj,ctx2)
