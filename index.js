const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const { convertPFXtoCRTandKEY } = require("./src/converterToCrt");
const { convertCRTandKEYtoPFX } = require("./src/converterToPfx");

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
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js")
    },
    frame: false
  });

  win.loadFile("src/index.html");

  ipcMain.handle('select-directory', async (event) => {
    const result = await dialog.showOpenDialog(win, {
      properties: ['openDirectory']
    });
    if (result.filePaths.length > 0) {
      store.set('saveDirectory', result.filePaths[0]);
    }
    return result.filePaths[0];
  });

  ipcMain.handle("convert-cert", async (event, { type, data }) => {
    try {
      const saveDirectory = store.get('saveDirectory') || app.getPath('documents');
      if (type === "PFXtoCRTandKEY") {
        return await convertPFXtoCRTandKEY(data.filePath, data.password, saveDirectory);
      } else if (type === "CRTandKEYtoPFX") {
        return await convertCRTandKEYtoPFX(data.crtPath, data.keyPath, data.password, saveDirectory);
      }
    } catch (error) {
      console.error("Erro na conversão:", error);
      throw error;
    }
  });
}

function createSettingsWindow() {
  settingsWindow = new BrowserWindow({
    width: 700,
    height: 510,
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

  settingsWindow.loadFile("src/settings.html");
  settingsWindow.once("ready-to-show", () => {
    settingsWindow.show();
  });

  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });
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

ipcMain.on("open-settings", () => {
  if (!settingsWindow) {
    createSettingsWindow();
  } else {
    settingsWindow.show();
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
