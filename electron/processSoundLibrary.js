// processSoundLibrary.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import ColorThief from "colorthief";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const libraryPath = path.join(__dirname, "../public/data/sound_library.json");

export const updateLibraryWithDominantColors = async () => {
  try {
    const data = fs.readFileSync(libraryPath, "utf-8");
    const json = JSON.parse(data);
    let modified = false;

    for (const sound of json.library) {
      if (!sound.dominantColor && sound.image) {
        const imagePath = path.join(__dirname, "../public", sound.image);
        try {
          const [r, g, b] = await ColorThief.getColor(imagePath);
          sound.dominantColor = `rgb(${r}, ${g}, ${b})`;
          modified = true;
        } catch (error) {
          console.error(
            `Failed to extract color for ${sound.name}:`,
            error.message
          );
        }
      }
    }

    if (modified) {
      fs.writeFileSync(libraryPath, JSON.stringify(json, null, 2), "utf-8");
      console.log("sound_library.json updated with dominant colors.");
    } else {
      console.log("No updates needed to sound_library.json.");
    }
  } catch (error) {
    console.error("Error processing sound library:", error.message);
  }
};
