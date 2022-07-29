import { parseVar } from "./misc/variables/parseVar.js";
import { parseSprite } from "./sprites/parseSprite.js";

// Main

export function getLayout() {
  return {
    sprites: {
      parseSprite: parseSprite
    },
    misc: {
      parseVar: parseVar
    }
  };
}