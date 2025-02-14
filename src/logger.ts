import { type RestrictiveAny } from "./types";

const colorHandler_ = {
  blue: (inp:RestrictiveAny) => `${Logger.ANSI_ESCAPE}[1;94m${inp}${Logger.ANSI_ESCAPE}[0m`,
  yellow: (inp:RestrictiveAny) => `${Logger.ANSI_ESCAPE}[1;33m${inp}${Logger.ANSI_ESCAPE}[0m`,
  red: (inp:RestrictiveAny) => `${Logger.ANSI_ESCAPE}[1;31m${inp}${Logger.ANSI_ESCAPE}[0m`,
  green: (inp:RestrictiveAny) => `${Logger.ANSI_ESCAPE}[1;32m${inp}${Logger.ANSI_ESCAPE}[0m`,
  magenta: (inp:RestrictiveAny) => `${Logger.ANSI_ESCAPE}[1;95m${inp}${Logger.ANSI_ESCAPE}[0m`,
};

export enum ELoggerLevels {
  Info,
  Warn,
  Error,
  Debug,
  Http,
}

export const levels = ELoggerLevels;

export class Logger {
  static ANSI_ESCAPE = "\x1b";
  private output = console;
  public log_(...args: RestrictiveAny[]) {
    this.output.log(...args);
  }
  static timestamp() {
    const d = new Date();
    const hours = d.getHours();
    const minutes = d.getMinutes();
    const seconds = d.getSeconds();

    return {
      hours,
      minutes,
      seconds,
      combined: `${hours}:${minutes}:${seconds}`,
    };
  }

  public prefix = "";

  constructor(
    prefix = "",
    output = console,
    private colorHandler = colorHandler_
  ) {
    this.prefix = prefix;
    this.output = output;
  }

  public log(level: string | number | ELoggerLevels, ...args: RestrictiveAny[]) {
    this.log_(
      `[${Logger.timestamp().combined}]:`,
      this.prefix !== "" ? `[${this.prefix}]` : "",
      `${this.levelColor(this.parseLevel(level))}`,
      ...args
    );
  }

  public info(...args: RestrictiveAny[]) {
    this.log("info", ...args);
  }
  public warn(...args: RestrictiveAny[]) {
    this.log("warn", ...args);
  }
  public error(...args: RestrictiveAny[]) {
    this.log("error", ...args);
  }
  public debug(...args: RestrictiveAny[]) {
    this.log("debug", ...args);
  }
  public http(...args: RestrictiveAny[]) {
    this.log("http", ...args);
  }

  public levelColor(level: ELoggerLevels) {
    if (level === 0) {
      // Info
      return this.colorHandler.blue(`INFO:`);
    }
    if (level === 1) {
      // Warn
      return this.colorHandler.yellow(`WARN:`);
    }
    if (level === 2) {
      // Error
      return this.colorHandler.red(`ERROR:`);
    }
    if (level === 3) {
      // Debug
      return this.colorHandler.green(`DEBUG:`);
    }
    if (level === 4) {
      // Http
      return this.colorHandler.magenta(`HTTP:`);
    }
  }

  public parseLevel(
    level: string | number | ELoggerLevels
  ): ELoggerLevels | number {
    let Converted: ELoggerLevels | number;
    if (typeof level === "string") {
      if (level.toLowerCase() == "info" || level.toLowerCase() == "log")
        Converted = ELoggerLevels.Info;
      if (level.toLowerCase() == "warn" || level.toLowerCase() == "warning")
        Converted = ELoggerLevels.Warn;
      if (level.toLowerCase() == "err" || level.toLowerCase() == "error")
        Converted = ELoggerLevels.Error;
      if (level.toLowerCase() == "debug") Converted = ELoggerLevels.Debug;
      if (level.toLowerCase() == "http") Converted = ELoggerLevels.Http;
    } else Converted = level;
    // @ts-expect-error // The editor says the variable used below was used before it was assigned a value
    return Converted;
  }
}
