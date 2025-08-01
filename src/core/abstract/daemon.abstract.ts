import { logger } from '../services/logger';

export abstract class DaemonAbstract {
  protected constructor() {}

  protected abstract init(): Promise<void>;

  async start() {
    try {
      await this.init();
    } catch (err) {
      logger.error(err as Error);
      process.exit(1);
    }
  }
}
