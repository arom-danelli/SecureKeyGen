const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    selectDirectory: () => ipcRenderer.invoke('select-directory'),
    askPassword: () => {
      return new Promise((resolve) => {
        // A função de diálogo para pedir senha ainda precisa ser implementada
        const password = prompt("Por favor, insira a senha do certificado:");
        resolve(password);
      });
    },
    convertCert: (data) => ipcRenderer.invoke('convert-cert', data),
  });
