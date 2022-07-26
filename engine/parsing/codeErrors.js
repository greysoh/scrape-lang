export function abort(errorType, message, line, lineContents) {
  console.error(`${errorType}: ${message}`);
  console.error(`  context: ${lineContents.trim()}`);
  console.error(`  at line: ${line}`);
  
  if (Deno.args[1] == "debug") {
    console.log("\nNot exiting due to debug mode.");
  } else {
    Deno.exit(1);
  }
}
