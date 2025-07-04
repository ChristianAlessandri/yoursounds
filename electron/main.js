import { app, BrowserWindow, Tray, Menu, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { updateLibraryWithDominantColors } from "./processSoundLibrary.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const settingsPath = path.join(__dirname, "../public/data/settings.json");

const readSettings = () => {
  try {
    const settingsData = fs.readFileSync(settingsPath, "utf-8");
    return JSON.parse(settingsData);
  } catch (error) {
    console.error("Error while reading settings.json:", error);
    return { theme: "light", systemTray: false };
  }
};

const writeSettings = (settings) => {
  try {
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), "utf-8");
  } catch (error) {
    console.error("Error while writing settings.json:", error);
  }
};

let tray = null;
let currentSettings = readSettings();

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
    title: "YourSounds",
    icon: path.join(__dirname, "../public/logos/yoursounds.png"),
  });

  // Development build
  win.loadURL("http://localhost:5173");

  // Production build
  // win.loadFile(path.join(__dirname, "../dist/index.html"));

  const settings = readSettings();

  win.on("close", (event) => {
    if (!app.isQuitting) {
      if (currentSettings.systemTray) {
        event.preventDefault();
        win.hide();
      } else {
        app.isQuitting = true;
        app.quit();
      }
    }
  });
};

app.whenReady().then(async () => {
  await updateLibraryWithDominantColors();
  createWindow();

  // Tray icon
  tray = new Tray(path.join(__dirname, "../public/logos/yoursounds.png"));

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

  ipcMain.handle("get-settings", () => {
    return readSettings();
  });

  ipcMain.on("set-settings", (event, newSettings) => {
    currentSettings = newSettings;
    writeSettings(newSettings);
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
