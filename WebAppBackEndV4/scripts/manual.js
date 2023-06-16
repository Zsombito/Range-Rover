const a_switch = document.getElementById('auto');
var inx = document.getElementById('xcord');
var iny = document.getElementById('ycord');
const b = document.getElementById('sendbutton');

const button_up = document.querySelector('button.b_up');
const button_left = document.querySelector('button.b_left');
const button_down = document.querySelector('button.b_down');
const button_right = document.querySelector('button.b_right');
const button_stop = document.querySelector('button.stopb');

const url_mode= "/drive";
const url_coord = '/drive/directed';
const url_man = '/drive/manual';

const mov = {
  "none":"0",
  "forward":"1",
  "backward":"2",
  "right":"3",
  "left":"4"
}

function senddatajson(json,url){
    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    //data = {"record":"hello"}
    xhr.send((JSON.stringify(json)));
}

function senddatastr(str,url){
  let xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  //data = JSON.stringify({"record":content})
  xhr.send(str);
}


function objectify(x,y){
  return { xcord : x,
           ycord : y
          }
}

b.addEventListener('click',()=>{
    o = objectify(parseFloat(inx.value),parseFloat(iny.value))
    console.log(o)
    senddatajson(o,url_coord)
})

a_switch.addEventListener('change', () => {
  if(a_switch.checked) {
   inx.setAttribute("disabled",'');
   iny.setAttribute("disabled",'');
   b.setAttribute("disabled",'');
   senddatastr("auto",url_mode)
   console.log("k")
  } 
  else {
    inx.removeAttribute("disabled");
    iny.removeAttribute("disabled");
    b.removeAttribute("disabled");
    senddatastr("man",url_mode)
    console.log("j")
  }
})


button_up.addEventListener('mousedown', event => {
  if(!(a_switch.checked)){  
    senddatastr(mov.forward,url_man)
  }
});
button_up.addEventListener('mouseup', event => {
  if(!(a_switch.checked)){  
    senddatastr(mov.none,url_man)
  }
});

button_left.addEventListener('mousedown', event => {
  if(!(a_switch.checked)){  
    senddatastr(mov.left,url_man)
  }
});
button_left.addEventListener('mouseup', event => {
  if(!(a_switch.checked)){  
    senddatastr(mov.none,url_man)
  }
});

button_down.addEventListener('mousedown', event => {
  if(!(a_switch.checked)){  
    senddatastr(mov.backward,url_man)
  }
});
button_down.addEventListener('mouseup', event => {
  if(!(a_switch.checked)){  
    senddatastr(mov.none,url_man)
  }
});

button_right.addEventListener('mousedown', event => {
  if(!(a_switch.checked)){
    senddatastr(mov.right,url_man)
  }
});
button_right.addEventListener('mouseup', event => {
  if(!(a_switch.checked)){  
    senddatastr(mov.none,url_man)
  }
});

button_stop.addEventListener('click', ()=>{
  if(!(a_switch.checked)){
    senddatastr(mov.none,url_man)
  }
})

