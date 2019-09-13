const electron = require('electron')
const path = require("path")
const url = require('url')

const { app,BrowserWindow,globalShortcut,dialog } = require('electron')
 
let mainWindow = null

const Menu = electron.Menu;
const Tray = electron.Tray;
const ipc = electron.ipcMain;

//托盘对象
var appTray = null;
var appQuit = false

function createWindow () {

  mainWindow = new BrowserWindow({
    minWidth: 780,
    minHeight: 560,
    width: 960, 
    height: 660,
    show: false,
    icon: path.join(__dirname, 'index.ico'),
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true,
      disableBlinkFeatures: "",
    },
  })
  //mainWindow.setMenu(null)
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))
  mainWindow.webContents.openDevTools();
 
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
  mainWindow.on('close',(e) => {  
    if(!appQuit){
      e.preventDefault();
      mainWindow.hide();
    } 
  });
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })


  var trayMenuTemplate = [
    {
      label: '显示主界面',
      click: function () { mainWindow.show(); mainWindow.focus();  }
    },
    {
      label: '退出',
      click: function () { 
        mainWindow.show(); 
        mainWindow.webContents.send('main-window-act', 'show-exit-dialog');
      }
    }
  ];
  const contextMenu = Menu.buildFromTemplate(trayMenuTemplate);

  appTray = new Tray(path.join(__dirname, 'index.ico'));
  appTray.setToolTip('Note and projects');
  appTray.setContextMenu(contextMenu);
  appTray.on('click',function(){
    mainWindow.show();
  })
}
 
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.

app.on('ready', function(){
  createWindow();
})
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})
 
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// Global ipcs
//

ipc.on('main-open-file-dialog-image', function (event, arg) {
  var properties = ['openFile'];
  dialog.showOpenDialog(mainWindow, {
    properties: properties,
    title: '选择图片文件',
    filters: [
      { name: '图像文件', extensions: ['bmp', 'jpg', 'png'] },
      { name: '所有文件', extensions: ['*'] }
    ],
  }, function (files) {
    if (files) event.sender.send('selected-image', arg, files)
  })
})
ipc.on('main-act-quit', function (event, arg) {
  appQuit = true; app.quit();
});
ipc.on('main-act-window-control', function (event, arg) {
  switch (arg) {
    case 'close': if (mainWindow) mainWindow.close(); break;
    case 'show': if (mainWindow) { mainWindow.show(); mainWindow.focus(); } break;
    case 'minimize': if (mainWindow) mainWindow.minimize(); break;
    case 'maximize': if (mainWindow) mainWindow.maximize(); break;
    case 'unmaximize': if (mainWindow) mainWindow.restore(); break;
    case 'switchDevTools': {
      if (mainWindow) {
        if(mainWindow.webContents.isDevToolsOpened()) mainWindow.webContents.openDevTools()
        else mainWindow.webContents.closeDevTools()
      }
      break;
    }
    case 'openProcessManager':if (mainWindow) ; break;
  }
});