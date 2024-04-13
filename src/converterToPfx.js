const { exec } = require("child_process");
const path = require("path");
const os = require("os");

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
