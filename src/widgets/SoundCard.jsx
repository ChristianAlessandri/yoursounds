import { useState, useRef, useEffect } from "react";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { Howl, Howler } from "howler";

const SoundCard = ({ sound }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef(null);
  const howlerRef = useRef(null);
  const audioContextRef = useRef(null);
  const gainNodeRef = useRef(null);
  const noiseNodeRef = useRef(null);

  const createNoiseAudio = (type) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext ||
          window.webkitAudioContext)();
      }

      const audioContext = audioContextRef.current;

      if (audioContext.state === "suspended") {
        audioContext.resume();
      }

      const bufferSize = audioContext.sampleRate * 2;
      const noiseBuffer = audioContext.createBuffer(
        1,
        bufferSize,
        audioContext.sampleRate
      );
      const output = noiseBuffer.getChannelData(0);

      // Generazione diversa in base al tipo
      if (type === "white") {
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }
      } else if (type === "pink") {
        let b0 = 0,
          b1 = 0,
          b2 = 0,
          b3 = 0,
          b4 = 0,
          b5 = 0,
          b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.969 * b2 + white * 0.153852;
          b3 = 0.8665 * b3 + white * 0.3104856;
          b4 = 0.55 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.016898;
          output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
          output[i] *= 0.11;
          b6 = white * 0.115926;
        }
      } else if (type === "brown") {
        let lastOut = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5;
        }
      }

      const source = audioContext.createBufferSource();
      source.buffer = noiseBuffer;
      source.loop = true;

      const gainNode = audioContext.createGain();
      gainNode.gain.value = volume;

      source.connect(gainNode);
      gainNode.connect(audioContext.destination);

      noiseNodeRef.current = source;
      gainNodeRef.current = gainNode;

      return source;
    } catch (error) {
      console.error("Errore nella creazione del noise:", error);
      return null;
    }
  };

  const createHowlInstance = () => {
    return new Howl({
      src: [sound.sound],
      loop: true,
      volume: volume,
    });
  };

  const handleCardClick = async () => {
    const isGeneratedSound = !sound.sound.includes(".");

    if (isGeneratedSound) {
      if (isPlaying) {
        if (noiseNodeRef.current) {
          try {
            noiseNodeRef.current.stop();
            noiseNodeRef.current = null;
            setIsPlaying(false);
          } catch (error) {
            console.error("Error in stopping sound:", error);
          }
        }
      } else {
        // Start sound
        const noiseType =
          sound.sound === "white"
            ? "white"
            : sound.sound === "pink"
            ? "pink"
            : sound.sound === "brown"
            ? "brown"
            : "white";
        const noiseSource = createNoiseAudio(noiseType);
        if (noiseSource) {
          try {
            noiseSource.start();
            setIsPlaying(true);

            noiseSource.onended = () => {
              setIsPlaying(false);
            };
          } catch (error) {
            console.error("Error in starting noise:", error);
          }
        }
      }
    } else {
      if (!howlerRef.current) {
        howlerRef.current = createHowlInstance();
      }

      if (isPlaying) {
        howlerRef.current.pause();
        setIsPlaying(false);
      } else {
        howlerRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);

    const isGeneratedSound = !sound.sound.includes(".");

    if (isGeneratedSound) {
      if (gainNodeRef.current) {
        gainNodeRef.current.gain.value = newVolume;
      }
    } else {
      if (howlerRef.current) {
        howlerRef.current.volume(newVolume);
      }
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (howlerRef.current) {
        howlerRef.current.unload();
      }

      if (noiseNodeRef.current) {
        try {
          noiseNodeRef.current.stop();
        } catch (error) {}
      }

      // Cleanup AudioContext
      if (
        audioContextRef.current &&
        audioContextRef.current.state !== "closed"
      ) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <div
      onClick={handleCardClick}
      className={`relative rounded-2xl overflow-hidden shadow-lg h-96 bg-cover bg-center cursor-pointer select-none
        ${isPlaying ? "ring-4 ring-info" : ""}
      `}
      style={{ backgroundImage: `url(${sound.image})` }}
    >
      {/* Info icon */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowTooltip(!showTooltip);
        }}
        className="absolute top-3 right-3 text-light-primary bg-dark-primary/70 rounded-full p-1 hover:bg-dark-primary/90 focus:outline-none"
        aria-label="Show credits"
        type="button"
      >
        <AiOutlineInfoCircle size={18} />
      </button>

      {/* Credits tooltip */}
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

      {/* Gradient + title */}
      <div className="absolute bottom-0 w-full p-4 bg-gradient-to-t from-dark-primary/80 via-dark-primary/40 to-transparent">
        <h2 className="text-light-primary text-xl font-bold">{sound.name}</h2>
      </div>

      {/* Volume slider */}
      <div
        className="absolute bottom-4 right-4 bg-dark-primary/50 backdrop-blur-sm px-2 rounded-2xl py-2 flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
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
            background: `linear-gradient(to right, oklch(62.3% 0.214 259.815) ${
              volume * 100
            }%, oklch(55.3% 0.013 58.071) ${volume * 100}%)`,
            borderRadius: "999px",
            outline: "none",
            cursor: "pointer",
          }}
        />
      </div>

      {/* Hidden audio element */}
      {sound.sound.includes(".") && (
        <audio
          ref={audioRef}
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
