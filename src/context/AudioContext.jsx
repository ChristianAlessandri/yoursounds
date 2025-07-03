import { createContext, useContext, useRef, useState, useEffect } from "react";
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

  const play = (type, volume = 1) => {
    if (audioRefs.current[type]?.isPlaying) return;

    const { noiseNode, gainNode, filterNode } = createNoiseAudio(type, volume);
    if (noiseNode) {
      try {
        noiseNode.start();

        audioRefs.current[type] = {
          noiseNode,
          gainNode,
          filterNode,
          isPlaying: true,
        };

        setStates((prev) => ({
          ...prev,
          [type]: {
            isPlaying: true,
            volume,
          },
        }));
      } catch (error) {
        console.error("Error starting noise:", error);
      }
    }
  };

  const stop = (type) => {
    const nodes = audioRefs.current[type];
    if (nodes?.noiseNode) {
      try {
        nodes.noiseNode.stop();
        nodes.noiseNode.disconnect();
        nodes.gainNode?.disconnect();
        nodes.filterNode?.disconnect();
      } catch (e) {
        console.error("Error stopping sound:", e);
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
    const nodes = audioRefs.current[type];
    if (nodes?.gainNode) {
      nodes.gainNode.gain.setValueAtTime(
        volume,
        nodes.gainNode.context.currentTime
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
    const nodes = audioRefs.current[type];
    if (nodes?.filterNode) {
      if (freq !== undefined) setFilterFrequency(freq);
      if (q !== undefined) setFilterQ(q);
      if (filterType !== undefined) setFilterType(filterType);
    }
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
