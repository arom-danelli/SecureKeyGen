// Importação dos módulos necessários do Electron e dos scripts de conversão de certificados.
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { convertPFXtoCRTandKEY } = require("./src/converterToCrt");
const { convertCRTandKEYtoPFX } = require("./src/converterToPfx");

let win; // Variável para armazenar a janela principal da aplicação.
let passwordWindow; // Variável para a janela de diálogo de senha.
let resolvePasswordPromise; // Função para resolver a promessa de entrada de senha.

/**
 * Cria e configura a janela principal da aplicação.
 */
function createWindow() {
  // Configuração inicial da janela principal.
  win = new BrowserWindow({
    width: 800, // Largura da janela.
    height: 600, // Altura da janela.
    webPreferences: {
      nodeIntegration: false, // Desabilita integração direta de Node no renderer para segurança.
      contextIsolation: true, // Isola o contexto do renderer para prevenir manipulações maliciosas.
      preload: path.join(__dirname, "preload.js") // Caminho para o script preload, que pode expor APIs seguras ao renderer.
    },
  });

  // Carrega o arquivo HTML inicial que serve como interface do usuário.
  win.loadFile("src/index.html");
}

// Eventos do ciclo de vida da aplicação.

app.whenReady().then(createWindow); // Cria a janela assim que o Electron estiver pronto.

app.on("window-all-closed", () => {
  // Encerra a aplicação quando todas as janelas forem fechadas, exceto no macOS.
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // No macOS, recria uma janela na aplicação quando o ícone é clicado e não há outras janelas abertas.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

/**
 * Cria uma janela modal para a entrada de senha.
 */
function createPasswordWindow() {
  passwordWindow = new BrowserWindow({
    width: 300, // Largura da janela de senha.
    height: 200, // Altura da janela de senha.
    modal: true, // Define a janela como modal.
    parent: win, // Define a janela principal como parente.
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  });

  // Carrega o arquivo HTML para entrada de senha.
  passwordWindow.loadFile("src/password.html");
  // Quando a janela é fechada, limpa a referência à janela de senha.
  passwordWindow.on("closed", () => {
    passwordWindow = null;
  });
}

// IPC Event Handlers

ipcMain.on("password-submitted", (event, password) => {
  // Manipula a submissão da senha pela janela de senha.
  if (passwordWindow) {
    passwordWindow.close(); // Fecha a janela de senha.
    passwordWindow = null; // Limpa a referência à janela de senha.
  }
  if (resolvePasswordPromise) {
    resolvePasswordPromise(password); // Resolve a promessa com a senha fornecida.
  }
});

ipcMain.handle("ask-password", async (event) => {
  // Manipulador para solicitar a senha ao usuário.
  createPasswordWindow(); // Cria a janela de senha.
  return new Promise((resolve) => {
    resolvePasswordPromise = resolve; // Armazena a função resolve para uso futuro.
  });
});

ipcMain.handle("convert-cert", async (event, { type, data }) => {
  // Manipulador para realizar a conversão de certificados baseada no tipo especificado.
  try {
    if (type === "PFXtoCRTandKEY") {
      // Realiza a conversão de PFX para CRT e KEY.
      return await convertPFXtoCRTandKEY(data.filePath, data.password);
    } else if (type === "CRTandKEYtoPFX") {
      // Realiza a conversão de CRT e KEY para PFX.
      return await convertCRTandKEYtoPFX(data.crtPath, data.keyPath, data.password);
    }
  } catch (error) {
    // Captura e loga erros ocorridos durante a conversão.
    console.error("Erro na conversão:", error);
    throw error;
  }
});
