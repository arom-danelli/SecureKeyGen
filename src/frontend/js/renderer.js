document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("fileInput");
  const fileSelect = document.getElementById("fileSelect");
  const fileDrop = document.getElementById("file-drop");
  const toPFXButton = document.getElementById("toPFXButton");
  const toCRTButton = document.getElementById("toCRTButton");
  const fileListElement = document.getElementById("fileList");
  const fileListContainer = document.getElementById("fileListContainer");
  const convertButton = document.getElementById("convertButton");
  const feedbackMessage = document.getElementById("feedbackMessage");
  const conversionTypeText = document.getElementById("conversion-type-text");
  const fileTypesText = document.getElementById("file-types-text");

  let currentConversionType = "CRTandKEYtoPFX"; // Default is PFX conversion
  let selectedFiles = { crtFile: null, keyFile: null, pfxFile: null };

  async function checkSaveDirectory() {
    const saveDirectory = await window.electronAPI.getSaveDirectory();
    if (!saveDirectory) {
      return await window.electronAPI.selectDirectory();
    }
    return saveDirectory;
  }

  async function checkFileValidity(file, conversionType, password = null) {
    const result = await window.electronAPI.checkFileValidity({ filePath: file.path, conversionType, password });
    return result.isValid;
  }

  function setActiveConversionType(type) {
    currentConversionType = type;
    if (type === "PFXtoCRTandKEY") {
      toCRTButton.classList.add('active');
      toPFXButton.classList.remove('active');
      conversionTypeText.textContent = "Converter para CRT";
      fileTypesText.textContent = "É necessário adicionar UM arquivo: .PFX";
      fileInput.accept = ".pfx";
    } else if (type === "CRTandKEYtoPFX") {
      toPFXButton.classList.add('active');
      toCRTButton.classList.remove('active');
      conversionTypeText.textContent = "Converter para PFX";
      fileTypesText.textContent = "É necessário adicionar DOIS arquivos: .CRT + .KEY";
      fileInput.accept = ".crt,.key";
    }
    selectedFiles = { crtFile: null, keyFile: null, pfxFile: null }; // Limpar seleção de arquivos ao mudar o tipo de conversão
    updateSelectedFilesDisplay([]);
  }

  async function handleFilesChange() {
    const files = Array.from(fileInput.files);
    let newFiles = [];
    for (const file of files) {
      let isValid = false;
      if (currentConversionType === "PFXtoCRTandKEY" && file.name.endsWith(".pfx")) {
        isValid = await checkFileValidity(file, currentConversionType);
        selectedFiles.pfxFile = file;
      } else if (currentConversionType === "CRTandKEYtoPFX") {
        if (file.name.endsWith(".crt")) {
          isValid = await checkFileValidity(file, currentConversionType);
          selectedFiles.crtFile = file;
        } else if (file.name.endsWith(".key")) {
          isValid = await checkFileValidity(file, currentConversionType);
          selectedFiles.keyFile = file;
        }
      }
      newFiles.push({ file, isValid });
    }
    updateSelectedFilesDisplay(newFiles);
  }

  function createFileListItem(file, isValid, shouldAnimate = true, initialProgress = 0) {
    const fileItem = document.createElement("div");
    fileItem.className = "file-list-item";

    const fileIcon = document.createElement("img");
    fileIcon.src = "../../assets/icons/file_icon.svg";
    fileIcon.className = "file-icon";

    const fileName = document.createElement("span");
    fileName.className = "file-name";
    fileName.textContent = file.name;
    fileName.setAttribute("data-fullname", file.name); // Adiciona o nome completo como atributo de dados

    const progressContainer = document.createElement("div");
    progressContainer.className = "progress-container";

    const progressBar = document.createElement("div");
    progressBar.className = `progress-bar ${isValid ? '' : 'error'}`;
    progressBar.style.width = `${initialProgress}%`;

    progressContainer.appendChild(progressBar);

    const progressText = document.createElement("span");
    progressText.className = `progress-text ${isValid ? 'ok' : 'error'}`;
    progressText.textContent = `${initialProgress}%`;

    const removeButton = document.createElement("button");
    removeButton.className = "remove-button";
    removeButton.innerHTML = "&times;";
    removeButton.addEventListener("click", () => {
      removeFile(file);
    });

    fileItem.appendChild(fileIcon);
    fileItem.appendChild(fileName);
    fileItem.appendChild(progressContainer);
    fileItem.appendChild(progressText);
    fileItem.appendChild(removeButton);

    if (!isValid) {
      const invalidText = document.createElement("span");
      invalidText.textContent = "INVÁLIDO";
      invalidText.style.color = "#f44336";
      fileItem.appendChild(invalidText);
    }

    if (shouldAnimate) {
      setTimeout(() => {
        let progressValue = initialProgress;
        const interval = setInterval(() => {
          progressValue += 3.33; // Atualiza o valor do progresso
          progressText.textContent = `${Math.min(progressValue, 100).toFixed(0)}%`;
          progressBar.style.width = `${Math.min(progressValue, 100)}%`;
          if (progressValue >= 100) {
            clearInterval(interval);
            progressText.textContent = "100%"; // Mantém o texto como "100%"
            progressText.classList.add(isValid ? "ok" : "error");
            fileItem.classList.remove("loading");
            fileItem.classList.add("loaded");
          }
        }, 10); // Atualiza a cada 10ms para completar em 0,3 segundos
      }, 100); // Animação de 0,3 segundos para a barra de progresso
    } else {
      progressText.textContent = "100%"; // Mantém o texto como "100%"
      progressText.classList.add(isValid ? "ok" : "error");
      fileItem.classList.add("loaded");
    }

    return fileItem;
  }

  function updateSelectedFilesDisplay(newFiles) {
    fileListElement.innerHTML = "";
    newFiles.forEach(({ file, isValid }) => {
      const shouldAnimate = true;
      const initialProgress = 0;
      const fileItem = createFileListItem(file, isValid, shouldAnimate, initialProgress);
      fileListElement.appendChild(fileItem);
    });
    const hasFiles = newFiles.some(({ file }) => file);
    fileListContainer.classList.toggle("show", hasFiles);
    convertButton.style.display = hasFiles ? 'block' : 'none';
  }

  function removeFile(file) {
    if (currentConversionType === "PFXtoCRTandKEY" && selectedFiles.pfxFile === file) {
      selectedFiles.pfxFile = null;
    } else if (currentConversionType === "CRTandKEYtoPFX") {
      if (selectedFiles.crtFile === file) {
        selectedFiles.crtFile = null;
      } else if (selectedFiles.keyFile === file) {
        selectedFiles.keyFile = null;
      }
    }
    updateSelectedFilesDisplay([]);
    fileInput.value = ""; // Reseta o input de arquivos para permitir adicionar novamente
  }

  fileSelect.addEventListener("click", () => {
    fileInput.click();
  });

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
    setActiveConversionType("CRTandKEYtoPFX");
  });

  toCRTButton.addEventListener("click", () => {
    setActiveConversionType("PFXtoCRTandKEY");
  });

  convertButton.addEventListener("click", async () => {
    let canProceed =
      currentConversionType === "PFXtoCRTandKEY"
        ? !!selectedFiles.pfxFile
        : !!selectedFiles.crtFile && !!selectedFiles.keyFile;
    if (canProceed) {
      const saveDirectory = await checkSaveDirectory();
      if (!saveDirectory) {
        showFeedbackMessage("Conversão cancelada", "error");
        return;
      }

      const password = currentConversionType === "PFXtoCRTandKEY" ? await window.electronAPI.askPassword() : null;
      try {
        const isValid = currentConversionType === "PFXtoCRTandKEY" 
                        ? await checkFileValidity(selectedFiles.pfxFile, currentConversionType, password)
                        : true; // Não validar CRT e KEY aqui
        if (!isValid) {
          showFeedbackMessage("Certificado Inválido", "error");
          return;
        }

        // Solicitar senha para CRT + KEY para PFX
        const finalPassword = currentConversionType === "CRTandKEYtoPFX" ? await window.electronAPI.askPassword(currentConversionType) : password;
        
        proceedWithConversion(
          currentConversionType,
          finalPassword,
          selectedFiles.pfxFile?.path,
          selectedFiles.crtFile?.path,
          selectedFiles.keyFile?.path,
          saveDirectory
        );
      } catch (error) {
        showFeedbackMessage("Certificado Inválido", "error");
      }
    } else {
      alert("Por favor, selecione os arquivos apropriados para conversão.");
    }
  });

  async function proceedWithConversion(
    conversionType,
    password,
    pfxPath,
    crtPath,
    keyPath,
    saveDirectory
  ) {
    try {
      let data =
        conversionType === "CRTandKEYtoPFX"
          ? { crtPath, keyPath, password, saveDirectory }
          : { filePath: pfxPath, password, saveDirectory };
      const result = await window.electronAPI.convertCert({
        type: conversionType,
        data,
      });
      console.log("Conversão realizada com sucesso!", result);
      showFeedbackMessage("Conversão realizada com sucesso!", "success");
    } catch (error) {
      console.error("Erro na conversão:", error);
      showFeedbackMessage("Certificado Inválido", "error");
    }
  }

  function showFeedbackMessage(message, type) {
    fileListElement.innerHTML = ""; // Limpa a lista de arquivos
    feedbackMessage.textContent = message;
    feedbackMessage.className = "feedback-message " + type;
    feedbackMessage.style.display = "block";
    fileListContainer.style.height = "150px"; // Define a altura desejada
    convertButton.style.display = "none";
    setTimeout(() => {
      feedbackMessage.style.display = "none";
      // Restaura o estado inicial
      selectedFiles = { crtFile: null, keyFile: null, pfxFile: null };
      fileListContainer.style.height = "auto"; // Restaura a altura original
      updateSelectedFilesDisplay([]);
    }, 3000); // Ocultar mensagem após 3 segundos e restaurar estado inicial
  }

  document.getElementById('minimize-button').addEventListener('click', () => {
    window.electronAPI.minimizeWindow();
  });

  document.getElementById('close-button').addEventListener('click', () => {
    window.electronAPI.closeWindow();
  });

  document.getElementById('settings-icon').addEventListener('click', () => {
    window.electronAPI.openSettings();
  });

  // Inicialize o estado da conversão para PFX
  setActiveConversionType("CRTandKEYtoPFX");
});
