const { app, BrowserWindow, ipcMain} = require('electron')
const path = require('node:path')
const isPackaged = app.isPackaged
const sq3 = require('./database')

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

var mainWindow 

app.whenReady().then(() => {
    createMainWindow()  
    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
    })
  })

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

/**创建主窗口 */
const createMainWindow = () => {
  mainWindow = new BrowserWindow({
    frame:false,    
    fullscreenable:false,
    fullscreen: false,
    maximizable: false,
    shadow: true,
    hasShadow: true,
    resizable: false,
    width: 880,
    height: 500,
    webPreferences:{
      nodeIntegration:true,
      contextIsolation: true,     
      preload: path.join(__dirname, 'preload.js') 
    }
    
  })
  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  if (!isPackaged){
    mainWindow.loadURL("http://localhost:5173/index/index.html");
  }else{
    mainWindow.loadFile(path.resolve(__dirname, '../build/index/index.html'))
  }

  sq3.SQLiteInit()

}

/**主窗口最小化 */
ipcMain.on('minWindow', (e, data) => {
  mainWindow.minimize()
})
/**关闭主窗口 */
ipcMain.on('closeWindow', (e, data) => {
  mainWindow.close()
})

/**创建普通子窗口 */
const createOtherWindow = (data) => {  
  otherWindow = new BrowserWindow({
      height: data.height || 640,
      width: data.width || 480,
      center: true,
      frame:false,
      fullscreen:false,
      fullscreenable: false,
      closable: true,
      resizable: false,
      maximizable: false,
      webPreferences: {
        nodeIntegration: true,
        webSecurity: false,
        webviewTag: true,
        enableRemoteModule: true,
        nodeIntegrationInWorker: true,      
        nodeIntegrationInSubFrames: true,
        preload: path.join(__dirname, 'preload.js')      
      }
    
  })
  otherWindow.on('ready-to-show', () => {
    otherWindow.show()
  })

  if (!isPackaged){
    otherWindow.loadURL("http://localhost:5173/" + data.name +"/index.html");
  }else{
    otherWindow.loadFile(path.resolve(__dirname, '../build/' + data.name + '/index.html'))
  }

}

/**建立普通子窗口 */
ipcMain.on('createOtherWindow', (e, data) => {
  createOtherWindow(data)
})
/**关闭普通子窗口 */
ipcMain.on('closeOtherWindow', () => {
  otherWindow.close()
})

/**创建数据表 */
ipcMain.on('createTable', () => {
  sq3.createTable()
})

/**执行Sql */
ipcMain.on('runSql', async (e, arg) => {
  sq3.runSql(arg).then( res => {
    e.returnValue = {status:1,data:res}
  }).catch((err =>{
    e.returnValue = {status:0,error:err.message}
  }))
  
})