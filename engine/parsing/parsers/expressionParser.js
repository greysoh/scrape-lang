import { abort } from "../codeErrors.js";

import { parseArgs } from "./codeParsers/varParser.js";

const lookUp = ["==", "===", "!=", "!==", "<", ">", "<=", ">=", "||", "&&"];
const lookUpResults = ["equals", "equals", "notEquals", "notEquals", "lessThan", "greaterThan", "lessThanOrEquals", "greaterThanOrEquals"];

const invalidLookUps = ["*=", "/=", "%=", "+=", "-=", "<<=", ">>=", ">>>=", "&=", "|=", "^="];

// TODO: Document this.

export function parseExpression(expression) {
  const expSplit = expression.split(" ");
  
  let exp = { type: "expression", rawArgs: expression, args: [] };

  for (const i in expSplit) {
    if (expSplit[i].startsWith("\"") && expSplit[i].endsWith("\"")) {
      const value = parseArgs(expSplit[i]);

      exp.args.push({ type: "argument", value: value });
    } else if (expSplit[i].startsWith("[") && expSplit[i].endsWith("]")) {
      abort("SyntaxError", "Nested arrays are not supported by Scratch.", "N/a", expression);
    } else {
      if (!Number.isNaN(parseInt(expSplit[i]))) {
        abort("SyntaxError", "Numbers are not supported by Scratch.", "N/a", expression);
      }
      
      const index = lookUp.indexOf(expSplit[i]);

      if (index == -1) {
        const invalidTest = invalidLookUps.indexOf(expSplit[i]);

        if (invalidTest == -1) {
          exp.args.push({ type: "argument", value: { type: "var", name: expSplit[i] } });
        } else {
          abort("SyntaxError", "Invalid operator", "N/a", expression);
        }
      } else {
        exp.args.push({ type: "operator", value: lookUpResults[index] });
      }
    }
  }

  return exp;
}