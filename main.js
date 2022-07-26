import { exists } from "./fs.js";
import { Logger } from "./debugLogging.js";

import { compile } from "./engine/mod.js";

if (Deno.args.length == 0) {
  console.log("scrape: Please provide a file name");
  Deno.exit(1);
}

const file = Deno.args[0];
const level = Deno.args[1] || "";

const log = new Logger(level, `scrape:$LEVEL`);

if (await exists(file)) {
  log.debug(`File ${file} exists`);
} else {
  log.info("File does not exist!");
  Deno.exit(1);
}

log.debug("Getting data");
let fileData = await Deno.readTextFile(file);
fileData = fileData.replaceAll("\r", "");

log.debug("Starting engine...");
const code = compile(fileData);
