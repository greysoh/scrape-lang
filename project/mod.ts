import { Sprite } from "../sprites/mod.ts";
import { SpriteClass } from "./SpriteWrapper/mod.ts";
import { ProjectType, Extension } from "./types.ts";

export class Project {
  targets: Sprite[]
  monitors: unknown[]
  extensions: string[]

  meta: {
    semver: string,
    vm: string,
    agent: string
  }

  /**
   * Initialize a Scratch project JSON file.
   */
  constructor() {
    this.targets = [];
    this.monitors = [];
    this.extensions = [];

    this.meta.semver = "3.0.0";
    this.meta.vm = "1.3.18";
    this.meta.agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/110.0"
  }

  /**
   * Create a Sprite
   * @param isStage Determine if item is a scratch "stage" or not
   * @param name Name of object
   * @returns Sprite data
   */
  createSprite(isStage: boolean, name: string) {
    const stageCheck = this.targets.find((i) => i.isStage);

    if (stageCheck && isStage) {
      throw new Error("There is already a stage created.");
    } else if (!stageCheck && !isStage) {
      console.warn("No stage exists yet!");
    }

    const sprite = new SpriteClass(isStage, name);
    this.targets.push(sprite.spriteData);

    return sprite;
  }

  /**
   * 
   * @param extension Extension data
   * r/196 rule
   */
  enableExtension(extension: Extension): boolean {
    if (this.extensions.indexOf(extension) == -1) return false;
    this.extensions.push(extension);

    return true;
  }

  /**
   * Dumps the project data.
   * @returns {ProjectType} Project
   */
  dump(): ProjectType {
    return {
      targets: this.targets,
      monitors: this.monitors,
      extensions: this.extensions,

      meta: this.meta
    }
  }
} 