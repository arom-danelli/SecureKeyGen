document.getElementById('convertButton').addEventListener('click', () => {
    const fileInput = document.getElementById('fileInput');
    if (fileInput.files.length === 0) {
        alert('Por favor, selecione um arquivo.');
        return;
    }
    const filePath = fileInput.files[0].path;
    
    const password = prompt('Por favor, insira a senha do certificado PFX:');
    if (!password) {
        alert('Senha é necessária para a conversão.');
        return;
    }
    
    ipcRenderer.invoke('select-directory').then(outputPath => {
        if (!outputPath) {
            alert('Nenhum diretório selecionado.');
            return;
        }
        
        ipcRenderer.invoke('convert-cert', { function: 'convertCert', filePath, password, outputPath }).then(() => {
            alert("Conversão concluída com sucesso!");
        }).catch(err => {
            console.error("Erro durante a conversão:", err);
            alert("Erro durante a conversão. Verifique o console para mais detalhes.");
        });
    });
});
