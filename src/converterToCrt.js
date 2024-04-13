const forge = require("node-forge");
const fs = require("fs");
const path = require("path");
const os = require('os');

/**
 * Função assíncrona para converter arquivos PFX em arquivos CRT e KEY.
 * @param {string} pfxPath - Caminho para o arquivo PFX.
 * @param {string} password - Senha para desbloquear o arquivo PFX.
 */
async function convertPFXtoCRTandKEY(pfxPath, password) {
  // Ler o arquivo PFX como buffer binário
  const pfxFile = fs.readFileSync(pfxPath);
  const pfxAsn1 = forge.asn1.fromDer(pfxFile.toString("binary"));
  const pfx = forge.pkcs12.pkcs12FromAsn1(pfxAsn1, password);

  let certPem = "";
  let keyPem = "";

  // Iterar sobre contêineres dentro do arquivo PFX para extrair certificados e chaves
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

  // Determinar caminhos de saída no desktop do usuário
  const baseName = path.basename(pfxPath, ".pfx");
  const desktopDir = path.join(os.homedir(), "Desktop");
  const certOutPath = path.join(desktopDir, `${baseName}.crt`);
  const keyOutPath = path.join(desktopDir, `${baseName}.key`);

  // Salvar os arquivos CRT e KEY
  fs.writeFileSync(certOutPath, certPem);
  fs.writeFileSync(keyOutPath, keyPem);

  console.log(`Certificado CRT salvo em: ${certOutPath}`);
  console.log(`Chave privada KEY salva em: ${keyOutPath}`);
}

module.exports = { convertPFXtoCRTandKEY };
