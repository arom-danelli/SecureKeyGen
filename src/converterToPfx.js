const forge = require('node-forge');
const fs = require('fs');
const path = require('path');

/**
 * Função para converter arquivos CRT e KEY em um arquivo PFX.
 * @param {string} crtPath - Caminho para o arquivo CRT.
 * @param {string} keyPath - Caminho para o arquivo KEY.
 * @param {string} password - Senha para encriptar o arquivo PFX.
 * @param {string} saveDirectory - Diretório para salvar os arquivos convertidos.
 */
function convertCRTandKEYtoPFX(crtPath, keyPath, password, saveDirectory) {
  const crtPem = fs.readFileSync(crtPath, 'utf8');
  const keyPem = fs.readFileSync(keyPath, 'utf8');

  const cert = forge.pki.certificateFromPem(crtPem);
  const key = forge.pki.privateKeyFromPem(keyPem);

  const pfxAsn1 = forge.pkcs12.toPkcs12Asn1(key, [cert], password, { algorithm: '3des' });

  const pfxDer = forge.asn1.toDer(pfxAsn1).getBytes();
  const pfxBuffer = Buffer.from(pfxDer, 'binary');

  const baseName = path.basename(crtPath, ".crt");
  const pfxOutPath = path.join(saveDirectory, `${baseName}.pfx`);

  fs.writeFileSync(pfxOutPath, pfxBuffer);

  console.log(`Arquivo PFX salvo em: ${pfxOutPath}`);
}

module.exports = { convertCRTandKEYtoPFX };
