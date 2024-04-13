const { exec } = require("child_process");
const path = require("path");
const os = require("os");

/**
 * Converte um arquivo PFX para arquivos CRT e KEY usando OpenSSL.
 * @param {string} pfxPath - Caminho do arquivo PFX.
 * @param {string} password - Senha do arquivo PFX.
 * @returns {Promise<Object>} Uma promessa que resolve com os caminhos dos arquivos CRT e KEY.
 */
function convertPFXtoCRTandKEY(pfxPath, password) {
  return new Promise((resolve, reject) => {
    const desktopDir = path.join(os.homedir(), "Desktop");
    const baseName = path.basename(pfxPath, ".pfx");
    const certOutPath = path.join(desktopDir, `${baseName}.crt`);
    const keyOutPath = path.join(desktopDir, `${baseName}.key`);

    const certCommand = `openssl pkcs12 -in "${pfxPath}" -clcerts -nokeys -out "${certOutPath}" -password pass:${password}`;
    exec(certCommand, (error) => {
      if (error) {
        reject(new Error(`Erro ao extrair certificado: ${error}`));
      } else {
        const keyCommand = `openssl pkcs12 -in "${pfxPath}" -nocerts -out "${keyOutPath}" -password pass:${password} -nodes`;
        exec(keyCommand, (error) => {
          if (error) {
            reject(new Error(`Erro ao extrair chave privada: ${error}`));
          } else {
            resolve({ certPath: certOutPath, keyPath: keyOutPath });
          }
        });
      }
    });
  });
}

module.exports = { convertPFXtoCRTandKEY };
