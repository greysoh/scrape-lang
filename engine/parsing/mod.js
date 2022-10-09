import { abort } from "./codeErrors.js";

import { varParser } from "./parsers/codeParsers/varParser.js";
import { innerParser } from "./parsers/codeParsers/innerParser.js";

import { parseMisc } from "./parsers/codeParsers/reservedParser.js";

// TODO: Document this.
// FIXME: Add support for functions with arguments.

export function tokenize(input) {
  const lines = input.split("\n");

  const tokens = [];
  let skipLine = -1;

  for (const inputIndex in lines) {
    const input = lines[inputIndex];
    let token = {};

    if (skipLine-1 >= inputIndex) continue;

    // Comments, whitespace, and ending parsers
    if (input.trim().startsWith("//")) {
      token.type = "comment";
      token.value = input.substring(2);
      tokens.push(token);

      continue;
    } else if (input.trim() == "" /* Don't process whitespace */) continue;

    // Reserved words (while, if, etc.) parser
    const parseToken = parseMisc(inputIndex, skipLine, lines);

    if (parseToken) {
      tokens.push(parseToken.token);
      skipLine = parseToken.skipLine;

      continue;
    }

    if (input.trim().startsWith("}")) continue; // Process if and else if's first so it doesn't remove them

    // Variables
    const varToken = varParser(input);

    if (varToken) {
      tokens.push(varToken);
      continue;
    }

    try {
      token.type = "command";

      token.command = input.split("(")[0].trim().split(".");
      token.rawArgs = input.split("(")[1].split(")")[0].split(",");
    } catch (e) {
      abort(
        "SyntaxError",
        `'${input.trim()}' is not correct function syntax`,
        parseInt(inputIndex) + 1,
        input
      );
    }

    token.args = [];

    // General purpose arguments
    for (const j in token.rawArgs) {
      const i = token.rawArgs[j].trim();

      if (i.startsWith('"') && i.endsWith('"')) {
        token.args.push({
          type: "string",
          value: i.slice(1, -1),
        });
      } else if (!Number.isNaN(parseInt(i))) {
        token.args.push({
          type: "number",
          value: parseFloat(i),
        })
      } else if (i.startsWith("function")) {
        const innerToken = innerParser(inputIndex, skipLine, lines);

        for (const k in innerToken.args) {
          token.args.push(innerToken.args[k]);
        }

        skipLine = innerToken.skipLine;
      } else {
        token.args.push({
          type: "variable",
          value: i,
        })
      }
    }

    tokens.push(token);
  }

  return tokens;
}
