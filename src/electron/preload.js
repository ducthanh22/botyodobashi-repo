const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('configAPI', {
  load: () => ipcRenderer.invoke('load-config'),
  save: (data) => ipcRenderer.invoke('save-config', data),
});

contextBridge.exposeInMainWorld('botAPI', {
  run: () => ipcRenderer.invoke('run-bot'),
});

contextBridge.exposeInMainWorld('stopBotAPI', {
  stop: () => ipcRenderer.invoke('stop-bot'),
});
contextBridge.exposeInMainWorld('deviceAPI', {
  register: (data) => ipcRenderer.invoke('register-device', data)
});

contextBridge.exposeInMainWorld('permissionAPI', {
  check: () => ipcRenderer.invoke('check-permission')
});
  
contextBridge.exposeInMainWorld('hookUserAPI', {
  check: (data) => ipcRenderer.invoke('hookcheck',data)
});