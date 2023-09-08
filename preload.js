/**
 * The preload script runs before. It has access to web APIs
 * as well as Electron's renderer process modules and some
 * polyfilled Node.js functions.
 *
 * https://www.electronjs.org/docs/latest/tutorial/sandbox
 */


window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
})

const { contextBridge, ipcRenderer} = require('electron');
contextBridge.exposeInMainWorld('ipcRenderer', ipcRenderer);

ipcRenderer.on("apikeyRecive",(event,apikey)=>{
  document.getElementById("input").value= apikey
})

document.addEventListener('dragstart', (event) => {
  event.preventDefault();
});

// 禁用拖放事件的默认行为
document.addEventListener('dragover', (event) => {
  event.preventDefault();
});

document.addEventListener('drop', (event) => {
  event.preventDefault();
});

preloadFonts();

function preloadFonts() {
  // 在这里预加载字体文件
  const fontPath = path.join(__dirname, './fonts/Howlimit-EawYe.ttf');
  const fontContent = fs.readFileSync(fontPath, 'base64');

  // 将预加载的字体内容传递给渲染进程
  contextBridge.exposeInMainWorld('preloadedFonts', {
    yourFont: fontContent,
  });
}




