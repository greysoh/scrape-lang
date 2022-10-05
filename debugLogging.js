export class Logger {
  constructor(level, prefix) {
    this.level = level;
    this.prefix = prefix;
  }

  getLevels() {
    return ["debug", "warn", "error"];
  }

  info(...args) {
    console.log(this.prefix.replaceAll("$LEVEL", ""), ...args);
  }

  debug(...args) {
    if (this.level === "debug") {
      console.log(this.prefix.replaceAll("$LEVEL", "debug"), ...args);
    }
  }

  warn(...args) {
    if (
      this.level === "warn" ||
      this.level == "error" ||
      this.level === "debug"
    ) {
      console.log(this.prefix.replaceAll("$LEVEL", "warn"), ...args);
    }
  }

  error(...args) {
    if (this.level === "error" || this.level === "debug") {
      console.log(this.prefix.replaceAll("$LEVEL", "error"), ...args);
    }
  }
}
