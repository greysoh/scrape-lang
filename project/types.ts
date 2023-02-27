import { Sprite } from "../sprites/mod.ts";

export type ProjectType = {
  targets: Sprite[],
  monitors: unknown[],
  extensions: string[],
  meta: {
    semver: string,
    vm: string,
    agent: string
  }
}