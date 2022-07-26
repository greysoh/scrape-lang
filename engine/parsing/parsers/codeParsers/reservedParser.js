import { innerParser } from "./innerParser.js";
import { parseExpression } from "../expressionParser.js";

import { abort } from "../../codeErrors.js";

// TODO: Document this

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

  if (input.trim().startsWith("if")) {
    const split = input.split(" ");

    if (split.length < 3) {
      abort(
        "SyntaxError",
        "Invalid 'if' statement",
        parseInt(inputIndex) + 1,
        input
      );
    }

    token.type = "statement";
    token.name = "if";

    split.pop(); // Remove the {

    let rawArgs = [];

    try {
      rawArgs = input.split("(")[1].split(")")[0];
    } catch (e) {
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

    split.pop(); // Remove the {

    let rawArgs = [];

    try {
      rawArgs = input.split("(")[1].split(")")[0];
    } catch (e) {
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
  } else if (input.trim().startsWith("} else")) {
    if (!input.trim().startsWith("} else {")) {
      abort(
        "SyntaxError",
        "Invalid 'else' statement",
        parseInt(inputIndex) + 1,
        input
      );
    }

    token.type = "statement";
    token.name = "else";

    const innerToken = innerParser(inputIndex, skipLine, lines);

    if (innerToken.args.length > 1) {
      throw "[parsing/parsers/reservedParser.js] - You have done the impossible. Please report this issue.";
    }

    token.body = innerToken.args[0].value;
    skipLine = innerToken.skipLine;

    return { token: token, skipLine: skipLine };
  } else if (input.trim().startsWith("while")) {
    const split = input.split(" ");

    if (split.length < 3) {
      abort(
        "SyntaxError",
        "Invalid 'while' statement",
        parseInt(inputIndex) + 1,
        input
      );
    }

    token.type = "statement";

    let rawArgs = [];

    try {
      rawArgs = input.split("(")[1].split(")")[0];
    } catch (e) {
      abort(
        "SyntaxError",
        "Invalid arguments for '" + token.type + "' statement",
        parseInt(inputIndex) + 1,
        input
      );
    }

    if (rawArgs == "true") {
      token.name = "whileInfinite";
    } else if (!Number.isNaN(parseInt(rawArgs))) {
      token.name = "whileTime";
      token.args = parseInt(rawArgs);
    } else {
      token.name = "while";
      token.args = parseExpression(rawArgs).args;
    }

    const innerToken = innerParser(inputIndex, skipLine, lines);

    if (innerToken.args.length > 1) {
      throw "[parsing/parsers/reservedParser.js] - You have done the impossible. Please report this issue.";
    }

    token.body = innerToken.args[0].value;
    skipLine = innerToken.skipLine;

    return { token: token, skipLine: skipLine };
  } else if (input.trim().startsWith("sleep")) {
    token.type = "expression";

    let rawArgs = [];

    try {
      rawArgs = input.split("(")[1].split(")")[0];
    } catch (e) {
      abort(
        "SyntaxError",
        "Invalid arguments for '" + token.type + "' statement",
        parseInt(inputIndex) + 1,
        input
      );
    }

    if (!Number.isNaN(parseFloat(rawArgs))) {
      token.name = "sleepTime";
      token.args = parseInt(rawArgs);
    } else {
      token.name = "sleep";
      token.args = parseExpression(rawArgs).args;
    }

    return { token: token, skipLine: skipLine };
  } else {
    return null;
  }
}
