const { app, BrowserWindow, Menu, Tray, ipcMain, ipcRenderer, screen, webContents } = require('electron')
const fs = require('fs');
const path = require('path')
const { PythonShell } = require('python-shell');

function startpy() {
  const pythonPath = './aicore/venv/Scripts/python.exe';
  const scriptPath = './aicore/app.py';
  const options = {
    pythonPath: pythonPath,
    pythonOptions: ['-u'],
    scriptPath: path.dirname(scriptPath)
  };
  // 调用py
  process.env.NODE_ENV = 'utf8';
  const pyShell = new PythonShell(path.basename(scriptPath), options);
  // 监听py输出
  pyShell.on('message', function (message) {
    console.log('她说——' + message)
    //const output = '她说——'+message;
    //console.log(iconv.decode(Buffer.from(output, 'binary'), 'cp936'))
  });

  // 监听Python脚本完成事件
  pyShell.end(function (err, code, signal) {
    if (err) throw err;
    console.log('Python脚本执行完成，退出码：', code);
  });
  ipcMain.on('startB', () => {
    pyShell.kill();
  });
}

/*const currentDir = __dirname;
const pythonFilePathRelative = '../elainaAI/app.py';
const pythonFilePath = `${currentDir}/${pythonFilePathRelative}`;
function startpy() {
  const pythonCommand = `${path.join("../elainaAI/venv", 'Scripts', 'python.exe')} ${pythonFilePathRelative}`;

  // 执行Python脚本并获取输出
  exec(pythonCommand, (error, stdout, stderr) => {
    if (error) {
      console.error(`执行Python脚本时出错: ${error.message}`);
      return;
    }

    // 获取Python脚本的输出并进行处理
    const output = stdout.trim();
   
    if (output === 'on') {
      console.log('麦克风已开启');
    } else if (output === 'off') {
      console.log('麦克风未开启或被禁用');
    } else {
      console.log('未知状态');
    }
    process.on('exit', () => {
      // 在Node.js进程退出时终止Python子进程
      if (pythonProcess && !pythonProcess.killed) {
        pythonProcess.kill();
      }
    });
  });
}*/

/*function checkMicrophoneStatus() {
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(function (stream) {
      console.log('麦克风已开启');
      stream.getTracks().forEach(track => track.stop());
    })
    .catch(function (error) {
      console.log('麦克风未开启或被禁用');
    });
}*/

function findApikey() {
  return new Promise((resolve, reject) => {
    fs.readFile('config.json', 'utf8', (err, data) => {
      if (err) {
        console.error('读取文件失败:', err);
        reject(err);
      } else {
        // 将JSON字符串解析为对象
        const jsonData = JSON.parse(data);
        resolve(jsonData.OPENAI_API_KEY);
      }
    });
  });
}
let WindowMain;
async function inputApikey(WindowMain) {
  try {
    // 等待获取 API key
    const apikey = await findApikey();
    console.log(apikey)
    WindowMain.webContents.send('apikeyRecive', apikey);
  } catch (error) {
    console.error('获取 API key 失败:', error);
  }
}

function writeJson(apikey) {
  fs.readFile('config.json', 'utf8', (err, data) => {
    if (err) {
      console.error('读取文件失败:', err);
      return;
    }

    // 将JSON字符串解析为对象
    const jsonData = JSON.parse(data);

    // 修改JSON对象中的数据
    jsonData.OPENAI_API_KEY = apikey;

    // 将修改后的JSON对象转换回JSON字符串
    const updatedData = JSON.stringify(jsonData, null, 2);

    // 将修改后的数据写回到文件
    fs.writeFile('config.json', updatedData, 'utf8', (err) => {
      if (err) {
        console.error('写入文件失败:', err);
        return;
      }
      console.log('文件修改成功！');
    });
  });
}

function createWindow() {
  //定义窗口
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      enableRemoteModule: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })
  //加载html
  mainWindow.loadFile('index.html')
  //Hook掉右键菜单
  mainWindow.hookWindowMessage(278, () => {
    mainWindow.setEnabled(false)
    setTimeout(() => {
      mainWindow.setEnabled(true)
    }, 100)
  })
  WindowMain = mainWindow
  inputApikey(WindowMain)
  //ipc接收关闭指令
  ipcMain.on('close-app', () => {
    app.quit();
  });
  ipcMain.on('mini-app', () => {
    mainWindow.minimize();
  });
  //ipc接收调用py指令
  ipcMain.on('startA', (event, apikeyV) => {
    writeJson(apikeyV);
    startpy();
  });
  //var apikey = findApikey()
  //mainWindow.webContents.send("apikeyRecive",apikey)
}
let settingnWindow = null;
function createSettingWindow() {
  //定义窗口
  settingnWindow = new BrowserWindow({
    width: 600,
    height: 400,
    frame: false,
    backgroundColor: '#282c34',
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      enableRemoteModule: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })
  //加载html
  settingnWindow.loadFile('setting.html')
  //Hook掉右键菜单
  settingnWindow.hookWindowMessage(278, () => {
    settingnWindow.setEnabled(false)
    setTimeout(() => {
      settingnWindow.setEnabled(true)
    }, 100)
  })
  settingnWindow.on('closed', () => {
    settingnWindow = null;
  });
  //ipc接收关闭指令
  ipcMain.on('close-setting', () => {
    if (settingnWindow) {
      settingnWindow.close();
      settingnWindow =  null;
    }
  });
}
//创建任务栏图标
let tray = null
app.whenReady().then(() => {
  createWindow()
  ipcMain.on("settingMain", ()=>{
      createSettingWindow()
  })
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
  tray = new Tray('./resource/NBC.ico')
  const contextMenu = Menu.buildFromTemplate([
    { label: '伊', type: 'radio' },
    { label: '蕾', type: 'radio' },
    { label: '娜', type: 'radio', checked: true },
    { label: 'sama', type: 'radio' }
  ])
  tray.setToolTip('This is my application.')
  tray.setContextMenu(contextMenu)
})
//关闭
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})