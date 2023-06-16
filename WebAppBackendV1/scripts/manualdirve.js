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

button_up.addEventListener('mousedown', event => {
    senddata("{up:1}\n",url)
  });
button_up.addEventListener('mouseup', event => {
    senddata("{up:0}\n",url)
  });

button_left.addEventListener('mousedown', event => {
    senddata("{left:1}\n",url)
  });
button_left.addEventListener('mouseup', event => {
    senddata("{left:0}\n",url)
  });

button_down.addEventListener('mousedown', event => {
    senddata("{down:1}\n",url)
  });
button_down.addEventListener('mouseup', event => {
    senddata("{down:0}\n",url)
  });

button_right.addEventListener('mousedown', event => {
  senddata("{right:1}\n",url)
  });
button_right.addEventListener('mouseup', event => {
    senddata("{right:0}\n",url)
  });




