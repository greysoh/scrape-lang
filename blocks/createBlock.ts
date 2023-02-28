import { Block } from "./types.ts";

export function createBlock(opcode: string, topLevel: boolean, x?: number, y?: number): Block {
  return {
    "name": crypto.randomUUID(),
    "data": {
      "opcode": opcode,
      "next": null,
      "parent": null,
      "inputs": {},
      "fields": {},
      "shadow": false,
      "topLevel": topLevel,
      "x": x ? x : 0,
      "y": y ? y : 0
    }
  }
}