document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('fileInput');
  const fileSelect = document.getElementById('fileSelect');
  const fileDrop = document.getElementById('file-drop');
  const convertButton = document.getElementById('convertButton');
  let selectedFiles = { crtFile: null, keyFile: null, pfxFile: null };

  fileSelect.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', handleFiles, false);

  function handleFiles() {
    const files = this.files;
    selectedFiles.crtFile = [...files].find(file => file.name.endsWith('.crt'));
    selectedFiles.keyFile = [...files].find(file => file.name.endsWith('.key'));
    selectedFiles.pfxFile = [...files].find(file => file.name.endsWith('.pfx'));
  
    // Atualizar a interface do usuário
    const fileList = document.getElementById('fileList');
    fileList.innerHTML = ''; // Limpar a lista atual
    Object.values(selectedFiles).forEach(file => {
      if (file) {
        const listItem = document.createElement('div');
        listItem.textContent = file.name;
        fileList.appendChild(listItem);
      }
    });
  
    console.log('Arquivos selecionados:', selectedFiles);
  }

  fileDrop.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
  });

  fileDrop.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    fileInput.files = e.dataTransfer.files;
    handleFiles.call(fileInput);
  });

  convertButton.addEventListener('click', async () => {
    // Se os arquivos CRT e KEY foram selecionados, faça a conversão para PFX
    if (selectedFiles.crtFile && selectedFiles.keyFile) {
      const password = await window.electronAPI.askPassword();
      if (!password) {
        alert('A senha é necessária para a conversão do arquivo PFX.');
        return;
      }

      // Realizar a conversão para PFX
      convertCRTandKEYtoPFX(selectedFiles.crtFile, selectedFiles.keyFile, password)
        .then((pfxBlob) => {
          const pfxFile = new Blob([pfxBlob], { type: 'application/x-pkcs12' });
          const pfxUrl = URL.createObjectURL(pfxFile);

          // Faça algo com o arquivo PFX, como fazer o download ou exibir na tela
          const a = document.createElement('a');
          a.href = pfxUrl;
          a.download = 'certificate.pfx';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(pfxUrl);
        })
        .catch((error) => {
          console.error('Erro ao converter CRT e KEY para PFX:', error);
          alert('Erro ao converter CRT e KEY para PFX. Verifique o console para mais detalhes.');
        });
    } else {
      alert('Por favor, selecione ambos os arquivos CRT e KEY.');
    }
  });

  function convertCRTandKEYtoPFX(crtFile, keyFile, password) {
    // A implementação depende do seu ambiente e setup específico
    // Este é um pseudocódigo representando o processo de conversão
    return new Promise((resolve, reject) => {
      // Substitua este bloco pela sua lógica real de conversão usando BoringSSL/OpenSSL
      console.log("Conversão iniciada com:", {crtFile, keyFile, password});
      // Simulação de sucesso na conversão
      setTimeout(() => resolve("Dados do PFX simulados"), 1000);
    });
  }
});
