import { app, BrowserWindow, Tray, Menu, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let tray = null;

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      enableRemoteModule: false,
      sandbox: true,
    },
  });

  // Development build
  win.loadURL("http://localhost:5173");

  // Production build
  // win.loadFile(path.join(__dirname, "../dist/index.html"));

  win.on("close", (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      win.hide();
    }
  });
};

app.whenReady().then(() => {
  createWindow();

  // Tray icon
  tray = new Tray(path.join(__dirname, "icon.png"));

  // Crea un menu contestuale per il tray
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Show",
      click: () => {
        BrowserWindow.getAllWindows()[0].show();
      },
    },
    {
      label: "Exit",
      click: () => {
        app.isQuitting = true;
        app.quit();
      },
    },
  ]);
  tray.setToolTip("YourSound");
  tray.setContextMenu(contextMenu);

  tray.on("click", () => {
    const mainWindow = BrowserWindow.getAllWindows()[0];
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    // Do not exit completely on macOS if the app is in the background
    // app.quit(); // Comment out this line if you want the app to remain in the tray even after all windows are closed
  }
});

app.isQuitting = false;

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  } else {
    BrowserWindow.getAllWindows()[0].show();
  }
});

ipcMain.on("update-tray-menu", (event, activeSounds) => {
  const menuItems = activeSounds.map((sound) => ({
    label: `${sound.name} - Volume: ${Math.round(sound.volume * 100)}%`,
    enabled: false,
  }));

  const contextMenu = Menu.buildFromTemplate([
    ...menuItems,
    { type: "separator" },
    {
      label: "Show",
      click: () => {
        BrowserWindow.getAllWindows()[0].show();
      },
    },
    {
      label: "Exit",
      click: () => {
        app.isQuitting = true;
        app.quit();
      },
    },
  ]);
  tray.setContextMenu(contextMenu);
});
