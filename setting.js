const closeButton = document.getElementById("headerClose")
const setting = document.getElementById("setting")
const temSpan = document.getElementById("temSpan")
const temSliding = document.getElementById("temSliding")
const grayMask = document.getElementById("grayMask")
const temMText = document.getElementById("temMText")

closeButton.addEventListener('click', () => {
    ipcRenderer.send('close-setting');
});

(function mask(){
  const temSpanW = temSpan.offsetWidth
  const temSpanH = temSpan.offsetHeight
  grayMask.style.width = `${temSpanW}px`
  grayMask.style.height = `${temSpanH}px`
})();

(function temSlidingMain(){
  temSliding.addEventListener('input',function(){
    grayMask.style.visibility = "visible"
    temMText.style.visibility = "visible"
    temMText.innerText = temSliding.value
  })
  temSliding.addEventListener('change',function(){
    grayMask.style.visibility = "hidden"
    temMText.style.visibility = "hidden"
  })
})()

