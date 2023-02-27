export function getPlatform() {
  if (typeof Deno != "undefined") {
    return "Deno";
  } else if (typeof process != "undefined") {
    return "Node.JS";
  } else if (typeof document != "undefined") {
    return "Web";
  }
}