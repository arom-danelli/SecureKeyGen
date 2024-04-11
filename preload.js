const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  selectDirectory: () => ipcRenderer.invoke("select-directory"),
  askPassword: () => ipcRenderer.invoke("ask-password"),
  convertCert: (data) => ipcRenderer.invoke("convert-cert", data),
  submitPassword: (password) => ipcRenderer.send('password-submitted', password), 
});
