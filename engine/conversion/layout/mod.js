import { parseSprite } from "./sprites/parseSprite.js";
import { newSprite } from "./sprites/new.js";

// Main

export function getLayout() {
  return {
    sprites: {
      parseSprite: parseSprite
    },
    Sprite: {
      new: newSprite
    }
  };
}