const forge = require('node-forge');
const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Função para converter arquivos CRT e KEY em um arquivo PFX.
 * @param {string} crtPath - Caminho para o arquivo CRT.
 * @param {string} keyPath - Caminho para o arquivo KEY.
 * @param {string} password - Senha para encriptar o arquivo PFX.
 */
function convertCRTandKEYtoPFX(crtPath, keyPath, password) {
  const crtPem = fs.readFileSync(crtPath, 'utf8');
  const keyPem = fs.readFileSync(keyPath, 'utf8');

  const cert = forge.pki.certificateFromPem(crtPem);
  const key = forge.pki.privateKeyFromPem(keyPem);

  const pfxAsn1 = forge.pkcs12.toPkcs12Asn1(key, [cert], password, { algorithm: '3des' });

  const pfxDer = forge.asn1.toDer(pfxAsn1).getBytes();
  const pfxBuffer = Buffer.from(pfxDer, 'binary');

  const desktopDir = path.join(os.homedir(), 'Desktop');
  const baseName = path.basename(crtPath, ".crt");
  const pfxOutPath = path.join(desktopDir, `${baseName}.pfx`);

  fs.writeFileSync(pfxOutPath, pfxBuffer);

  console.log(`Arquivo PFX salvo em: ${pfxOutPath}`);
}

module.exports = { convertCRTandKEYtoPFX };
