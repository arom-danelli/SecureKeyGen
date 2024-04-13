const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const { exec } = require("child_process"); 
const os = require("os");
const { convertPFXtoCRTandKEY } = require("./src/converterToCrt");
const { convertCRTandKEYtoPFX } = require("./src/converterToPfx");


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

app.on('ready', () => {
  checkOpenSSL(createWindow); 
});


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

function checkOpenSSL(callback) {
  exec("openssl version", (error) => {
    if (error) {
      console.log("OpenSSL não está instalado. Instalando...");
      installOpenSSL(callback);
    } else {
      console.log("OpenSSL já está instalado.");
      callback();
    }
  });
}


function installOpenSSL(callback) {
  // Detectar a arquitetura do sistema (32 ou 64 bits)
  const is64Bit = os.arch() === 'x64';
  // Ajustar o caminho para apontar para o local correto onde o instalador está localizado
  const installerPath = path.join(
    app.getAppPath(),
    "src",
    "assets",
    "OpenSSL",
    is64Bit ? "Win64OpenSSL_Light-3_3_0.exe" : "Win32OpenSSL_Light-3_3_0.exe"
  );

  exec(`"${installerPath}" /silent /verysilent /sp-`, (error) => {
    if (error) {
      console.error("Falha ao instalar OpenSSL:", error);
    } else {
      console.log("OpenSSL instalado com sucesso");
      callback();
    }
  });
}

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
  passwordWindow.on("closed", () => {
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
    resolvePasswordPromise = resolve;
  });
});

ipcMain.handle("convert-cert", async (event, { type, data }) => {
  try {
    if (type === "PFXtoCRTandKEY") {
      return await convertPFXtoCRTandKEY(data.filePath, data.password);
    } else if (type === "CRTandKEYtoPFX") {
      return await convertCRTandKEYtoPFX(data.crtPath, data.keyPath, data.password);
    }
  } catch (error) {
    console.error("Erro na conversão:", error);
    throw new Error(error);
  }
});
