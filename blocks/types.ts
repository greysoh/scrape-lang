export type Block = {
  opcode: string,
  next: string | null,
  parent: string | null,
  inputs: any,
  fields: any,
  shadow: boolean,
  topLevel: boolean,
  x?: number,
  y?: number
}