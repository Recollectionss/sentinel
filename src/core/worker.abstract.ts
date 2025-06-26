import { LoggerAbstract } from './logger.abstract';

export abstract class WorkerAbstract {
  constructor(protected readonly logger: LoggerAbstract) {}

  abstract init(): Promise<void>;

  protected async try(action: () => Promise<void>, context: string) {
    try {
      await action();
    } catch (err) {
      this.logger.error(err as Error, context);
    }
  }
}
