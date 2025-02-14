import { Logger } from "./logger";
import { RestrictiveAny } from "./types";

const colorHandler = {
  blue: (inp:RestrictiveAny) => <string>inp,
  yellow: (inp:RestrictiveAny) => <string>inp,
  red: (inp:RestrictiveAny) => <string>inp,
  green: (inp:RestrictiveAny) => <string>inp,
  magenta: (inp:RestrictiveAny) => <string>inp,
};

const logger = new Logger("ErrorHandler", console, colorHandler);
export class errorHandler {
  static cache = {
    unAssignable: (err: any) => errorHandler.HandleError(err),
    failed: (err: any) => errorHandler.HandleError(err),
  };
  //@ts-expect-error//
  static HandleError(err) {
    logger.error(err);
  }
}
