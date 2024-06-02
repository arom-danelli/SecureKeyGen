const forge = require("node-forge");
const fs = require("fs");
const path = require("path");

/**
 * Função assíncrona para converter arquivos PFX em arquivos CRT e KEY.
 * @param {string} pfxPath - Caminho para o arquivo PFX.
 * @param {string} password - Senha para desbloquear o arquivo PFX.
 * @param {string} saveDirectory - Diretório para salvar os arquivos convertidos.
 */
async function convertPFXtoCRTandKEY(pfxPath, password, saveDirectory) {
  const pfxFile = fs.readFileSync(pfxPath);
  const pfxAsn1 = forge.asn1.fromDer(pfxFile.toString("binary"));
  const pfx = forge.pkcs12.pkcs12FromAsn1(pfxAsn1, password);

  let certPem = "";
  let keyPem = "";

  for (const safeContents of pfx.safeContents) {
    for (const safeBag of safeContents.safeBags) {
      if (safeBag.cert) {
        certPem += forge.pki.certificateToPem(safeBag.cert);
      }
      if (safeBag.key) {
        keyPem += forge.pki.privateKeyToPem(safeBag.key);
      }
    }
  }

  const baseName = path.basename(pfxPath, ".pfx");
  const certOutPath = path.join(saveDirectory, `${baseName}.crt`);
  const keyOutPath = path.join(saveDirectory, `${baseName}.key`);

  fs.writeFileSync(certOutPath, certPem);
  fs.writeFileSync(keyOutPath, keyPem);

  console.log(`Certificado CRT salvo em: ${certOutPath}`);
  console.log(`Chave privada KEY salva em: ${keyOutPath}`);
}

module.exports = { convertPFXtoCRTandKEY };
