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
    const result = await window.electronAPI.checkFileValidity({
      filePath: file.path,
      conversionType,
      password,
    });
    return result.isValid;
  }

  function setActiveConversionType(type) {
    currentConversionType = type;
    if (type === "PFXtoCRTandKEY") {
      toCRTButton.classList.add("active");
      toPFXButton.classList.remove("active");
      conversionTypeText.textContent = "Converter para CRT";
      fileTypesText.textContent = "É necessário adicionar UM arquivo: .PFX";
      fileInput.accept = ".pfx";
    } else if (type === "CRTandKEYtoPFX") {
      toPFXButton.classList.add("active");
      toCRTButton.classList.remove("active");
      conversionTypeText.textContent = "Converter para PFX";
      fileTypesText.textContent =
        "É necessário adicionar DOIS arquivos: .CRT + .KEY";
      fileInput.accept = ".crt,.key";
    }
    selectedFiles = { crtFile: null, keyFile: null, pfxFile: null }; // Limpar seleção de arquivos ao mudar o tipo de conversão
    updateSelectedFilesDisplay([]);
  }

  async function handleFilesChange() {
    const files = Array.from(fileInput.files);

    for (const file of files) {
      const { isValid } = await window.electronAPI.checkFileValidity({
        filePath: file.path,
        conversionType: currentConversionType,
      });

      if (
        currentConversionType === "PFXtoCRTandKEY" &&
        file.name.endsWith(".pfx")
      ) {
        selectedFiles.pfxFile = file;
      } else if (currentConversionType === "CRTandKEYtoPFX") {
        if (file.name.endsWith(".crt")) {
          selectedFiles.crtFile = file;
        } else if (file.name.endsWith(".key")) {
          selectedFiles.keyFile = file;
        }
      }
    }

    updateSelectedFilesDisplay(false);
  }

  function createFileListItem(file, isValid, animate) {
    const fileItem = document.createElement("div");
    fileItem.className = "file-list-item";

    const fileIcon = document.createElement("img");
    fileIcon.src = "../../assets/icons/file_icon.svg";
    fileIcon.className = "file-icon";

    const fileName = document.createElement("span");
    fileName.className = "file-name";
    fileName.textContent = file.name;
    fileName.setAttribute("data-fullname", file.name);

    const progressContainer = document.createElement("div");
    progressContainer.className = "progress-container";

    const progressBar = document.createElement("div");
    progressBar.className = `progress-bar ${isValid ? "" : "error"}`;

    const progressText = document.createElement("span");
    progressText.className = `progress-text ${isValid ? "ok" : "error"}`;

    if (animate) {
      progressBar.style.width = "0%";
      progressText.textContent = "0%";

      let progressValue = 0;
      const interval = setInterval(() => {
        progressValue += 10; // Incremento da barra de progresso
        progressBar.style.width = `${Math.min(progressValue, 100)}%`;
        progressText.textContent = `${Math.min(progressValue, 100).toFixed(
          0
        )}%`;
        if (progressValue >= 100) {
          clearInterval(interval);
          progressText.textContent = "100%";
          progressText.classList.add(isValid ? "ok" : "error");
          fileItem.classList.remove("loading");
          fileItem.classList.add("loaded");
        }
      }, 20); // Atualiza a cada 20ms para completar mais rápido
    } else {
      progressBar.style.width = "100%";
      progressText.textContent = "100%";
    }

    progressContainer.appendChild(progressBar);
    fileItem.appendChild(fileIcon);
    fileItem.appendChild(fileName);
    fileItem.appendChild(progressContainer);
    fileItem.appendChild(progressText);

    const removeButton = document.createElement("button");
    removeButton.className = "remove-button";
    removeButton.innerHTML = "&times;";
    removeButton.addEventListener("click", () => {
      removeFile(file);
    });

    fileItem.appendChild(removeButton);

    if (!isValid) {
      const invalidText = document.createElement("span");
      invalidText.textContent = "INVÁLIDO";
      invalidText.style.color = "#f44336";
      fileItem.appendChild(invalidText);
    }

    return fileItem;
  }

  function updateSelectedFilesDisplay(animate = true) {
    fileListElement.innerHTML = "";
    Object.values(selectedFiles).forEach((file) => {
      if (file) {
        const fileItem = createFileListItem(
          file,
          true,
          animate && !file.alreadyAdded
        );
        file.alreadyAdded = true; // Marca como já adicionado
        fileListElement.appendChild(fileItem);
      }
    });

    const hasFiles = Object.values(selectedFiles).some((file) => file !== null);
    fileListContainer.classList.toggle("show", hasFiles);
    convertButton.style.display = hasFiles ? "block" : "none";
  }

  async function handleFilesChange() {
    const files = Array.from(fileInput.files);

    for (const file of files) {
      const { isValid } = await window.electronAPI.checkFileValidity({
        filePath: file.path,
        conversionType: currentConversionType,
      });

      if (
        currentConversionType === "PFXtoCRTandKEY" &&
        file.name.endsWith(".pfx")
      ) {
        selectedFiles.pfxFile = file;
      } else if (currentConversionType === "CRTandKEYtoPFX") {
        if (file.name.endsWith(".crt")) {
          selectedFiles.crtFile = file;
        } else if (file.name.endsWith(".key")) {
          selectedFiles.keyFile = file;
        }
      }
    }

    updateSelectedFilesDisplay();
  }

  function removeFile(file) {
    if (
      currentConversionType === "PFXtoCRTandKEY" &&
      selectedFiles.pfxFile === file
    ) {
      selectedFiles.pfxFile = null;
    } else if (currentConversionType === "CRTandKEYtoPFX") {
      if (selectedFiles.crtFile === file) {
        selectedFiles.crtFile = null;
      } else if (selectedFiles.keyFile === file) {
        selectedFiles.keyFile = null;
      }
    }
    updateSelectedFilesDisplay(false);
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

      const password =
        currentConversionType === "PFXtoCRTandKEY"
          ? await window.electronAPI.askPassword()
          : null;
      try {
        const isValid =
          currentConversionType === "PFXtoCRTandKEY"
            ? await checkFileValidity(
                selectedFiles.pfxFile,
                currentConversionType,
                password
              )
            : true; // Não validar CRT e KEY aqui
        if (!isValid) {
          showFeedbackMessage("Certificado Inválido", "error");
          return;
        }

        // Solicitar senha para CRT + KEY para PFX
        const finalPassword =
          currentConversionType === "CRTandKEYtoPFX"
            ? await window.electronAPI.askPassword(currentConversionType)
            : password;

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

        // Resetar o estado após a conversão
        selectedFiles = { crtFile: null, keyFile: null, pfxFile: null };
        fileInput.value = ""; // Reseta o input de arquivos para permitir adicionar novamente
        setTimeout(() => {
            updateSelectedFilesDisplay(false); // Atualizar a lista de arquivos após a mensagem desaparecer
        }, 3000);
    } catch (error) {
        console.error("Erro na conversão:", error);
        if (error.message === "Senha Inválida") {
            showFeedbackMessage("Senha Inválida", "error");
        } else {
            showFeedbackMessage("Certificado Inválido", "error");
        }
    }
}




  function showFeedbackMessage(message, type) {
    feedbackMessage.textContent = message;
    feedbackMessage.className = "feedback-message " + type;
    feedbackMessage.style.display = "block";

    // Ocultar o conteúdo do fileListContainer
    fileListContainer.style.visibility = "hidden";
    convertButton.style.display = "none";

    setTimeout(() => {
      feedbackMessage.style.display = "none";
      fileListContainer.style.visibility = "visible"; // Restaurar a visibilidade
      updateSelectedFilesDisplay(false); // Atualizar a lista de arquivos após a mensagem desaparecer
    }, 3000); // Ocultar mensagem após 3 segundos e restaurar estado inicial
  }

  document.getElementById("minimize-button").addEventListener("click", () => {
    window.electronAPI.minimizeWindow();
  });

  document.getElementById("close-button").addEventListener("click", () => {
    window.electronAPI.closeWindow();
  });

  document.getElementById("settings-icon").addEventListener("click", () => {
    window.electronAPI.openSettings();
  });

  // Inicialize o estado da conversão para PFX
  setActiveConversionType("CRTandKEYtoPFX");
});
