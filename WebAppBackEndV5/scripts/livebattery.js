/*function rgbToHsv(r, g, b) {
  r /= 255, g /= 255, b /= 255;

  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h, s, v = max;

  var d = max - min;
  s = max == 0 ? 0 : d / max;

  if (max == min) {
    h = 0; // achromatic
  } else {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }

    h /= 6;
  }

  return [ h, s, v ];
}

function hsvToRgb(h, s, v) {
  var r, g, b;

  var i = Math.floor(h * 6);
  var f = h * 6 - i;
  var p = v * (1 - s);
  var q = v * (1 - f * s);
  var t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0: r = v, g = t, b = p; break;
    case 1: r = q, g = v, b = p; break;
    case 2: r = p, g = v, b = t; break;
    case 3: r = p, g = q, b = v; break;
    case 4: r = t, g = p, b = v; break;
    case 5: r = v, g = p, b = q; break;
  }

  return [ Math.round(r * 255), Math.round(g * 255),Math.round(b * 255) ];
}

function toHex(r, g, b){return("#"+r+g+b)}

function dToHex(d, padding) {
  var hex = Number(d).toString(16);
  padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;

  while (hex.length < padding) {
      hex = "0" + hex;
  }

  return hex;
}
*/
function writecharge(chg,batcolour,ctx){
    if (chg>0.04){
      ctx.fillStyle = "#000000" //clear battery
    ctx.fillRect(5, 5, 0.93*b_w-10, b_h-10)

    ctx.fillStyle = batcolour
    ctx.fillRect(5, 5, chg*0.93*b_w-10, b_h-10)
    } 
}

function writebattery(charge,ctx,d){
    /* code to set style based on battery percent */
    /*let hsv = [0,0,charge]
    rgb = hsvToRgb(hsv[0],hsv[1],hsv[2])
    col = toHex(dToHex(rgb[0]),dToHex(rgb[1]),dToHex(rgb[2]))*/
    console.log(charge)
    if(charge<=0.2){
      col = "#b50000";
    }
    else{
      col = "#ffffff"
    }
    //console.log(col)
    writecharge(charge,col,ctx)
    d.innerHTML=Math.round(charge*100)+"%"
    
}

async function rcvbatdata(url,c,d) {
    let response = await fetch(url);
    let data = await response.json();
    await writebattery(data.percent, c,d)
    await rcvbatdata(url,c,d)
}

var old = 1

url_battery = '/data/battery'

var canvasb = document.getElementById('bmap');
var ctxb = canvasb.getContext('2d'); 
var battxt = document.getElementById('bcharge');
ctxb.clearRect(0,0,canvasb.width,canvasb.height)

/*ctx.fillRect(0.1*canvas.width, 0.2*canvas.height, outer_rect.width, outer_rect.height)
ctx.clearRect(0.1*canvas.width+5, 0.2*canvas.height+5, outer_rect.width-10, outer_rect.height-10)*/

var b_h = canvasb.height
var b_w = canvasb.width

/*var padding ={
    h:0.2*canvasb.height,
    w:0.1*canvasb.width
}*/

ctxb.fillStyle="#FFFFFF"
ctxb.fillRect(0, 0, 0.95*b_w, b_h) 
ctxb.fillRect(0.93*b_w,0.35*b_h,0.07*b_w,0.3*b_h)


ctxb.fillStyle="#000000"
ctxb.fillRect(5, 5, (0.93*b_w)-10, b_h-10) //battery is set to 100% charge


rcvbatdata(url_battery,ctxb,battxt)

