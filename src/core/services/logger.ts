import callsites from 'callsites';

export class Logger {
  log(message: string) {
    const callerName = this.getCallerName();
    console.log(`[INFO] [${callerName}]: ${message}`);
  }

  error(error: Error) {
    const callerName = this.getCallerName();
    console.error(`[ERROR] [${callerName}]`, error.message);
  }

  protected getCallerName(): string {
    const sites = callsites();

    for (const site of sites) {
      const fileName = site.getFileName();

      if (
        fileName &&
        !fileName.includes('node_modules') &&
        !fileName.includes('Logger')
      ) {
        const functionName = site.getFunctionName() || 'anonymous';
        const typeName = site.getTypeName();
        const method = typeName ? `${typeName}.${functionName}` : functionName;
        return `${method})`;
      }
    }

    return 'unknown';
  }
}

export const logger = new Logger();
