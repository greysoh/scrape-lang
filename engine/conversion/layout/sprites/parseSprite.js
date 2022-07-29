import { abort } from "../../../parsing/codeErrors.js";

export function generateVarName(lex, name, isList) {
  const type = isList ? "List" : "Var";
  return lex.name + type + "_" + name;
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
    if (lex.type == "var") {
      const name = generateVarName(currentSprite, lex.name);

      if (currentSprite.variables[name]) {
        abort("Error", "Variable already exists.", "N/a", lex.name);
      }

      if (!lex.hasValue) {
        currentSprite.variables[name] = [lex.name, 0];
      } else {
        currentSprite.variables[name] = [lex.name, lex.value];
      }
    } else if (lex.type == "list") {
      const name = generateVarName(currentSprite, lex.name, true);

      if (currentSprite.lists[name]) {
        abort("Error", "List already exists.", "N/a", lex.name);
      }

      if (!lex.hasValue) {
        currentSprite.lists[name] = [lex.name, []];
      } else {
        currentSprite.lists[name] = [lex.name, parseList(lex.value)];
      }
    } else if (lex.type == "globalVar") {
      const name = generateVarName(currentSprite, lex.name);

      let tempArr = spriteData;
      tempArr.push(currentSprite);

      const find = tempArr.find(i => i.isStage); 
      const index = tempArr.indexOf(find);

      if (index == -1) {
        throw new Error("Stage not specified.");
      }

      const elem = index == tempArr.length - 1 ? currentSprite : tempArr[index];

      if (elem.variables[name]) {
        abort("Error", "Variable already exists.", "N/a", lex.name);
      }

      if (!lex.hasValue) {
        elem.variables[name] = [lex.name, 0];
      } else {
        elem.variables[name] = [lex.name, lex.value];
      }
    } else if (lex.type == "globalList") {
      const name = generateVarName(currentSprite, lex.name, true);

      let tempArr = spriteData;
      tempArr.push(currentSprite);

      const find = tempArr.find(i => i.isStage); 
      const index = tempArr.indexOf(find);

      if (index == -1) {
        throw new Error("Stage not specified.");
      }

      const elem = index == tempArr.length - 1 ? currentSprite : tempArr[index];

      if (elem.lists[name]) {
        abort("Error", "List already exists.", "N/a", lex.name);
      }

      if (!lex.hasValue) {
        elem.lists[name] = [lex.name, []];
      } else {
        elem.lists[name] = [lex.name, parseList(lex.value)];
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
