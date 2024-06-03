const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  selectDirectory: () => ipcRenderer.invoke("select-directory"),
  getSaveDirectory: () => ipcRenderer.invoke("get-save-directory"),
  askPassword: (conversionType) => ipcRenderer.invoke("ask-password", conversionType),
  convertCert: (data) => ipcRenderer.invoke("convert-cert", data),
  checkFileValidity: (data) => ipcRenderer.invoke("check-file-validity", data),
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  closeWindow: () => ipcRenderer.send('close-window'),
  openSettings: () => ipcRenderer.send("open-settings"),
  closeSettings: () => ipcRenderer.send("close-settings"),
});
