import { Sprite } from "../sprites/mod.ts";
import { ProjectType } from "./types.ts";

export class Project {
  targets: Sprite[]
  monitors: unknown[]
  extensions: string[]

  meta: {
    semver: string,
    vm: string,
    agent: string
  }

  constructor() {
    this.targets = [];
    this.monitors = [];
    this.extensions = [];

    this.meta.semver = "3.0.0";
    this.meta.vm = "1.3.18";
    this.meta.agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/110.0"
  }

  dump(): ProjectType {
    return {
      targets: this.targets,
      monitors: this.monitors,
      extensions: this.extensions,

      meta: this.meta
    }
  }
} 