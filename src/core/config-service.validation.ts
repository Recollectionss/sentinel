import fs from 'fs-extra';
import path from 'node:path';
import { Config, ConfigIgnoredT } from '../types/config.types';

export class ConfigServiceValidation {
  private readonly config: Config;
  constructor() {
    this.configExist();
    const raw: string = fs.readFileSync(
      path.resolve(__dirname, '../../public/config/config.json'),
      'utf-8',
    );
    this.config = JSON.parse(raw) as Config;
  }

  validate(): Config | Error {
    this.ignored();
    this.filesAndRules();
    return this.config;
  }

  private configExist(): void | Error {
    if (
      !fs.existsSync(path.resolve(__dirname, '../../public/config/config.json'))
    ) {
      throw new Error(
        `Config file not found at path: ${path.resolve(__dirname, '../config/config.json')}`,
      );
    }
  }

  private mainExist(): void | Error {}

  private filesAndRules(): void | Error {
    Object.keys(this.config.sortedRules.fileRules).forEach(
      (ruleName: string) => {
        const countRules: number =
          this.config.sortedRules.fileRules[ruleName].length;

        if (countRules < 1) {
          throw new Error(
            `File category cannot have less then 1 rule, add rules for ${ruleName} file rules into config.json`,
          );
        }
      },
    );
  }

  private ignored(): void | Error {
    const ignored: ConfigIgnoredT = this.config.ignored;

    if (
      !['.DS_Store', 'Sentinel'].every((f: string) =>
        ignored.required.includes(f),
      )
    ) {
      throw new Error('.DS_Store and Sentinel are required for ignore');
    }

    if (ignored.allowMoreIgnored) {
      this.config.ignored.otherIgnored.forEach((item: string) => {
        if (Object.keys(this.config.sortedRules).includes(item)) {
          throw new Error(
            `Other ignored file/dir: ${item}  contains in filesCategory`,
          );
        }
      });
    }
  }
}
