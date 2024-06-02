const forge = require("node-forge");
const fs = require("fs");

function isValidPFX(filePath, password = null) {
  try {
    const pfxFile = fs.readFileSync(filePath);
    const pfxAsn1 = forge.asn1.fromDer(pfxFile.toString("binary"));
    forge.pkcs12.pkcs12FromAsn1(pfxAsn1, password);
    return true;
  } catch (error) {
    // Se o erro for devido à ausência da senha, consideramos o arquivo válido
    if (error.message.includes("Invalid password") || error.message.includes("Too few bytes to parse DER")) {
      console.warn("PFX validation warning: Password required, treating as valid");
      return true;
    }
    console.error("PFX validation error:", error);
    return false;
  }
}

function isValidCRT(filePath) {
  try {
    const crtFile = fs.readFileSync(filePath, "utf8");
    forge.pki.certificateFromPem(crtFile);
    return true;
  } catch (error) {
    console.error("CRT validation error:", error);
    return false;
  }
}

function isValidKEY(filePath) {
  try {
    const keyFile = fs.readFileSync(filePath, "utf8");
    forge.pki.privateKeyFromPem(keyFile);
    return true;
  } catch (error) {
    console.error("KEY validation error:", error);
    return false;
  }
}

module.exports = { isValidPFX, isValidCRT, isValidKEY };
