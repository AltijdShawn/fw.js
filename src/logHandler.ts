import {
  HandlerItem,
  LogLevels,
  ResponseLevels,
} from "./core/EventQueue_2";
import { EventEmitter2 } from "./Events";
import { Logger } from "./logger";
import { HEX_CHAR_LIST } from "./core/types/constants_1";
import { mkRandStr2 } from "./core/utils/common";

export interface IExtraFuncs {
  //@ts-expect-error//
  error?: (input) => {},
  //@ts-expect-error//
  info?: (input) => {},
  //@ts-expect-error//
  warn?: (input) => {},
  //@ts-expect-error//
  debug?: (input) => {},
}

interface IListeners {
  [name: string]: HandlerItem
}

export class LogHandler extends EventEmitter2 {
  //@ts-expect-error//
  public readonly instanceId = mkRandStr2(8, HEX_CHAR_LIST);
  private __logger__ = new Logger(`LogHandler(${this.instanceId})`);
  private _listeners: IListeners  = {}
  public listeners  : IListeners  = {}

  /**
   * Resets the overides applied to the listeners
   */
  public resetListenersOveride() {
    return this.listeners = {...this._listeners}
  }

  /**
   * Appends a different logger than the default
   */
  //@ts-expect-error//
  public appendNewLogger(loggerClass: Logger) {
    return (this.__logger__ = loggerClass);
  }

  constructor(extraFuncs?: IExtraFuncs) {
    if (extraFuncs == undefined) extraFuncs = {}

    super()
    super.setLogLevel(LogLevels.Silent)
    super.setResponseLevel(ResponseLevels.Normal)

    this._listeners["error"] = 
      super.on("__emitError", (err) => {
        this.__logger__.error(err)
        if(extraFuncs.error) extraFuncs.error(err)
      })
    this._listeners["warn"] = 
      super.on("__emitWarn", (err) => {
        this.__logger__.warn(err)
        if(extraFuncs.warn) extraFuncs.warn(err)
      })
    this._listeners["info"] = 
      super.on("__emitInfo", (err) => {
        this.__logger__.info(err)
        if(extraFuncs.info) extraFuncs.info(err)
      })
    this._listeners["debug"] = 
      super.on("__emitDebug", (err) => {
        this.__logger__.debug(err)
        if(extraFuncs.debug) extraFuncs.debug(err)
      })
    
    this.listeners = {...this._listeners}
  }

  /** * Helper method */
  //@ts-expect-error//
  public __error(input) {return super.emit("__emitError", input)}
  /** * Helper method */
  //@ts-expect-error//
  public __warn (input) {return super.emit("__emitWarn",  input)}
  /** * Helper method */
  //@ts-expect-error//
  public __info (input) {return super.emit("__emitInfo",  input)}
  /** * Helper method */
  //@ts-expect-error//
  public __debug(input) {return super.emit("__emitDebug", input)}
}