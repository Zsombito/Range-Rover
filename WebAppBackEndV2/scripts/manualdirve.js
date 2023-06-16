function senddata(str,url){
    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    //data = JSON.stringify({"record":content})
    xhr.send(str);
}

const button_up = document.querySelector('button.b_up');
const button_left = document.querySelector('button.b_left');
const button_down = document.querySelector('button.b_down');
const button_right = document.querySelector('button.b_right');
const url = '/drive/manual';

mov = {
  "none":"0",
  "forward":"1",
  "backward":"2",
  "right":"3",
  "left":"4"
}

button_up.addEventListener('mousedown', event => {
    senddata(mov.forward,url)
  });
button_up.addEventListener('mouseup', event => {
    senddata(mov.none,url)
  });

button_left.addEventListener('mousedown', event => {
    senddata(mov.left,url)
  });
button_left.addEventListener('mouseup', event => {
    senddata(mov.none,url)
  });

button_down.addEventListener('mousedown', event => {
    senddata(movemnet.down,url)
  });
button_down.addEventListener('mouseup', event => {
    senddata(mov.none,url)
  });

button_right.addEventListener('mousedown', event => {
  senddata(mov.right,url)
  });
button_right.addEventListener('mouseup', event => {
    senddata(mov.none,url)
  });




