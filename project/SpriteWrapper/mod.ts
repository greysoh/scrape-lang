import { createSprite } from "../../sprites/createSprite.ts";
import { Sprite } from "../../sprites/mod.ts";

export class SpriteClass {
  spriteData = Sprite;

  /**
   * Create a SpriteClass
   * @param isStage Determine if item is a scratch "stage" or not
   * @param name Name of object
   */
  constructor(isStage: boolean, name: string) {
    this.spriteData = createSprite(isStage, name);

    return this.spriteData;
  }
}