import "./App.css";
import SoundLibrary from "./widgets/SoundLibrary.jsx";

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold text-center p-6">Library</h1>
      <SoundLibrary />
    </div>
  );
}

export default App;
