// Listener para o evento DOMContentLoaded, garantindo que o código só será executado após todo o conteúdo da página ser carregado.
document.addEventListener("DOMContentLoaded", () => {
  // Captura de elementos da interface através de seus IDs para manipulação posterior.
  const fileInput = document.getElementById("fileInput");
  const fileSelect = document.getElementById("fileSelect");
  const fileDrop = document.getElementById("file-drop");
  const toPFXButton = document.getElementById("toPFXButton");
  const toCRTButton = document.getElementById("toCRTButton");
  const fileTypesText = document.getElementById("file-types");
  const fileListElement = document.getElementById("fileList");

  // Estado inicial que define o tipo de conversão e os arquivos selecionados.
  let currentConversionType = "PFXtoCRTandKEY";
  let selectedFiles = { crtFile: null, keyFile: null, pfxFile: null };

  // Função para atualizar a lista de arquivos selecionados na interface do usuário.
  function updateSelectedFilesDisplay() {
    fileListElement.innerHTML = ""; // Limpa qualquer conteúdo anterior na lista de arquivos.
    Object.values(selectedFiles).forEach((file) => {
      if (file) {
        const fileElement = document.createElement("div");
        fileElement.textContent = file.name; // Define o nome do arquivo no elemento.
        fileListElement.appendChild(fileElement); // Adiciona o elemento à lista na interface.
      }
    });
  }

  // Função para manipular mudanças no input de arquivo (quando novos arquivos são selecionados).
  function handleFilesChange() {
    const files = Array.from(fileInput.files); // Converte a FileList em um array para facilitar a manipulação.
    selectedFiles = { crtFile: null, keyFile: null, pfxFile: null }; // Reseta os arquivos selecionados.

    // Define quais arquivos foram selecionados com base no tipo de conversão atual.
    if (currentConversionType === "PFXtoCRTandKEY") {
      selectedFiles.pfxFile = files.find((file) => file.name.endsWith(".pfx"));
    } else {
      selectedFiles.crtFile = files.find((file) => file.name.endsWith(".crt"));
      selectedFiles.keyFile = files.find((file) => file.name.endsWith(".key"));
    }
    updateSelectedFilesDisplay(); // Atualiza a visualização de arquivos selecionados.
  }

  // Evento que simula um clique no input de arquivo quando o botão correspondente é clicado.
  fileSelect.addEventListener("click", () => fileInput.click());

  // Adiciona listener para mudanças no input de arquivo.
  fileInput.addEventListener("change", handleFilesChange);

  // Adiciona funcionalidade de arrastar e soltar, preparando o evento para evitar comportamento padrão.
  fileDrop.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.stopPropagation();
  });

  // Processa arquivos soltos no elemento designado para isso.
  fileDrop.addEventListener("drop", (e) => {
    e.preventDefault();
    e.stopPropagation();
    fileInput.files = e.dataTransfer.files; // Atribui os arquivos arrastados diretamente ao input de arquivo.
    handleFilesChange(); // Manipula a mudança após a atribuição.
  });

  // Listeners para os botões que alternam o tipo de conversão, atualizando a interface conforme necessário.
  toPFXButton.addEventListener("click", () => {
    currentConversionType = "CRTandKEYtoPFX";
    fileTypesText.textContent = "*Arquivos aceitos: .CRT + .KEY";
    fileInput.accept = ".crt,.key";
    updateSelectedFilesDisplay();
  });

  toCRTButton.addEventListener("click", () => {
    currentConversionType = "PFXtoCRTandKEY";
    fileTypesText.textContent = "*Arquivos aceitos: .PFX";
    fileInput.accept = ".pfx";
    updateSelectedFilesDisplay();
  });

  // Listener para o botão de conversão, que inicia o processo se os arquivos apropriados estiverem selecionados.
  const convertButton = document.getElementById("convertButton");
  convertButton.addEventListener("click", async () => {
    let canProceed = currentConversionType === "PFXtoCRTandKEY" ? !!selectedFiles.pfxFile : !!selectedFiles.crtFile && !!selectedFiles.keyFile;
    if (canProceed) {
      const password = await window.electronAPI.askPassword(); // Solicita a senha através de uma API do Electron.
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

  // Função para executar a conversão de certificados após a coleta de todos os dados necessários.
  async function proceedWithConversion(conversionType, password, pfxPath, crtPath, keyPath) {
    try {
      let data = conversionType === "CRTandKEYtoPFX" ? { crtPath, keyPath, password } : { filePath: pfxPath, password };
      const result = await window.electronAPI.convertCert({ type: conversionType, data });
      console.log("Conversão realizada com sucesso!", result);
    } catch (error) {
      console.error("Erro na conversão:", error);
      alert("Erro na conversão: " + error.message);
    }
  }
});
