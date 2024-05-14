const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { convertPFXtoCRTandKEY } = require("./src/converterToCrt");
const { convertCRTandKEYtoPFX } = require("./src/converterToPfx");

let win;
let passwordWindow;
let resolvePasswordPromise;

function createWindow() {
  win = new BrowserWindow({
    width: 700,
    height: 510,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js")
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
    throw error;
  }
});
