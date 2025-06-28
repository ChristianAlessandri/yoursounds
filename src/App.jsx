import { Routes, Route } from "react-router-dom";
import SidebarNavigation from "./components/SidebarNavigation.jsx";
import Home from "./screens/Home.jsx";
import Settings from "./screens/Settings.jsx";
import "./App.css";

function App() {
  return (
    <div className="flex flex-row h-screen">
      <SidebarNavigation />
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
