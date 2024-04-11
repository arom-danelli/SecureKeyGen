document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("fileInput");
  const fileSelect = document.getElementById("fileSelect");
  const fileDrop = document.getElementById("file-drop");
  const convertButton = document.getElementById("convertButton");

  // Certifique-se de que selectedFiles é definido no escopo global do DOMContentLoaded
  let selectedFiles = { crtFile: null, keyFile: null, pfxFile: null };

  fileSelect.addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", function handleFiles() {
    const files = Array.from(this.files); // Converte FileList em Array
    selectedFiles.crtFile = files.find((file) => file.name.endsWith(".crt"));
    selectedFiles.keyFile = files.find((file) => file.name.endsWith(".key"));
    selectedFiles.pfxFile = files.find((file) => file.name.endsWith(".pfx"));

    const fileList = document.getElementById("fileList");
    fileList.innerHTML = Object.values(selectedFiles)
      .filter((file) => file !== undefined && file !== null)
      .map((file) => `<div>${file.name}</div>`)
      .join("");
  });

  fileDrop.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.stopPropagation();
  });

  fileDrop.addEventListener("drop", (e) => {
    e.preventDefault();
    e.stopPropagation();
    fileInput.files = e.dataTransfer.files;
    // Importante: chame handleFiles como uma arrow function para manter o contexto correto de 'this'
    handleFiles.call(fileInput);
  });

  convertButton.addEventListener("click", async () => {
    const password = await window.electronAPI.askPassword();
    if (password && selectedFiles.pfxFile) {
      // Verifica se o pfxFile existe
      proceedWithConversion(password, selectedFiles.pfxFile.path); // Passa o caminho como argumento
    } else {
      console.log(
        "Nenhuma senha fornecida ou arquivo PFX não selecionado. Conversão cancelada."
      );
    }
  });
});
const filePath = selectedFiles.pfxFile.path; // Supondo que selectedFiles.pfxFile é um objeto File

// Modificado para receber o caminho do arquivo diretamente
async function proceedWithConversion(password, filePath) {
  if (filePath) {
    // Verifica se filePath foi passado corretamente
    try {
      await window.electronAPI.convertCert({
        type: "PFXtoCRTandKEY",
        data: {
          filePath: filePath,
          password: password,
        },
      });
      console.log("Conversão realizada com sucesso!");
    } catch (error) {
      console.error("Erro na conversão:", error);
    }
  } else {
    console.log("Nenhum arquivo PFX selecionado.");
  }
}
