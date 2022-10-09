import { getLayout } from "./layout/mod.js";

// Meta for desktop app - no idea what this means
const meta = {
  "semver": "3.0.0",
  "vm": "0.2.0-prerelease.20220222132735",
  "agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Scratch/3.29.1 Chrome/94.0.4606.81 Electron/15.3.1 Safari/537.36"
}; 

export function convert(lex) {
  const layout = getLayout();
  const parseSprite = layout.sprites.parseSprite;

  let json = {
    targets: [],
    monitors: [],
    extensions: [],
    meta: meta
  };

  console.log(lex);
  json.targets = parseSprite(lex, true).data;
}