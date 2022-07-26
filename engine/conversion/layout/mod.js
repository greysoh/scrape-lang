import { parseVar } from "./misc/variables/parseVar.js";

// Main

export function getLayout() {
  return {
    misc: {
      parseVar: parseVar
    }
  };
}