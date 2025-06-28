import React, { useState, useEffect } from "react";

function Settings() {
  const [settings, setSettings] = useState({
    theme: "light",
    systemTray: true,
  });

  useEffect(() => {
    const loadSettings = async () => {
      const loadedSettings = await window.electronAPI.getSettings();
      setSettings(loadedSettings);
    };

    loadSettings();
  }, []);

  const handleThemeChange = async (e) => {
    const newTheme = e.target.value;
    const updatedSettings = { ...settings, theme: newTheme };
    setSettings(updatedSettings);
    await window.electronAPI.setSettings(updatedSettings);
  };

  const handleSystemTrayChange = async (e) => {
    const newSystemTray = e.target.checked;
    const updatedSettings = { ...settings, systemTray: newSystemTray };
    setSettings(updatedSettings);
    await window.electronAPI.setSettings(updatedSettings);
  };

  return (
    <div className="min-h-screen bg-light-secondary dark:bg-dark-secondary">
      <h1 className="text-3xl font-bold text-center p-6 text-dark-primary dark:text-light-primary">
        Settings
      </h1>
      <div className="p-4">
        <div className="mb-4">
          <label className="block text-dark-primary dark:text-light-primary text-lg font-medium mb-2">
            Theme
          </label>
          <div className="flex items-center space-x-4">
            <label htmlFor="theme-light" className="flex items-center">
              <input
                type="radio"
                id="theme-light"
                name="theme"
                value="light"
                checked={settings.theme === "light"}
                onChange={handleThemeChange}
                className="h-4 w-4 focus:ring-info border-neutral-300 rounded-full"
              />
              <span className="ml-2 text-dark-primary dark:text-light-primary">
                Light
              </span>
            </label>

            <label htmlFor="theme-dark" className="flex items-center">
              <input
                type="radio"
                id="theme-dark"
                name="theme"
                value="dark"
                checked={settings.theme === "dark"}
                onChange={handleThemeChange}
                className="h-4 w-4 focus:ring-info border-neutral-300 rounded-full"
              />
              <span className="ml-2 text-dark-primary dark:text-light-primary">
                Dark
              </span>
            </label>
          </div>
        </div>
        <div className="mb-4 flex items-center">
          <label
            htmlFor="system-tray-checkbox"
            className="mr-2 block text-dark-primary dark:text-light-primary text-lg font-medium"
          >
            System Tray
          </label>
          <input
            type="checkbox"
            id="system-tray-checkbox"
            checked={settings.systemTray}
            onChange={handleSystemTrayChange}
            className="h-4 w-4 focus:ring-info border-neutral-300"
          />
        </div>
      </div>
    </div>
  );
}

export default Settings;
