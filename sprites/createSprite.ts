import { Sprite } from "./types.ts";

export function createSprite(isStage: boolean, name: string): Sprite {
  return {
    isStage: isStage, 
    name: name,
    variables: {},
    lists: {},
    broadcasts: {},
    blocks: {},
    currentCostume: 0,
    costumes: [],
    sounds: [],
    volume: 100,
    layerOrder: 1,
    visible: true,
    x: 0,
    y: 0,
    size: 100,
    direction: 90,
    draggable: false,
    rotationStyle: "all around"
  }
}