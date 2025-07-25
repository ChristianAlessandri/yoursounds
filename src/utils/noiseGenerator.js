let audioContext = null;
let noiseSource = null;
let gainNode = null;
let filterNode = null;

const initializeAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
};

const generateWhiteNoise = (bufferSize) => {
  const output = new Float32Array(bufferSize);
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }
  return output;
};

const generatePinkNoise = (bufferSize) => {
  const output = new Float32Array(bufferSize);
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
    output[i] *= 0.11; // (roughly) compensate for gain
    b6 = white * 0.115926;
  }
  return output;
};

const generateBrownNoise = (bufferSize) => {
  const output = new Float32Array(bufferSize);
  let lastOut = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    output[i] = (lastOut + 0.02 * white) / 1.02;
    lastOut = output[i];
    output[i] *= 3.5; // (roughly) compensate for gain
  }
  return output;
};

const generateAirplaneCabinNoise = (bufferSize) => {
  return generatePinkNoise(bufferSize);
};

export const createNoiseAudio = (type, initialVolume) => {
  try {
    initializeAudioContext();
    const currentAudioContext = audioContext;

    const bufferSize = currentAudioContext.sampleRate * 2;
    const noiseBuffer = currentAudioContext.createBuffer(
      1,
      bufferSize,
      currentAudioContext.sampleRate
    );
    const output = noiseBuffer.getChannelData(0);

    switch (type) {
      case "white":
        output.set(
          generateWhiteNoise(bufferSize, currentAudioContext.sampleRate)
        );
        break;
      case "pink":
        output.set(generatePinkNoise(bufferSize));
        break;
      case "brown":
        output.set(generateBrownNoise(bufferSize));
        break;
      case "airplane_cabin":
        output.set(generateAirplaneCabinNoise(bufferSize));
        break;
      default:
        console.warn(`Unknown noise type: ${type}. Defaulting to white noise.`);
        output.set(
          generateWhiteNoise(bufferSize, currentAudioContext.sampleRate)
        );
        break;
    }

    const source = currentAudioContext.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    const currentGainNode = currentAudioContext.createGain();
    currentGainNode.gain.value = initialVolume;

    if (type === "airplane_cabin") {
      const biquadFilter = currentAudioContext.createBiquadFilter();
      biquadFilter.type = "lowpass";
      biquadFilter.frequency.value = 800;
      biquadFilter.Q.value = 1;

      source.connect(biquadFilter);
      biquadFilter.connect(currentGainNode);
      filterNode = biquadFilter;
    } else {
      source.connect(currentGainNode);
    }

    currentGainNode.connect(currentAudioContext.destination);

    noiseSource = source;
    gainNode = currentGainNode;

    return { noiseNode: noiseSource, gainNode, filterNode };
  } catch (error) {
    console.error("Error creating noise audio:", error);
    return { noiseNode: null, gainNode: null, filterNode: null };
  }
};

export const stopNoise = () => {
  if (noiseSource) {
    try {
      noiseSource.stop();
      noiseSource.disconnect();
      if (gainNode) {
        gainNode.disconnect();
      }
      if (filterNode) {
        filterNode.disconnect();
      }
    } catch (error) {
      console.error("Error stopping noise:", error);
    } finally {
      noiseSource = null;
      gainNode = null;
      filterNode = null;
    }
  }
};

export const setNoiseVolume = (newVolume) => {
  if (gainNode) {
    gainNode.gain.setValueAtTime(newVolume, audioContext.currentTime);
  }
};

export const setFilterFrequency = (newFrequency) => {
  if (filterNode && filterNode instanceof BiquadFilterNode) {
    filterNode.frequency.setValueAtTime(newFrequency, audioContext.currentTime);
  }
};

export const setFilterQ = (newQ) => {
  if (filterNode && filterNode instanceof BiquadFilterNode) {
    filterNode.Q.setValueAtTime(newQ, audioContext.currentTime);
  }
};

export const setFilterType = (newType) => {
  if (filterNode && filterNode instanceof BiquadFilterNode) {
    filterNode.type = newType;
  }
};

export const closeAudioContext = () => {
  if (audioContext && audioContext.state !== "closed") {
    audioContext.close();
    audioContext = null;
    noiseSource = null;
    gainNode = null;
    filterNode = null;
  }
};
