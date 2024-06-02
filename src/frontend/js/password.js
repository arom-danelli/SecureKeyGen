const { ipcRenderer } = require('electron');

document.addEventListener("DOMContentLoaded", () => {
  ipcRenderer.on("set-conversion-type", (event, conversionType) => {
    const titleElement = document.getElementById("password-title");
    const promptElement = document.getElementById("password-prompt");
    const additionalInfoElement = document.getElementById("additional-info");

    if (conversionType === "CRTandKEYtoPFX") {
      titleElement.textContent = "Adicionar Senha Nova";
      promptElement.textContent = "Nessa etapa, você pode adicionar uma senha para deixar seu arquivo mais seguro.";
      additionalInfoElement.textContent = "Se preferir, pode deixar sem senha.";
      additionalInfoElement.style.display = "block"; // Exibe o texto adicional
    } else if (conversionType === "PFXtoCRTandKEY") {
      titleElement.textContent = "Insira a Senha";
      promptElement.textContent = "Por favor, insira a senha do certificado PFX";
      additionalInfoElement.style.display = "none"; // Oculta o texto adicional
    }
  });

  document.getElementById("submit-button").addEventListener("click", () => {
    const password = document.getElementById("password").value;
    ipcRenderer.send("password-submitted", password);
  });

  document.getElementById('close-button').addEventListener('click', () => {
    window.close();
  });
});
