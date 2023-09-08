const closeButton = document.getElementById('headerClose');
const startButton = document.getElementById("startBtn")
const loading = document.getElementById("loading-element")
const input = document.getElementById("input")
const inputmain = document.getElementById("apikey-input")
const miniButton = document.getElementById("headerMini")
const setting = document.getElementById("setting")

closeButton.addEventListener('click', () => {
    ipcRenderer.send('close-app');
});

miniButton.addEventListener('click', () => {
    ipcRenderer.send('mini-app');
});

setting.addEventListener('click', () => {
    ipcRenderer.send('settingMain');
})

startButton.addEventListener('click', () => {
    if (startButton.innerText == "结束") {
        startButton.innerText = "开始"
        loading.style.visibility = "hidden"
        ipcRenderer.send('startB')
    }
    else {
        startButton.innerText = "结束"
        loading.style.visibility = "visible"
        var apikeyV = document.getElementById("input").value
        ipcRenderer.send('startA', apikeyV)

    }
});
/*
在渲染进程中使用预加载的字体
const { preloadedFonts } = window;

创建一个字体样式
const fontFace = `
      @font-face {
        font-family: 'YourFontName';
        src: url(data:font/ttf;base64,${preloadedFonts.yourFont}) format('truetype');
      }
    `;

将字体样式添加到文档头部
const styleTag = document.createElement('style');
styleTag.textContent = fontFace;
document.head.appendChild(styleTag);
*/
