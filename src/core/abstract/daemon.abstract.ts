import { LoggerAbstract } from './logger.abstract';
import { Config } from '../types/config.types';
import { ConfigService } from '../services/config-service';

export abstract class DaemonAbstract {
  protected readonly config: Config;

  protected constructor(protected readonly logger: LoggerAbstract) {
    try {
      this.config = new ConfigService(logger).get();
    } catch (err) {
      this.logger.error(err as Error);
      process.exit(1);
    }
  }

  protected abstract init(): Promise<void>;

  async start() {
    try {
      await this.init();
    } catch (err) {
      this.logger.error(err as Error, this.constructor.name);
      process.exit(1);
    }
  }
}
