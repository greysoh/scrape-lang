import { tokenize } from "../../mod.js";
import { abort } from "../../codeErrors.js";

export function innerParser(inputIndex, skipLine, lines) {
  let endOfFunction = false;
  let functionLines = [];

  let lastIndex = 0;

  const input = lines[inputIndex];

  const lineLength = input.search(/\S/);

  for (let k = parseInt(inputIndex) + 1; k < lines.length; k++) {
    if (skipLine >= k) continue; // If we are supposed to skip said line, we skip it.

    const line = lines[k];
    const lineTrimmed = line.trim();

    if (lineTrimmed.startsWith("}") && line.search(/\S/) === lineLength) { // When we reach the end of the line,
      endOfFunction = true; // we say that we reached the end of the line, and return.
      lastIndex = k;

      break;
    } else {
      functionLines.push(line.substring(lineLength));
    }
  }

  if (!endOfFunction) {
    abort("SyntaxError", "Failed to close function", parseInt(inputIndex) + 1, input); // If we never reached the end of the line, we exit
  }

  const tokenized = tokenize(functionLines.join("\n")); // Parse inner data

  let token = { args: [], skipLine: lastIndex }; // Return data

  token.args.push({
    type: "function",
    value: tokenized,
  });

  return token;
}
