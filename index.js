const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const { convertPFXtoCRTandKEY } = require("./src/converter");

let resolvePasswordPromise;
let passwordWindow;
let win;

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.loadFile("src/index.html");
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Mantenha as funções ipcMain.handle e createPasswordWindow como estão


// Parte de criação da janela de senha em index.js
function createPasswordWindow() {
  passwordWindow = new BrowserWindow({
    width: 300,
    height: 200,
    modal: true,
    parent: win,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  });

  passwordWindow.loadFile("src/password.html");
  passwordWindow.on('closed', () => {
    passwordWindow = null;
  });
}

ipcMain.on("password-submitted", (event, password) => {
  if (passwordWindow) {
    passwordWindow.close();
    passwordWindow = null;
  }
  if (resolvePasswordPromise) {
    resolvePasswordPromise(password);
  }
});


ipcMain.handle("ask-password", async (event) => {
  createPasswordWindow();
  return new Promise((resolve) => {
    resolvePasswordPromise = resolve; // Armazenar a função resolve para uso posterior
  });
});

ipcMain.handle('convert-cert', async (event, { type, data }) => {
  if(type === "PFXtoCRTandKEY") {
    const { filePath, password } = data;
    console.log(filePath); // Adicione um log para verificar se o caminho está correto
    return convertPFXtoCRTandKEY(filePath, password);
  }
});

