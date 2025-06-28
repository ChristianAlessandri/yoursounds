const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  updateTrayMenu: (activeSounds) =>
    ipcRenderer.send("update-tray-menu", activeSounds),
  getSettings: () => ipcRenderer.invoke("get-settings"),
  setSettings: (settings) => ipcRenderer.send("set-settings", settings),
});
