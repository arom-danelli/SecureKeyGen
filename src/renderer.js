document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("fileInput");
  const fileSelect = document.getElementById("fileSelect");
  const fileDrop = document.getElementById("file-drop");
  const toPFXButton = document.getElementById("toPFXButton");
  const toCRTButton = document.getElementById("toCRTButton");
  const fileTypesText = document.getElementById("file-types");
  const selectedFileContainer = document.getElementById(
    "selectedFileContainer"
  );
  const selectedFileName = document.getElementById("selectedFileName");
  const removeFileButton = document.getElementById("removeFileButton");
  const convertButton = document.getElementById("convertButton");


  let currentConversionType = "PFXtoCRTandKEY";
  let selectedFiles = { crtFile: null, keyFile: null, pfxFile: null };

  function updateSelectedFilesDisplay() {
    const fileListElement = document.getElementById("fileList");
    fileListElement.innerHTML = ""; // Limpa a lista existente

    Object.values(selectedFiles).forEach((file) => {
      if (file) {
        // Verifica se o arquivo existe
        const fileElement = document.createElement("div");
        fileElement.textContent = file.name;
        fileListElement.appendChild(fileElement);
      }
    });
  }

  function handleFilesChange() {
    const files = Array.from(fileInput.files);

    // Limpar a seleção anterior
    selectedFiles = { crtFile: null, keyFile: null, pfxFile: null };

    // Atualizar com base no tipo de conversão
    if (currentConversionType === "PFXtoCRTandKEY") {
      selectedFiles.pfxFile = files.find((file) => file.name.endsWith(".pfx"));
    } else {
      selectedFiles.crtFile = files.find((file) => file.name.endsWith(".crt"));
      selectedFiles.keyFile = files.find((file) => file.name.endsWith(".key"));
    }
    updateSelectedFilesDisplay();
  }

  fileSelect.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", handleFilesChange);

  fileDrop.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.stopPropagation();
  });

  fileDrop.addEventListener("drop", (e) => {
    e.preventDefault();
    e.stopPropagation();
    fileInput.files = e.dataTransfer.files;
    handleFilesChange();
  });

  toPFXButton.addEventListener("click", () => {
    currentConversionType = "CRTandKEYtoPFX";
    fileTypesText.textContent = "*Arquivos aceitos: .CRT + .KEY";
    fileInput.accept = ".crt,.key";
    clearSelectedFiles();
  });

  toCRTButton.addEventListener("click", () => {
    currentConversionType = "PFXtoCRTandKEY";
    fileTypesText.textContent = "*Arquivos aceitos: .PFX";
    fileInput.accept = ".pfx"; // Define os tipos de arquivos aceitos
    clearSelectedFiles();
  });

  removeFileButton.addEventListener("click", () => {
    selectedFiles = { crtFile: null, keyFile: null, pfxFile: null };
    updateSelectedFilesDisplay();
  });

  convertButton.addEventListener("click", async () => {
    let canProceed = false;

    if (currentConversionType === "PFXtoCRTandKEY") {
      canProceed = !!selectedFiles.pfxFile;
    } else if (currentConversionType === "CRTandKEYtoPFX") {
      canProceed = !!selectedFiles.crtFile && !!selectedFiles.keyFile;
    }

    if (canProceed) {
      const password = await window.electronAPI.askPassword();
      if (password) {
        proceedWithConversion(
          currentConversionType,
          password,
          selectedFiles.pfxFile?.path,
          selectedFiles.crtFile?.path,
          selectedFiles.keyFile?.path
        );
      }
    } else {
      alert("Por favor, selecione os arquivos apropriados para conversão.");
    }
  });

  function clearSelectedFiles() {
    selectedFiles = { crtFile: null, keyFile: null, pfxFile: null };
    updateSelectedFilesDisplay();
  }

 
  async function proceedWithConversion(
    conversionType,
    password,
    pfxPath,
    crtPath,
    keyPath
  ) {
    try {
      let data = {};

      if (conversionType === "CRTandKEYtoPFX") {
        data = { crtPath, keyPath, password };
      } else if (conversionType === "PFXtoCRTandKEY") {
        data = { filePath: pfxPath, password };
      }

      const result = await window.electronAPI.convertCert({
        type: conversionType,
        data,
      });
      console.log("Conversão realizada com sucesso!", result);
    } catch (error) {
      console.error("Erro na conversão:", error);
      alert("Erro na conversão: " + error.message);
    }
  }
});
