export type Costume = {
  name: string,
  bitmapResolution: number,
  dataFormat: string,
  assetId: string,
  md5ext: string,
  rotationCenterX: number,
  rotationCenterY: number
}

export type Sound = {
  // TODO: research
}

export type Sprite = {
  isStage: boolean, 
  name: string,
  variables: {},
  lists: {},
  broadcasts: {},
  blocks: {},
  currentCostume: number,
  costumes: Costume[],
  sounds: Sound[],
  volume: number,
  layerOrder: number,
  visible: boolean,
  x: number,
  y: number,
  size: number,
  direction: number,
  draggable: boolean,
  rotationStyle: string
}