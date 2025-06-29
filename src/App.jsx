import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import SidebarNavigation from "./components/SidebarNavigation.jsx";
import Home from "./screens/Home.jsx";
import Settings from "./screens/Settings.jsx";
import "./App.css";

function App() {
  useEffect(() => {
    const loadTheme = async () => {
      const settings = await window.electronAPI.getSettings();
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(settings.theme || "light");
    };
    loadTheme();
  }, []);

  return (
    <div className="flex flex-row h-screen">
      <SidebarNavigation />
      <div className="flex-grow overflow-y-auto">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
