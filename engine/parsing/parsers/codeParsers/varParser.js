import { abort } from "../../codeErrors.js";

// TODO: Remove obvious comments.

/**
 * Parses args like a normal human being.
 * @param {string} str Arguments to parse
 * @returns {object} Parsed arguments
 */
export function parseArgsNS(str) {
  let value = {}; // The value of the argument

  if (str.startsWith('"') && str.endsWith('"')) {
    // Checks if it's a string
    value.type = "string"; // Sets the type to string, and gets the value using substring
    value.value = str.substring(1, str.length - 1);

    return value;
  } else if (str.startsWith("[") && str.endsWith("]")) {
    // Checks if it's an array
    let tempStr = str; // Gets the array
    tempStr = tempStr.replaceAll(", ", ","); // Removes spaces

    value.type = "array"; // Sets the type to array

    let values = tempStr.substring(1, tempStr.length - 1).split(","); // Gets the values

    value.value = []; // Creates the array

    for (const i in values) {
      const item = parseArgsNS(values[i]); // Parses the item

      value.value.push(item); // Adds the item to the array
    }

    return value; // Returns the array
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

  let values = []; // The values of the arguments

  for (const i in strSplit) {
    let value = {}; // The value of the argument

    if (lookup[0].indexOf(strSplit[i]) != -1) {
      // Checks if it's a math operator
      value.type = "operator";
      value.value = lookup[1][lookup[0].indexOf(strSplit[i])]; // Gets the value from the lookup
    } else {
      value.type = "argument"; // Sets the type to argument
      value.value = parseArgsNS(strSplit[i]); // Gets the value from the parser

      if (!Number.isNaN(parseInt(strSplit[i]))) {
        // Checks if it's a number
        abort(
          // Throws an error if it's a number
          "SyntaxError",
          "Numbers are not supported by Scratch.",
          "N/a",
          str
        );
      } else if (value.value == null) {
        // Checks if it's a variable
        value.type = "variable"; // Sets the type to variable
        value.value = { type: "var", name: strSplit[i] }; // Gets the value from the parser
      } else if (value.value.type == "array") {
        // Checks if it's an array
        if (disableArrays)
          // Checks if it's disabled
          abort(
            // Throws an error if it's disabled
            "SyntaxError",
            "Nested arrays are not supported by Scratch.",
            "N/a",
            str
          );

        value.type = "array"; // Sets the type to array
      }
    }

    values.push(value);
  }

  return values;
}

export function varParser(input) {
  let token = {};

  if (input.trim().startsWith("var")) {
    // Normal variable parsing

    const data = input.trim().split(" "); // Gets the data

    let name = data[1]; // Gets the name
    if (name.endsWith(";")) name = name.slice(0, -1); // Removes the ;, if it exists

    token.type = "var"; // Sets the type to variable
    token.name = name; // Sets the name

    if (data[2] == "=") {
      // Checks if we're setting a value
      token.hasValue = true; // Sets the hasValue to true

      let val = data.slice(3).join(" "); // Gets the value
      if (val.endsWith(";")) val = val.slice(0, -1); // Removes the ;, if it exists

      const value = varParseArgs(val); // Parses the value

      token.value = value; // Sets the value
      token.hasValue = true; // Sets the hasValue to true
    } else {
      token.hasValue = false; // Sets the hasValue to false
    }

    return token; // Returns the token
  } else if (input.trim().startsWith("global var")) {
    // Global variable parsing
    const data = input.trim().split(" "); // Gets the data

    let name = data[2]; // Gets the name
    if (name.endsWith(";")) name = name.slice(0, -1); // Removes the ;, if it exists

    token.type = "globalVar"; // Sets the type to global variable
    token.name = name; // Sets the name

    if (data[3] == "=") {
      // Checks if we're setting a value
      token.hasValue = true; // Sets the hasValue to true

      let val = data.slice(3).join(" "); // Gets the value
      if (val.endsWith(";")) val = val.slice(0, -1); // Removes the ;, if it exists

      const value = varParseArgs(val); // Parses the value

      token.value = value; // Sets the value
      token.hasValue = true; // Sets the hasValue to true
    } else {
      token.hasValue = false; // Sets the hasValue to false
    }

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
    // Array assignment
    const data = input.trim().split(" "); // Gets the data
    const intChange = data[0].split("[")[1].split("]")[0]; // Gets the index of the array

    token.type = "setVarArray"; // Sets the type to setVarArray
    token.name = data[0].split("[")[0]; // Sets the name

    token.index = parseInt(intChange); // Sets the index

    if (Number.isNaN(token.index)) {
      // Checks if it's a number
      abort("SyntaxError", "Array index is not a number", "N/a", input); // Throws an error if it's not a number
    }

    if (!data[1]) {
      // Checks if it's a value
      abort("SyntaxError", "No new array value", "N/a", input); // Throws an error if it's not a value
    }

    if (data[1] == "=") {
      // Checks if we're setting a value
      let val = data.slice(2).join(" "); // Gets the value
      if (val.endsWith(";")) val = val.slice(0, -1); // Removes the ;, if it exists

      const value = varParseArgs(val, true); // Parses the value

      token.value = value; // Sets the value
    } else {
      abort("SyntaxError", "Invalid array assignment", "N/a", input); // Throws an error if it's not a value
    }

    return token; // Returns the token
  } else if (input.trim().split(" ")[1] && input.trim().split(" ")[1] == "=") {
    // String variable assignment
    const data = input.trim().split(" ");

    if (!data[2]) {
      abort("SyntaxError", "No new varaible value", "N/a", input); // Throws an error if it's not a value
    }

    token.type = "setVar"; // Sets the type to setVar
    token.name = data[0]; // Sets the name

    let val = data.slice(2).join(" "); // Gets the value
    if (val.endsWith(";")) val = val.slice(0, -1); // Removes the ;, if it exists

    const value = varParseArgs(val); // Parses the value

    token.value = value; // Sets the value
    token.hasValue = true; // Sets the hasValue to true

    return token; // Returns the token
  }
}
