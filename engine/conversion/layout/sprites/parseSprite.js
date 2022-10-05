import { abort } from "../../../parsing/codeErrors.js";
import { getLayout } from "../mod.js";

export function generateVarName(lex, name, isList) {
  const type = isList ? "List" : "Var";
  return lex.name + type + "_" + name;
}

export function mergeObjects(...objs) {
  let newObj = {};

  for (const obj of objs) {
    for (const key of Object.keys(obj)) {
      newObj[key] = obj[key];
    }
  }

  return newObj;
}

function parseList(list) {
  const newArr = [];

  for (const i of list) {
    if (i.type == "string") {
      newArr.push(i.value);
    } else {
      abort("SyntaxError", "Unsupported array item", "N/a", "N/a");
    }
  }

  return newArr;
}

/**
 * Parses sprite and converts it into a scratch format.
 * @param {object} lexes Lex to parse
 * @param {boolean} isTopLevel Whether this is the backdrop or not
 */
export function parseSprite(lexes, isTopLevel, name, prevSpriteData) {
  const layout = getLayout();

  const spriteData = prevSpriteData ? prevSpriteData : [];
  let currentSprite = {
    lists: {},
    broadcasts: {},
    variables: {},
    blocks: {},
    comments: {},
    currentCostume: 0,
    costumes: [],
    sounds: [],
    volume: 100,
    layerOrder: 0,
    tempo: 60,
    videoTransparency: 50,
    videoState: "on",
    textToSpeechLanguage: null,
  };

  if (isTopLevel) {
    currentSprite.isStage = true;
    currentSprite.name = "Stage";
  } else {
    currentSprite.name = name;
    currentSprite.isStage = false;
  }

  for (const lex of lexes) {
    switch (lex.type) {
      case "var": {
        const name = generateVarName(currentSprite, lex.name);

        if (currentSprite.variables[name]) {
          abort("Error", "Variable already exists.", "N/a", lex.name);
        }

        if (!lex.hasValue) {
          currentSprite.variables[name] = [lex.name, 0];
        } else {
          currentSprite.variables[name] = [lex.name, lex.value];
        }

        break;
      }

      case "globalVar": {
        const name = generateVarName(currentSprite, lex.name);

        let tempArr = spriteData;
        tempArr.push(currentSprite);

        const find = tempArr.find((i) => i.isStage);
        const index = tempArr.indexOf(find);

        if (index == -1) {
          throw new Error("Stage not specified.");
        }

        const elem =
          index == tempArr.length - 1 ? currentSprite : tempArr[index];

        if (elem.variables[name]) {
          abort("Error", "Variable already exists.", "N/a", lex.name);
        }

        if (!lex.hasValue) {
          elem.variables[name] = [lex.name, 0];
        } else {
          elem.variables[name] = [lex.name, lex.value];
        }
        
        break;
      }

      case "list": {
        const name = generateVarName(currentSprite, lex.name, true);

        if (currentSprite.lists[name]) {
          abort("Error", "List already exists.", "N/a", lex.name);
        }

        if (!lex.hasValue) {
          currentSprite.lists[name] = [lex.name, []];
        } else {
          currentSprite.lists[name] = [lex.name, parseList(lex.value)];
        }

        break;
      }

      case "globalList": {
        const name = generateVarName(currentSprite, lex.name, true);

        let tempArr = spriteData;
        tempArr.push(currentSprite);

        const find = tempArr.find((i) => i.isStage);
        const index = tempArr.indexOf(find);

        if (index == -1) {
          throw new Error("Stage not specified.");
        }

        const elem =
          index == tempArr.length - 1 ? currentSprite : tempArr[index];

        if (elem.lists[name]) {
          abort("Error", "List already exists.", "N/a", lex.name);
        }

        if (!lex.hasValue) {
          elem.lists[name] = [lex.name, []];
        } else {
          elem.lists[name] = [lex.name, parseList(lex.value)];
        }

        break;
      }

      case "command": {
        let functionVal = "";

        function getData(array, item) {
          let prevItem = item;

          for (const i of array) {
            if (prevItem[i]) {
              prevItem = prevItem[i];
            } else {
              return undefined;
            }
          }

          return prevItem;
        }

        const newCommand = lex.command;
        newCommand.unshift("commands");

        functionVal = getData(newCommand, layout);

        if (!functionVal) {
          abort("Error", "Command not found.", "N/a", lex.command.join("."));
        }

        const data = functionVal(lex, currentSprite, spriteData);

        if (data.mergeSprite) {
          currentSprite = mergeObjects(currentSprite, data.mergeSprite);
        } else if (data.addSprites) {
          spriteData.push(...data.addSprites);
        }

        break;
      }
    }
  }

  console.log(lexes);
  console.log(currentSprite, "\n");

  if (currentSprite.costumes.length == 0) {
    abort("Error", "No costumes found in sprite", "N/a", "N/a");
  }

  spriteData.push(currentSprite);

  return { data: spriteData };
}
