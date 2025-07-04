import { LoggerAbstract } from '../core/abstract/logger.abstract';

export class Logger extends LoggerAbstract {
  log(message: string) {
    const callerName = this.getCallerName();
    console.log(`[INFO] [${callerName}]: ${message}`);
  }

  error(error: Error) {
    const callerName = this.getCallerName();
    console.error(`[ERROR] [${callerName}]`, error);
  }
}
