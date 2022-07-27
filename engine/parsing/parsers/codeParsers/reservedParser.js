import { innerParser } from "./innerParser.js";
import { parseExpression } from "../expressionParser.js";

import { abort } from "../../codeErrors.js";

export function parseMisc(inputIndex, skipLineRaw, lines) {
  let token = {};
  let skipLine = skipLineRaw;

  const input = lines[inputIndex];

  /*
    Parses:
      - if (done)
      - else (done)
      - else if (done)
      - sleep (if it has an expression, else we just sleep in seconds with the argument) 
      - while (if it contains true, it loops forever, else, we handle the expression) [done]
    */

  if (input.trim().startsWith("if")) { // When we reach an if statement, 
    const split = input.split(" "); // we split the line into an array of words,

    if (split.length < 3) { // and if the array is not long enough,
      abort( // we abort the parsing.
        "SyntaxError",
        "Invalid 'if' statement",
        parseInt(inputIndex) + 1,
        input
      );
    }

    token.type = "statement"; // We set the type information,
    token.name = "if";

    split.pop(); // and remove the {

    let rawArgs = []; // We create an array to store the arguments,

    try {
      rawArgs = input.split("(")[1].split(")")[0]; // and try to parse them,
    } catch (e) { // and abort if we can't.
      abort(
        "SyntaxError",
        "Invalid arguments for '" + token.type + "' statement",
        parseInt(inputIndex) + 1,
        input
      );
    }

    token.args = parseExpression(rawArgs).args;
    const innerToken = innerParser(inputIndex, skipLine, lines);

    if (innerToken.args.length > 1) {
      throw "[parsing/parsers/reservedParser.js] - You have done the impossible. Please report this issue.";
    }

    token.body = innerToken.args[0].value;
    skipLine = innerToken.skipLine;

    return { token: token, skipLine: skipLine };
  } else if (input.trim().startsWith("} else if")) {
    const split = input.split(" ");

    if (split.length < 5) {
      abort(
        "SyntaxError",
        "Invalid 'else if' statement",
        parseInt(inputIndex) + 1,
        input
      );
    }

    token.type = "statement";
    token.name = "elseIf";

    split.pop(); // then, we remove the '{',

    let rawArgs = []; // and create an array to store the arguments,

    try {
      rawArgs = input.split("(")[1].split(")")[0]; // and try to parse them.
    } catch (e) {
      abort( // If we can't, we give a syntaxerror.
        "SyntaxError",
        "Invalid arguments for '" + token.type + "' statement",
        parseInt(inputIndex) + 1,
        input
      );
    }

    token.args = parseExpression(rawArgs).args; // Then, we parse the expression,
    const innerToken = innerParser(inputIndex, skipLine, lines); // and parse the inner data

    if (innerToken.args.length > 1) { // If they manage to do the impossible - somehow -,
      // we tell them of this feat and abort the parsing.
      throw "[parsing/parsers/reservedParser.js] - You have done the impossible. Please report this issue.";
    }

    token.body = innerToken.args[0].value; // We set the body, 
    skipLine = innerToken.skipLine; // and skip lines,

    return { token: token, skipLine: skipLine }; // and return the token.
  } else if (input.trim().startsWith("} else")) { // If we reach an else statement,
    if (!input.trim().startsWith("} else {")) { // and if it doesn't start with '} else {',
      abort( // we abort the parsing.
        "SyntaxError",
        "Invalid 'else' statement",
        parseInt(inputIndex) + 1,
        input
      );
    }

    token.type = "statement"; // We set the type information,
    token.name = "else";

    const innerToken = innerParser(inputIndex, skipLine, lines); // and parse the inner data

    if (innerToken.args.length > 1) { // If they manage to do the impossible - somehow -,
      // we tell them of this feat and abort the parsing.
      throw "[parsing/parsers/reservedParser.js] - You have done the impossible. Please report this issue.";
    }

    token.body = innerToken.args[0].value; // We set the body,
    skipLine = innerToken.skipLine; // and skip lines,

    return { token: token, skipLine: skipLine }; // and return the token.
  } else if (input.trim().startsWith("while")) { // If we reach a while statement,
    const split = input.split(" "); // we split the line into an array of words,

    if (split.length < 3) { // and if the array is not long enough,
      abort( // we abort the parsing.
        "SyntaxError",
        "Invalid 'while' statement",
        parseInt(inputIndex) + 1,
        input
      );
    }

    token.type = "statement"; // We set the type information,

    let rawArgs = []; // and create an array to store the arguments,

    try {
      rawArgs = input.split("(")[1].split(")")[0]; // and try to parse them,
    } catch (e) {
      abort( // If we can't, we give a syntaxerror.
        "SyntaxError",
        "Invalid arguments for '" + token.type + "' statement",
        parseInt(inputIndex) + 1,
        input
      );
    }

    if (rawArgs == "true") { // If it is an infinite loop,
      token.name = "whileInfinite"; // we set the name to whileInfinite,
    } else if (!Number.isNaN(parseInt(rawArgs))) { // If it is a while loop with a number,
      token.name = "whileTime"; // we set the name to whileTime,
      token.args = parseInt(rawArgs); // and we set the number as the argument.
    } else {
      token.name = "while"; // Else,
      token.args = parseExpression(rawArgs).args; // we parse the expression as arguments,
    }

    const innerToken = innerParser(inputIndex, skipLine, lines); // and parse the inner data.

    if (innerToken.args.length > 1) { // If they manage to do the impossible - somehow -,
      throw "[parsing/parsers/reservedParser.js] - You have done the impossible. Please report this issue."; // we tell them of this feat and abort the parsing.
    }

    token.body = innerToken.args[0].value; // We set the body,
    skipLine = innerToken.skipLine; // and skip lines,

    return { token: token, skipLine: skipLine }; // and return the token.
  } else if (input.trim().startsWith("sleep")) { // Else, 
    token.type = "expression"; // we set the type information,

    let rawArgs = []; // and create an array to store the arguments,

    try {
      rawArgs = input.split("(")[1].split(")")[0]; // and try to parse them.
    } catch (e) {
      abort( // If we can't, we give a syntaxerror.
        "SyntaxError",
        "Invalid arguments for '" + token.type + "' statement",
        parseInt(inputIndex) + 1,
        input
      );
    }

    if (!Number.isNaN(parseFloat(rawArgs))) { // If it is a number,
      token.name = "sleepTime"; // we set the name to sleepTime,
      token.args = parseInt(rawArgs); // and we set the number as the argument.
    } else {
      token.name = "sleep"; // Else,
      token.args = parseExpression(rawArgs).args; // we parse the expression as arguments,
    }

    return { token: token, skipLine: skipLine }; // and return the token.
  } else {
    return null;
  }
}
