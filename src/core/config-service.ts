import { Config } from '../types/config.types';
import { ConfigServiceValidation } from './config-service.validation';
import { LoggerAbstract } from './abstract/logger.abstract';

export class ConfigService {
  private readonly config: Config;

  constructor(private readonly logger: LoggerAbstract) {
    this.config = new ConfigServiceValidation().validate() as Config;
  }

  get(): Config {
    return this.config;
  }
}
