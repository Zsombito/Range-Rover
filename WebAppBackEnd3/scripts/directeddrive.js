livemap = document.querySelector("canvas.livemap");
const ctx = livemap.getContext("2d");

function senddata(json,url){
    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    //data = JSON.stringify({"record":content})
    xhr.send(JSON.stringify(json));
}

const url = '/drive/directed';

function CursorPos(canvas, e){
  const rect = canvas.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  return {
      xcord : x,
      ycord : y
  }
};

livemap.addEventListener('click',e =>{
    senddata(CursorPos(livemap,e),url)
});