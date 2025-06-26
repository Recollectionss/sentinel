export abstract class LoggerAbstract {
  abstract log(message: string): void;
  abstract error(error: Error, context?: string): void;
  protected getCallerName(): string {
    const err = new Error();

    if (!err.stack) return 'unknown';

    const lines = err.stack.split('\n').slice(1);

    for (const line of lines) {
      if (!line.includes('Logger')) {
        const match = line.match(/at\s+(.*)\s+\(/);

        if (match && match[1]) return match[1];
      }
    }

    return 'unknown';
  }
}
