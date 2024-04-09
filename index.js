const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
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

ipcMain.handle('convert-cert', async (event, { filePath, password, outputPath }) => {
    const baseName = path.basename(filePath, ".pfx");
    const certOutPath = path.join(outputPath, `${baseName}.crt`);
    const keyOutPath = path.join(outputPath, `${baseName}.key`);

    const certCommand = `openssl pkcs12 -in "${filePath}" -clcerts -nokeys -out "${certOutPath}" -passin pass:${password}`;
    const keyCommand = `openssl pkcs12 -in "${filePath}" -nocerts -out "${keyOutPath}" -nodes -passin pass:${password}`;

    try {
      await execPromise(certCommand);
      console.log(`Certificado CRT salvo em: ${certOutPath}`);

      await execPromise(keyCommand);
      console.log(`Chave privada KEY salva em: ${keyOutPath}`);

      dialog.showMessageBox({
        type: "info",
        title: "Conversão Concluída",
        message: `A conversão foi concluída com sucesso.\nCertificado: ${certOutPath}\nChave Privada: ${keyOutPath}`,
      });
    } catch (error) {
      console.error(`Erro ao converter certificado: ${error}`);
      dialog.showErrorBox(
        "Erro na Conversão",
        "Não foi possível converter o certificado. Verifique o console para mais detalhes."
      );
    }
  }
);

ipcMain.handle('ask-password', async (event) => {
  if (!win) {
    console.error('A janela não está definida.');
    return;
}
const result = await dialog.showMessageBox(win, {
  type: 'question',
  buttons: ['OK', 'Cancel'],
  title: 'Senha',
  message: 'Por favor, insira a senha para a conversão do certificado:',
  // Configure isso para coletar a entrada do usuário
});

  if (result.response) {
      return result.response; // Retorna a senha inserida
  } else {
      return ""; // Usuário cancelou a ação
  }
});

function execPromise(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(stdout ? stdout : stderr);
    });
  });
}
