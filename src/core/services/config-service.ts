import { Config } from '../types/config.types';
import { ConfigServiceValidation } from './config-service.validation';
import * as chokidar from 'chokidar';
import { logger } from './logger';

export class ConfigService {
  private _config: Config | undefined;

  constructor() {
    this._config = new ConfigServiceValidation().validate() as Config;
    this.hotReload();

    if (typeof this._config === 'undefined') {
      throw new Error('Config must be defined');
    }
  }

  get(): Config {
    return this._config as Config;
  }

  private hotReload(): void {
    chokidar
      .watch(__dirname + '../../../../public/config/config.json', {
        atomic: true,
        awaitWriteFinish: {
          stabilityThreshold: 5000,
          pollInterval: 100,
        },
        ignoreInitial: true,
      })
      .on('change', () => {
        try {
          this._config = new ConfigServiceValidation().validate() as Config;
          logger.log('Config reload successfully.');
        } catch (e) {
          logger.error(e as Error);
        }
      });
  }
}

export const config = new ConfigService().get();
