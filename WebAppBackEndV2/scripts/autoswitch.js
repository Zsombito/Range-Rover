const a_switch = document.querySelector('#auto');
const b = document.querySelector('div.controlbuttons');
b.style.visibility = 'hidden';
url = "/drive"


function senddata(str,url){
  let xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  //data = JSON.stringify({"record":content})
  xhr.send(str);
}

a_switch.addEventListener('change', () => {
  if(a_switch.checked) {
   b.style.visibility = 'hidden';
   senddata("auto",url)
  } 
  else {
    b.style.visibility = 'visible';
    senddata("off",url)
  }
});