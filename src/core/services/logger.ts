import callsites from 'callsites';

export class Logger {
  log(message: string): void {
    const callerName: string = this.getCallerName();
    console.log(`[INFO] [${callerName}]: ${message}`);
  }

  error(error: Error): void {
    const callerName: string = this.getCallerName();
    console.error(`[ERROR] [${callerName}]`, error.message);
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
        const method: string = typeName ? `${typeName}.${functionName}` : functionName;
        return `${method}`;
      }
    }

    return 'unknown';
  }
}

export const logger = new Logger();
