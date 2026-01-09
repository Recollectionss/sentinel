import callsites from 'callsites';
import { loggerSaverService, LoggerSaverService } from './logger-saver-service';

export class Logger {
  constructor(private readonly loggerSaverService: LoggerSaverService) {}

  log(message: string): void {
    const callerName: string = this.getCallerName();
    console.log(`[INFO] [${callerName}]: ${message}`);
  }

  error(error: Error): void {
    const callerName: string = this.getCallerName();
    console.error(`[ERROR] [${callerName}]`, error.message);
    this.loggerSaverService
      .saveLogs({
        error_type: typeof error,
        message: error.message,
        caller_name: callerName,
      })
      .catch((err: Error) => console.log(`[ERROR] [${Logger.name}]`, err));
  }

  protected getCallerName(): string {
    const sites: callsites.CallSite[] = callsites();

    for (const site of sites) {
      const fileName: string | null = site.getFileName();

      if (
        fileName &&
        !fileName.includes('node_modules') &&
        !fileName.includes('Logger') &&
        !fileName.includes('logger.ts')
      ) {
        const functionName: string = site.getFunctionName() || 'anonymous';
        const typeName: string | null = site.getTypeName();
        const method: string = typeName
          ? `${typeName}.${functionName}`
          : functionName;
        return `${method}`;
      }
    }

    return 'unknown';
  }
}

export const logger = new Logger(loggerSaverService);
