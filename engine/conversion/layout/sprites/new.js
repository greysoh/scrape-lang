import { abort } from "../../../parsing/codeErrors.js";
import { parseSprite } from "./parseSprite.js";

export function newSprite(lex) {
  console.log(lex);

  if (lex.args.length != 2) {
    abort("Error", "Too much (or little) args.", "N/a", lex.command.join(".") + "(" + lex.rawArgs.join(",") + ")");
  }

  if (lex.args[0].type != "string") {
    abort("Error", "1st argument is not a string", "N/a", lex.command.join(".") + "(" + lex.rawArgs.join(",") + ")");
  }
  
  if (lex.args[1].type != "function") {
    abort("Error", "2nd argument is not a function", "N/a", lex.command.join(".") + "(" + lex.rawArgs.join(",") + ")");
  }

  const sprites = parseSprite(lex.args[1].value, false, lex.args[0].value);

  return { addSprites: sprites };
}