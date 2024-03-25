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
    // Se um arquivo PFX foi selecionado, faça a conversão para CRT e KEY
    if (selectedFiles.pfxFile) {
      const password = await window.electronAPI.askPassword();
      if (!password) {
        alert('A senha é necessária para a conversão do arquivo PFX.');
        return;
      }

      // Implemente a conversão aqui, usando a senha fornecida e o arquivo PFX
      alert('Conversão de PFX para CRT e KEY não implementada ainda.');
      
      // Se os arquivos CRT e KEY foram selecionados, faça a conversão para PFX
    } else if (selectedFiles.crtFile && selectedFiles.keyFile) {
      // Implemente a conversão aqui
      alert('Conversão de CRT e KEY para PFX não implementada ainda.');

    } else {
      alert('Por favor, selecione um arquivo PFX ou ambos os arquivos CRT e KEY.');
    }
  });
});
