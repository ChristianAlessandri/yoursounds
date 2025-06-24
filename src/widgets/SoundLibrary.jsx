import { useEffect, useState } from "react";
import SoundCard from "./SoundCard.jsx";

const SoundLibrary = () => {
  const [library, setLibrary] = useState([]);

  useEffect(() => {
    fetch("/sound_library.json")
      .then((res) => res.json())
      .then((data) => setLibrary(data.library))
      .catch((err) => console.error("Error loading JSON:", err));
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {library.map((sound, index) => (
        <SoundCard key={index} sound={sound} />
      ))}
    </div>
  );
};

export default SoundLibrary;
