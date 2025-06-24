import { useState, useRef, useEffect } from "react";
import { AiOutlineInfoCircle } from "react-icons/ai";

const SoundCard = ({ sound }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1); // 0 to 1
  const audioRef = useRef(null);

  // Toggle audio playback on card click
  const handleCardClick = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // Update volume when slider changes
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // Pause audio when component unmounts
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  return (
    <div
      onClick={handleCardClick}
      className={`relative rounded-2xl overflow-hidden shadow-lg h-96 bg-cover bg-center cursor-pointer select-none
        ${isPlaying ? "ring-4 ring-blue-500" : ""}
      `}
      style={{ backgroundImage: `url(${sound.image})` }}
    >
      {/* Info icon in top right */}
      <button
        onClick={(e) => {
          e.stopPropagation(); // prevent triggering card click
          setShowTooltip(!showTooltip);
        }}
        className="absolute top-3 right-3 text-white bg-black/50 rounded-full p-1 hover:bg-black/70 focus:outline-none"
        aria-label="Show credits"
        type="button"
      >
        <AiOutlineInfoCircle size={18} />
      </button>

      {/* Tooltip with credits */}
      {showTooltip && (
        <div className="absolute top-12 right-3 w-64 p-3 bg-black/90 text-white text-sm rounded-2xl shadow-lg z-50">
          <p className="mb-1">
            <strong>Sound:</strong> {sound.sound_credits}
          </p>
          <p>
            <strong>Image:</strong> {sound.image_credits}
          </p>
        </div>
      )}

      {/* Gradient + title */}
      <div className="absolute bottom-0 w-full p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
        <h2 className="text-white text-xl font-bold">{sound.name}</h2>
      </div>

      {/* Volume slider */}
      <div
        className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm px-2 rounded-2xl py-2 flex items-center justify-center"
        onClick={(e) => e.stopPropagation()} // prevent audio toggle
      >
        <span className="w-6 mr-2 text-white">{Math.round(volume * 100)}</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={handleVolumeChange}
          className="w-24"
          style={{
            height: "4px",
            appearance: "none",
            background: `linear-gradient(to right, #3b82f6 ${
              volume * 100
            }%, #888888 ${volume * 100}%)`,
            borderRadius: "999px",
            outline: "none",
            cursor: "pointer",
          }}
        />
      </div>

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={sound.sound}
        loop
        preload="auto"
        style={{ display: "none" }}
      />
    </div>
  );
};

export default SoundCard;
