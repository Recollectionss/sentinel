import fs from 'fs-extra';
import path from 'node:path';
import { Config, ConfigIgnoredT } from '../types/config.types';

export class ConfigServiceValidation {
  private readonly config: Config;
  constructor() {
    this.configExist();
    const raw: string = fs.readFileSync(
      path.resolve(__dirname, '../../../public/config/config.json'),
      'utf-8',
    );
    this.config = JSON.parse(raw) as Config;

    // Compile all RegExp
    Object.values(this.config.sortedRules.rules).forEach((rule) => {
      rule.compiledRegExp = (rule.regExp || []).map(
        (pattern) => new RegExp(pattern),
      );
    });
  }

  validate(): Config | Error {
    this.mainExist();
    this.ignored();
    this.filesAndRules();
    return this.config;
  }

  private configExist(): void | Error {
    if (
      !fs.existsSync(
        path.resolve(__dirname, '../../../public/config/config.json'),
      )
    ) {
      throw new Error(
        `Config file not found at path: ${path.resolve(__dirname, '../../..config/config.json')}`,
      );
    }
  }

  private mainExist(): void | Error {
    if (!this.config.watch.main) {
      throw new Error('Need select main dir to watch');
    }
  }

  private filesAndRules(): void | Error {
    Object.keys(this.config.sortedRules.rules).forEach((ruleName: string) => {
      const countRules: number =
        this.config.sortedRules.rules[ruleName].type.length;

      if (countRules < 1) {
        throw new Error(
          `File category cannot have less then 1 rule, add rules for ${ruleName} file rules into config.json`,
        );
      }
      const colorCode = +this.config.sortedRules.rules[ruleName].color;

      if (Number.isNaN(colorCode)) {
        throw new Error(`Invalid color code in rule : ${ruleName}`);
      }
    });
  }

  private ignored(): void | Error {
    const ignored: ConfigIgnoredT = this.config.ignored;

    if (
      !['.DS_Store', 'Sentinel'].every((f: string) =>
        ignored.always.includes(f),
      )
    ) {
      throw new Error('.DS_Store and Sentinel are required for ignore');
    }

    this.config.ignored.custom.forEach((item: string) => {
      if (Object.keys(this.config.sortedRules).includes(item)) {
        throw new Error(
          `Other ignored file/dir: ${item}  contains in sortedRules`,
        );
      }
    });
  }
}
