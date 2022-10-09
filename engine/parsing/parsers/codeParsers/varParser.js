import { abort } from "../../codeErrors.js";

/**
 * Parses args like a normal human being.
 * @param {string} str Arguments to parse
 * @returns {object} Parsed arguments
 */
export function parseArgsNS(str) {
  let value = {}; // The value of the argument

  if (str.startsWith('"') && str.endsWith('"')) {
    // Checks if it's a string, and parses data
    value.type = "string";
    value.value = str.substring(1, str.length - 1);

    return value;
  } else if (str.startsWith("[") && str.endsWith("]")) {
    // Checks if it's an array
    let tempStr = str;
    tempStr = tempStr.replaceAll(", ", ","); // Removes spaces

    value.type = "array";

    let values = tempStr.substring(1, tempStr.length - 1).split(","); // Gets the values

    value.value = [];

    for (const i in values) {
      const item = parseArgsNS(values[i]); // Parses the item

      if (item == null) {
        abort("SyntaxError", "Invalid array item", "N/a", str);
      }

      value.value.push(item);
    }

    return value; // Returns the array
  } else if (!Number.isNaN(parseInt(str))) {
    value.type = "number";
    value.value = parseFloat(str);

    return value;
  } else {
    return null; // Returns null if it's not a string or an array
  }
}

/**
 * Wrapper for parseArgs, that throws an error if it has an invalid argument, for compatibility with the old-style parser.
 * @param {string} str Arguments to parse
 * @returns {object} Parsed arguments
 */
export function parseArgs(str) {
  const data = parseArgsNS(str);

  if (data == null) {
    abort("SyntaxError", "Invalid argument", "N/a", str);
    return null;
  }

  return data;
}

/**
 * Extended parsing for stuff like times, division, etc.
 * @param {string} str Arguments to parse
 * @param {boolean} disableArrays Returns errors when it detects arrays
 * @returns {object} Parsed arguments
 */
export function varParseArgs(str, disableArrays) {
  const strSplit = str.split(" ");

  const lookup = [
    ["+", "-", "*", "/"],
    ["plus", "minus", "times", "dividedBy"],
  ];

  let values = [];

  for (const i in strSplit) {
    let value = {};

    if (lookup[0].indexOf(strSplit[i]) != -1) {
      // Checks if it's a math operator
      value.type = "operator";
      value.value = lookup[1][lookup[0].indexOf(strSplit[i])]; // Gets the value from the lookup
    } else {
      value.type = "argument";
      value.value = parseArgsNS(strSplit[i]);

      if (value.value == null) {
        // Checks if it's a variable
        value.type = "variable";
        value.value = { type: "var", name: strSplit[i] };
      } else if (value.value.type == "array") {
        // Checks if it's an array
        if (disableArrays)
          abort(
            "SyntaxError",
            "Nested arrays are not supported by Scratch.",
            "N/a",
            str
          );

        value.type = "array";
      }
    }

    values.push(value);
  }

  return values;
}

export function varParser(input) {
  let token = {};

  if (input.trim().startsWith("var") || input.trim().startsWith("list")) {
    // Normal variable parsing

    const data = input.trim().split(" ");

    const isList = data[1] == "list"; // Checks if it's a list

    let name = data[1]; // Gets the name
    if (name.endsWith(";")) name = name.slice(0, -1); // Removes the ;, if it exists

    token.type = data[0]; // Sets the type to variable
    token.name = name; // Sets the name

    if (data[2] == "=") {
      token.hasValue = true;

      let val = data.slice(3).join(" "); // Gets the value
      if (val.endsWith(";")) val = val.slice(0, -1); // Removes the ;, if it exists

      const value = parseArgs(val)

      if (value.type != "array" && isList) {
        abort("SyntaxError", "Lists can only contain arrays.", "N/a", input);
      } else if (value.type == "array" && !isList) {
        abort(
          "SyntaxError",
          "Arrays can only be used with lists.",
          "N/a",
          input
        );
      }

      token.value = value;
      token.hasValue = true;
    } else {
      token.hasValue = false;
    }

    return token; // Returns the token
  } else if (
    input.trim().startsWith("global var") ||
    input.trim().startsWith("global list")
  ) {
    // Global variable parsing
    const data = input.trim().split(" "); 

    const isList = data[1] == "list";

    let name = data[2]; // Gets the name
    if (name.endsWith(";")) name = name.slice(0, -1); // Removes the ;, if it exists

    token.type = isList ? "globalList" : "globalVar"; // Sets the type
    token.name = name;

    if (data[3] == "=") {
      token.hasValue = true;

      let val = data.slice(4).join(" "); // Gets the value
      if (val.endsWith(";")) val = val.slice(0, -1); // Removes the ;, if it exists

      const value = parseArgs(val);

      if (value.type != "array" && isList) {
        abort("SyntaxError", "Lists can only contain arrays.", "N/a", input);
      } else if (value.type == "array" && !isList) {
        abort(
          "SyntaxError",
          "Arrays can only be used with lists.",
          "N/a",
          input
        );
      }

      token.value = value.value;
      token.hasValue = true;
    } else {
      token.hasValue = false;
    }

    return token;
  } else if (input.trim().split(" ")[1] && input.trim().split(" ")[1] == "=") {
    const data = input.trim().split(" ");

    if (!data[2]) {
      abort("SyntaxError", "No new varaible value", "N/a", input); // Throws an error if it's not a value
    }

    token.type = "setVar";
    token.name = data[0];

    let val = data.slice(2).join(" "); // Gets the value
    if (val.endsWith(";")) val = val.slice(0, -1); // Removes the ;, if it exists

    const value = varParseArgs(val);

    token.value = value;
    token.hasValue = true;

    return token;
  } else if (
    !input // Checks if it contains ( or ), so it doesn't get confused with a function. I'm too lazy to do a proper fix. Enjoy the bodge.
      .trim()
      .split(" ")[0]
      .split("")
      .includes("(") ||
    (!input.trim().split(" ")[0].split("").includes(")") && // This check for the ) on the same space may not be neccesary, but it's better to be safe than sorry.
      input.trim().split(" ")[0].split("[")[1] && // Checks if it contains [, and ], within the first space, to determine if it's an array.
      input.trim().split(" ")[0].split("[")[1].split("]")[0])
  ) {
    const data = input.trim().split(" ");
    let intChange = "";

    try {
      intChange = data[0].split("[")[1].split("]")[0];
    } catch (e) {
      abort("SyntaxError", "Not a valid variable", "N/a", input);
    }

    token.type = "setVarArray";
    token.name = data[0].split("[")[0];

    token.index = parseInt(intChange);

    if (Number.isNaN(token.index)) {
      // Checks if it's a number
      abort("SyntaxError", "Array index is not a number", "N/a", input);
    }

    if (!data[1]) {
      abort("SyntaxError", "No new array value", "N/a", input); // Throws an error if it's not a value
    }

    if (data[1] == "=") {
      let val = data.slice(2).join(" "); // Gets the value
      if (val.endsWith(";")) val = val.slice(0, -1); // Removes the ;, if it exists

      const value = varParseArgs(val, true);

      token.value = value;
    } else {
      abort("SyntaxError", "Invalid array assignment", "N/a", input);
    }

    return token;
  }
}
