document.addEventListener("DOMContentLoaded", () => {
    const changeSaveLocationButton = document.getElementById("changeSaveLocationButton");
    const changeColorButton = document.getElementById("changeColorButton");
  
    changeSaveLocationButton.addEventListener("click", async () => {
      const selectedDirectory = await window.electronAPI.selectDirectory();
      if (selectedDirectory) {
        console.log("Diretório selecionado:", selectedDirectory);
        // Salve o caminho do diretório em uma variável global ou localStorage
        localStorage.setItem('saveDirectory', selectedDirectory);
      }
    });
    
  
    document.getElementById('minimize-button').addEventListener('click', () => {
      window.electronAPI.minimizeWindow();
    });
  
    document.getElementById('close-button').addEventListener('click', () => {
      window.electronAPI.closeWindow();
    });
  
  
  });
  