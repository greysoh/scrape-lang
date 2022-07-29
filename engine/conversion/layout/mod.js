import { parseSprite } from "./sprites/parseSprite.js";

// Main

export function getLayout() {
  return {
    sprites: {
      parseSprite: parseSprite
    }
  };
}