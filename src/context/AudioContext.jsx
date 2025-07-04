import { createContext, useContext, useRef, useState, useEffect } from "react";
import { Howl } from "howler";
import {
  createNoiseAudio,
  closeAudioContext,
  setFilterFrequency,
  setFilterQ,
  setFilterType,
} from "../utils/noiseGenerator.js";

const AudioContextReact = createContext();
// eslint-disable-next-line react-refresh/only-export-components
export const useAudio = () => useContext(AudioContextReact);

export const AudioProvider = ({ children }) => {
  const audioRefs = useRef({});
  const [states, setStates] = useState({});

  const isGenerated = (type) => !type.includes(".");

  const play = (type, volume = 1) => {
    if (audioRefs.current[type]?.isPlaying) return;

    if (isGenerated(type)) {
      const { noiseNode, gainNode, filterNode } = createNoiseAudio(
        type,
        volume
      );
      if (noiseNode) {
        try {
          noiseNode.start();
          audioRefs.current[type] = {
            noiseNode,
            gainNode,
            filterNode,
            isPlaying: true,
            isHowl: false,
          };
        } catch (error) {
          console.error("Error starting noise:", error);
          return;
        }
      }
    } else {
      const howl = new Howl({
        src: [type],
        loop: true,
        volume,
        html5: true, // importante per Electron
      });

      howl.play();

      audioRefs.current[type] = {
        howl,
        isPlaying: true,
        isHowl: true,
      };
    }

    setStates((prev) => ({
      ...prev,
      [type]: {
        isPlaying: true,
        volume,
      },
    }));
  };

  const stop = (type) => {
    const ref = audioRefs.current[type];
    if (!ref) return;

    if (ref.isHowl) {
      ref.howl?.stop();
      ref.howl?.unload();
    } else {
      try {
        ref.noiseNode?.stop();
        ref.noiseNode?.disconnect();
        ref.gainNode?.disconnect();
        ref.filterNode?.disconnect();
      } catch (e) {
        console.error("Error stopping noise:", e);
      }
    }

    delete audioRefs.current[type];

    setStates((prev) => ({
      ...prev,
      [type]: {
        ...(prev[type] || {}),
        isPlaying: false,
      },
    }));
  };

  const setVolume = (type, volume) => {
    const ref = audioRefs.current[type];

    if (ref?.isHowl && ref.howl) {
      ref.howl.volume(volume);
    } else if (ref?.gainNode) {
      ref.gainNode.gain.setValueAtTime(
        volume,
        ref.gainNode.context.currentTime
      );
    }

    setStates((prev) => ({
      ...prev,
      [type]: {
        ...(prev[type] || {}),
        volume,
      },
    }));
  };

  const setFilter = (type, { freq, q, filterType }) => {
    const ref = audioRefs.current[type];
    if (!ref?.filterNode) return;
    if (freq !== undefined) setFilterFrequency(freq);
    if (q !== undefined) setFilterQ(q);
    if (filterType !== undefined) setFilterType(filterType);
  };

  const getIsPlaying = (type) => states[type]?.isPlaying || false;
  const getVolume = (type) => states[type]?.volume ?? 1;

  useEffect(() => {
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      Object.keys(audioRefs.current).forEach((type) => stop(type));
      closeAudioContext();
    };
  }, []);

  return (
    <AudioContextReact.Provider
      value={{
        play,
        stop,
        setVolume,
        setFilter,
        getIsPlaying,
        getVolume,
      }}
    >
      {children}
    </AudioContextReact.Provider>
  );
};
