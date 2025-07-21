import callsites from 'callsites';

export abstract class LoggerAbstract {
  abstract log(message: string): void;
  abstract error(error: Error, context?: string): void;

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
