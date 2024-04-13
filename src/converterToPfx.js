const { exec } = require("child_process");
const path = require("path");
const os = require("os");

/**
 * Converte arquivos CRT e KEY para um arquivo PFX usando OpenSSL.
 * @param {string} crtPath - Caminho do arquivo CRT.
 * @param {string} keyPath - Caminho do arquivo KEY.
 * @param {string} password - Senha para proteger o arquivo PFX.
 * @returns {Promise<string>} Uma promessa que resolve com o caminho do arquivo PFX.
 */
function convertCRTandKEYtoPFX(crtPath, keyPath, password) {
  return new Promise((resolve, reject) => {
    const desktopDir = path.join(os.homedir(), "Desktop");
    const baseName = path.basename(crtPath, ".crt");
    const pfxOutPath = path.join(desktopDir, `${baseName}.pfx`);

    const pfxCommand = `openssl pkcs12 -export -out "${pfxOutPath}" -inkey "${keyPath}" -in "${crtPath}" -password pass:${password}`;
    exec(pfxCommand, (error) => {
      if (error) {
        reject(new Error(`Erro ao criar PFX: ${error}`));
      } else {
        resolve(pfxOutPath);
      }
    });
  });
}

module.exports = { convertCRTandKEYtoPFX };
