const { contextBridge, ipcRenderer } = require('electron')

console.log("[P]> Preload loaded")

contextBridge.exposeInMainWorld('electronAPI', {
  selectFolder: () => ipcRenderer.invoke('dialog:select-folder'),
  start: (filters) => ipcRenderer.invoke('core:start', filters),
  deleteCurrentFile: () => ipcRenderer.invoke('core:delete'),
  moveCurrentFile: () => ipcRenderer.invoke('core:move'),
  skipFile: () => ipcRenderer.invoke('core:skip'),
  openFile: () => ipcRenderer.invoke('dialog:open-file')
});