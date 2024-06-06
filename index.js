const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const { convertPFXtoCRTandKEY } = require("./src/backend/converterToCrt");
const { convertCRTandKEYtoPFX } = require("./src/backend/converterToPfx");
const { isValidPFX, isValidCRT, isValidKEY } = require("./src/backend/validator");

let win;
let settingsWindow;
let passwordWindow;
let resolvePasswordPromise;

async function createStore() {
  const { default: Store } = await import('electron-store');
  return new Store();
}

async function createWindow() {
  const store = await createStore();

  win = new BrowserWindow({
    width: 700,
    height: 510,
    resizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js")
    },
    frame: false
  });

  win.loadFile("./src/frontend/html/index.html");

  win.on('maximize', () => {
    win.unmaximize();
  });

  win.on('will-resize', (event) => {
    event.preventDefault();
  });

  ipcMain.handle('select-directory', async (event) => {
    const result = await dialog.showOpenDialog(win, {
      properties: ['openDirectory']
    });
    if (result.filePaths.length > 0) {
      store.set('saveDirectory', result.filePaths[0]);
    }
    return result.filePaths[0];
  });

  ipcMain.handle("get-save-directory", async (event) => {
    return store.get('saveDirectory') || null;
  });

ipcMain.handle("convert-cert", async (event, { type, data }) => {
    try {
        const saveDirectory = store.get('saveDirectory') || app.getPath('documents');

        if (type === "PFXtoCRTandKEY") {
            if (!isValidPFX(data.filePath, data.password)) {
                throw new Error("Senha Inválida");
            }
            return await convertPFXtoCRTandKEY(data.filePath, data.password, saveDirectory);
        } else if (type === "CRTandKEYtoPFX") {
            if (!isValidCRT(data.crtPath) || !isValidKEY(data.keyPath)) {
                throw new Error("Certificado Inválido");
            }
            return await convertCRTandKEYtoPFX(data.crtPath, data.keyPath, data.password, saveDirectory);
        }
    } catch (error) {
        console.error("Erro na conversão:", error);
        if (error.message.includes("Invalid password")) {
            throw new Error("Senha Inválida");
        } else {
            throw new Error(error.message);
        }
    }
});



  ipcMain.handle("check-file-validity", async (event, { filePath, conversionType, password }) => {
    try {
      let isValid = false;
      if (conversionType === "PFXtoCRTandKEY") {
        isValid = isValidPFX(filePath, password);
      } else if (conversionType === "CRTandKEYtoPFX") {
        if (filePath.endsWith(".crt")) {
          isValid = isValidCRT(filePath);
        } else if (filePath.endsWith(".key")) {
          isValid = isValidKEY(filePath);
        }
      }
      return { isValid };
    } catch (error) {
      console.error("Erro na validação do arquivo:", error);
      return { isValid: false };
    }
  });
}

function createSettingsWindow() {
  settingsWindow = new BrowserWindow({
    width: 700,
    height: 510,
    resizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js")
    },
    parent: win,
    modal: true,
    show: false,
    frame: false
  });

  settingsWindow.loadFile("./src/frontend/html/settings.html");

  settingsWindow.on('maximize', () => {
    settingsWindow.unmaximize();
  });

  settingsWindow.on('will-resize', (event) => {
    event.preventDefault();
  });

  settingsWindow.once("ready-to-show", () => {
    settingsWindow.show();
  });

  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });
}

function createPasswordWindow(conversionType) {
  passwordWindow = new BrowserWindow({
    width: 400,
    height: 300,
    resizable: false,
    modal: true,
    parent: win,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
    frame: false // Remove a barra do Windows
  });

  passwordWindow.loadFile("./src/frontend/html/password.html");
  
  passwordWindow.on('maximize', () => {
    passwordWindow.unmaximize();
  });

  passwordWindow.on('will-resize', (event) => {
    event.preventDefault();
  });

  passwordWindow.webContents.once("did-finish-load", () => {
    passwordWindow.webContents.send("set-conversion-type", conversionType);
  });

  passwordWindow.on("closed", () => {
    passwordWindow = null;
  });
}

ipcMain.handle("ask-password", async (event, conversionType) => {
  createPasswordWindow(conversionType);
  return new Promise((resolve) => {
    resolvePasswordPromise = resolve;
  });
});

ipcMain.on("password-submitted", (event, password) => {
  if (passwordWindow) {
    passwordWindow.close();
    passwordWindow = null;
  }
  if (resolvePasswordPromise) {
    resolvePasswordPromise(password);
  }
});

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

ipcMain.on("open-settings", () => {
  if (!settingsWindow) {
    createSettingsWindow();
  } else {
    settingsWindow.show();
  }
});

ipcMain.on("minimize-window", (event) => {
  if (BrowserWindow.getFocusedWindow() === settingsWindow) {
    settingsWindow.minimize();
  } else {
    win.minimize();
  }
});

ipcMain.on("close-window", (event) => {
  if (BrowserWindow.getFocusedWindow() === settingsWindow) {
    settingsWindow.close();
  } else {
    win.close();
  }
});
