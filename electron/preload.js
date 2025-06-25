const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  updateTrayMenu: (activeSounds) =>
    ipcRenderer.send("update-tray-menu", activeSounds),
});
