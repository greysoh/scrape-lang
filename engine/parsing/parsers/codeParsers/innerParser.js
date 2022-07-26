import { tokenize } from "../../mod.js";
import { abort } from "../../codeErrors.js";

// TODO: Document this.

export function innerParser(inputIndex, skipLine, lines) {
  let endOfFunction = false;
  let functionLines = [];

  let lastIndex = 0;

  const input = lines[inputIndex];

  const lineLength = input.search(/\S/);

  for (let k = parseInt(inputIndex) + 1; k < lines.length; k++) {
    if (skipLine >= k) continue;

    const line = lines[k];
    const lineTrimmed = line.trim();

    if (lineTrimmed.startsWith("}") && line.search(/\S/) === lineLength) {
      /*
      // Commented out because I don't think it's needed but I'm not sure.
      // Idk why this is here. Wouldn't this be always be empty?

      const lineRemoved = lineTrimmed.slice(0, -lineTrimmed.length);

      if (lineRemoved !== "") {
        functionLines.push(lineRemoved.substring(lineLength));
      }
      */

      endOfFunction = true;
      lastIndex = k;

      break;
    } else {
      functionLines.push(line.substring(lineLength));
    }
  }

  if (!endOfFunction) {
    abort("SyntaxError", "Failed to close function", parseInt(inputIndex) + 1, input);
  }

  const tokenized = tokenize(functionLines.join("\n"));

  let token = { args: [], skipLine: lastIndex };

  token.args.push({
    type: "function",
    value: tokenized,
  });

  return token;
}
