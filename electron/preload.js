const { contextBridge, ipcRenderer, shell } = require( "electron" );

contextBridge.exposeInMainWorld("electron", {
    ipcRenderer,
    shell // 暴露 shell 使项目可调用系统浏览器打开收藏夹网页 
})