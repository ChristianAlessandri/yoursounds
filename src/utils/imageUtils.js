import ColorThief from "colorthief";

export const extractDominantColor = (img) => {
  if (!img || img.naturalWidth === 0) {
    console.warn("Image not uploaded or invalid");
    return null;
  }

  try {
    const colorThief = new ColorThief();
    const color = colorThief.getColor(img);
    return `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
  } catch (error) {
    console.error("Error in color extraction:", error);
    return null;
  }
};

export const getRgbaWithAlpha = (rgbString, alpha) => {
  const [r, g, b] = rgbString.match(/\d+/g).map(Number);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const getBrightness = (rgbString) => {
  const [r, g, b] = rgbString.match(/\d+/g).map(Number);
  return (r * 299 + g * 587 + b * 114) / 1000;
};
