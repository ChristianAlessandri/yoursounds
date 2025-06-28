import { useState, useRef, useEffect, useCallback } from "react";
import { FaCircleInfo } from "react-icons/fa6";
import { Howl } from "howler";
import {
  createNoiseAudio,
  stopNoise,
  setNoiseVolume,
  closeAudioContext,
  setFilterFrequency,
  setFilterQ,
} from "../utils/noiseGenerator.js";
import {
  extractDominantColor,
  getRgbaWithAlpha,
  getBrightness,
} from "../utils/imageUtils.js";

const SoundCard = ({ sound, onSoundChange }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [dominantColor, setDominantColor] = useState("rgb(0,0,0)");

  const howlerRef = useRef(null);
  const noiseRef = useRef({
    noiseNode: null,
    gainNode: null,
    filterNode: null,
  });
  const imageRef = useRef(null);

  const isGeneratedSound = !sound.sound.includes(".");

  useEffect(() => {
    if (onSoundChange) {
      onSoundChange({
        id: sound.name,
        name: sound.name,
        isPlaying: isPlaying,
        volume: volume,
      });
    }
  }, [isPlaying, volume, sound.id, sound.name, onSoundChange]);

  // Handle image loading to extract dominant color
  const handleImageLoad = useCallback(() => {
    const color = extractDominantColor(imageRef.current);
    if (color) {
      setDominantColor(color);
    }
  }, []);

  useEffect(() => {
    if (imageRef.current && imageRef.current.complete) {
      handleImageLoad();
    }
  }, [handleImageLoad]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (howlerRef.current) {
        howlerRef.current.unload();
      }
      stopNoise();
      closeAudioContext();
    };
  }, []);

  // Initialize Howl instance if it's a file-based sound
  const getHowlInstance = useCallback(() => {
    if (!howlerRef.current) {
      howlerRef.current = new Howl({
        src: [sound.sound],
        loop: true,
        volume: volume,
      });
    }
    return howlerRef.current;
  }, [sound.sound, volume]);

  // Toggle playback for both generated and file-based sounds
  const togglePlayback = async () => {
    if (isGeneratedSound) {
      if (isPlaying) {
        stopNoise();
        setIsPlaying(false);
      } else {
        const noiseType = sound.sound;
        const { noiseNode, gainNode, filterNode } = createNoiseAudio(
          noiseType,
          volume
        );

        if (noiseNode) {
          noiseRef.current = { noiseNode, gainNode, filterNode };

          if (noiseType === "airplane_cabin" && filterNode) {
            setFilterFrequency(800);
            setFilterQ(1);
          }

          try {
            noiseNode.start();
            setIsPlaying(true);
            noiseNode.onended = () => {
              setIsPlaying(false);
            };
          } catch (error) {
            console.error("Error starting noise:", error);
          }
        }
      }
    } else {
      const howlerInstance = getHowlInstance();
      if (isPlaying) {
        howlerInstance.pause();
        setIsPlaying(false);
      } else {
        howlerInstance.play();
        setIsPlaying(true);
      }
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);

    if (isGeneratedSound) {
      setNoiseVolume(newVolume);
      if (sound.sound === "airplane_cabin") {
        const freq = 300 + newVolume * 1500;
        setFilterFrequency(freq);
      }
    } else {
      if (howlerRef.current) {
        howlerRef.current.volume(newVolume);
      }
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
        className="absolute top-3 right-3 text-light-primary bg-dark-primary/70 rounded-full p-1 hover:bg-dark-primary/90 focus:outline-none"
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

      <img
        ref={imageRef}
        src={sound.image}
        crossOrigin="anonymous"
        alt=""
        style={{ display: "none" }}
        onLoad={handleImageLoad}
      />

      {sound.sound.includes(".") && (
        <audio
          src={sound.sound}
          loop
          preload="auto"
          style={{ display: "none" }}
        />
      )}
    </div>
  );
};

export default SoundCard;
