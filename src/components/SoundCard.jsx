import { useState, useRef, useEffect, useCallback } from "react";
import { FaCircleInfo } from "react-icons/fa6";
import { useAudio } from "../context/AudioContext.jsx";
import {
  extractDominantColor,
  getRgbaWithAlpha,
  getBrightness,
} from "../utils/imageUtils.js";

const SoundCard = ({ sound }) => {
  const imageRef = useRef(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [dominantColor, setDominantColor] = useState("rgb(0,0,0)");

  const { play, stop, setVolume, setFilter, getIsPlaying, getVolume } =
    useAudio();
  const isGeneratedSound = !sound.sound.includes(".");

  const isPlaying = getIsPlaying(sound.sound);
  const volume = getVolume(sound.sound);

  const handleImageLoad = useCallback(() => {
    const color = extractDominantColor(imageRef.current);
    if (color) setDominantColor(color);
  }, []);

  useEffect(() => {
    if (imageRef.current?.complete) handleImageLoad();
  }, [handleImageLoad]);

  const togglePlayback = () => {
    if (!isGeneratedSound) return;

    if (isPlaying) {
      stop(sound.sound);
    } else {
      play(sound.sound, volume);
      if (sound.sound === "airplane_cabin") {
        setFilter(sound.sound, { freq: 800, q: 1 });
      }
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(sound.sound, newVolume);

    if (sound.sound === "airplane_cabin") {
      const freq = 300 + newVolume * 1500;
      setFilter(sound.sound, { freq });
    }
  };

  const colorStart = getRgbaWithAlpha(dominantColor, 1);
  const colorMid = getRgbaWithAlpha(dominantColor, 0.6);
  const brightness = getBrightness(dominantColor);
  const isLight = brightness > 180;

  return (
    <div
      onClick={togglePlayback}
      className={`relative rounded-2xl overflow-hidden shadow-lg h-96 bg-cover bg-center cursor-pointer select-none ${
        isPlaying ? "ring-4 ring-info" : ""
      }`}
      style={{ backgroundImage: `url(${sound.image})` }}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowTooltip(!showTooltip);
        }}
        className="absolute top-3 right-3 text-light-primary bg-dark-primary/70 rounded-full p-1 hover:bg-dark-primary/90"
        aria-label="Show credits"
        type="button"
      >
        <FaCircleInfo size={18} />
      </button>

      {showTooltip && (
        <div className="absolute top-12 right-3 w-64 p-3 bg-dark-primary/90 text-light-primary text-sm rounded-2xl shadow-lg z-50">
          <p className="mb-1">
            <strong>Sound:</strong> {sound.sound_credits}
          </p>
          <p>
            <strong>Image:</strong> {sound.image_credits}
          </p>
        </div>
      )}

      <div
        className="absolute bottom-0 w-full p-4 h-32 flex items-end justify-start"
        style={{
          background: `linear-gradient(to top, ${colorStart}, ${colorMid}, transparent)`,
        }}
      >
        <h2
          className={`text-xl font-bold ${
            isLight ? "text-dark-primary" : "text-light-primary"
          }`}
        >
          {sound.name}
        </h2>
      </div>

      {isGeneratedSound && (
        <div
          className="absolute bottom-4 right-4 bg-dark-primary/50 backdrop-blur-sm px-2 rounded-2xl py-2 flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="w-6 mr-2 text-light-primary">
            {Math.round(volume * 100)}
          </span>
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
              background: `linear-gradient(to right, oklch(62.3% 0.214 259.815) ${
                volume * 100
              }%, oklch(55.3% 0.013 58.071) ${volume * 100}%)`,
              borderRadius: "999px",
              outline: "none",
              cursor: "pointer",
            }}
          />
        </div>
      )}

      <img
        ref={imageRef}
        src={sound.image}
        crossOrigin="anonymous"
        alt=""
        style={{ display: "none" }}
        onLoad={handleImageLoad}
      />
    </div>
  );
};

export default SoundCard;
