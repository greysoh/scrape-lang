import { tokenize } from "./parsing/mod.js";
import { convert } from "./conversion/convert.js";

export function compile(text) {
  const lex = tokenize(text);
  const json = convert(lex);

  return json;
}