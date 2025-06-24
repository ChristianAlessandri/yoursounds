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

  // Funzione per creare white noise usando Web Audio API direttamente
  const createWhiteNoiseAudio = () => {
    try {
      // Crea un AudioContext se non esiste
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext ||
          window.webkitAudioContext)();
      }

      const audioContext = audioContextRef.current;

      // Assicurati che l'AudioContext sia attivo
      if (audioContext.state === "suspended") {
        audioContext.resume();
      }

      // Crea un buffer per il white noise
      const bufferSize = audioContext.sampleRate * 2; // 2 secondi
      const noiseBuffer = audioContext.createBuffer(
        1,
        bufferSize,
        audioContext.sampleRate
      );
      const output = noiseBuffer.getChannelData(0);

      // Riempie il buffer con rumore bianco
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      // Crea un BufferSource e collega tutto
      const whiteNoiseSource = audioContext.createBufferSource();
      whiteNoiseSource.buffer = noiseBuffer;
      whiteNoiseSource.loop = true;

      // Crea un GainNode per controllare il volume
      const gainNode = audioContext.createGain();
      gainNode.gain.value = volume;

      // Collega: source -> gain -> destination
      whiteNoiseSource.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Salva i riferimenti
      noiseNodeRef.current = whiteNoiseSource;
      gainNodeRef.current = gainNode;

      console.log(`Buffer audio per "${sound.name}" generato con successo`);
      return whiteNoiseSource;
    } catch (error) {
      console.error("Errore nella creazione del white noise:", error);
      return null;
    }
  };

  // Funzione per creare un Howl tradizionale (per file audio)
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
        const noiseSource = createWhiteNoiseAudio();
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

      if (howlerRef.current) {
        if (isPlaying) {
          howlerRef.current.pause();
        } else {
          howlerRef.current.play();
        }
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
