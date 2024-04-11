const forge = require('node-forge');
const fs = require('fs');
const path = require('path');

// Função para converter PFX para CRT e KEY
async function convertPFXtoCRTandKEY(pfxPath, password) {
    // Ler o arquivo PFX
    const pfxFile = fs.readFileSync(pfxPath);
    const pfxAsn1 = forge.asn1.fromDer(pfxFile.toString('binary'));
    const pfx = forge.pkcs12.pkcs12FromAsn1(pfxAsn1, password);

    // Inicializar variáveis para armazenar o certificado e a chave
    let certPem = '';
    let keyPem = '';

    // Iterar sobre os safeContents (contêineres) no PFX
    for (const safeContents of pfx.safeContents) {
        for (const safeBag of safeContents.safeBags) {
            // Extrair o certificado
            if (safeBag.cert) {
                certPem += forge.pki.certificateToPem(safeBag.cert);
            }
            // Extrair a chave privada
            if (safeBag.key) {
                keyPem += forge.pki.privateKeyToPem(safeBag.key);
            }
        }
    }

    // Caminhos de saída para os arquivos CRT e KEY
    const baseName = path.basename(pfxPath, ".pfx");
    const certOutPath = path.join(__dirname, `${baseName}.crt`);
    const keyOutPath = path.join(__dirname, `${baseName}.key`);

    // Salvar o certificado e a chave nos arquivos correspondentes
    fs.writeFileSync(certOutPath, certPem);
    fs.writeFileSync(keyOutPath, keyPem);

    console.log(`Certificado CRT salvo em: ${certOutPath}`);
    console.log(`Chave privada KEY salva em: ${keyOutPath}`);
}

module.exports = { convertPFXtoCRTandKEY };

