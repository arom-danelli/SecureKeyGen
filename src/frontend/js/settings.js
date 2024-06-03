document.addEventListener("DOMContentLoaded", () => {
    const changeSaveLocationButton = document.getElementById("changeSaveLocationButton");
  
    changeSaveLocationButton.addEventListener("click", async () => {
      const selectedDirectory = await window.electronAPI.selectDirectory();
      if (selectedDirectory) {
        console.log("Diretório selecionado:", selectedDirectory);
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
  