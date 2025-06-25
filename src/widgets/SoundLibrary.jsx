import { useEffect, useState, useRef } from "react";
import SoundCard from "./SoundCard.jsx";
import { SOUND_LIBRARY } from "../core/AppConstants.js";

const SoundLibrary = () => {
  const [library, setLibrary] = useState([]);
  const activeSoundsRef = useRef(new Map());

  useEffect(() => {
    fetch(SOUND_LIBRARY)
      .then((res) => res.json())
      .then((data) => {
        const libraryWithIds = data.library.map((sound, index) => ({
          ...sound,
          id: sound.id || `sound-${index}`,
        }));
        setLibrary(libraryWithIds);
      })
      .catch((err) => console.error("Error loading JSON:", err));
  }, []);

  const handleSoundChange = (soundState) => {
    if (soundState.isPlaying) {
      activeSoundsRef.current.set(soundState.id, soundState);
    } else {
      activeSoundsRef.current.delete(soundState.id);
    }
    if (
      window.electronAPI &&
      typeof window.electronAPI.updateTrayMenu === "function"
    ) {
      window.electronAPI.updateTrayMenu(
        Array.from(activeSoundsRef.current.values())
      );
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {library.map((sound) => (
        <SoundCard
          key={sound.id}
          sound={sound}
          onSoundChange={handleSoundChange}
        />
      ))}
    </div>
  );
};

export default SoundLibrary;
