import { Config, ConfigIgnoredT } from '../types/config.types';
import { LoggerAbstract } from '../core/abstract/logger.abstract';
import os from 'node:os';
import fs, { Stats } from 'fs-extra';
import path from 'node:path';

export class FileSorter {
  private readonly downloadsDir: string;
  private readonly targetBaseDir: string;
  private readonly ignored: ConfigIgnoredT;

  constructor(
    private readonly logger: LoggerAbstract,
    private readonly config: Config,
  ) {
    this.downloadsDir = os.homedir() + config.watch.main;
    this.targetBaseDir = `${this.downloadsDir}/Sentinel`;
    this.ignored = config.ignored;
  }

  async sort(filePath: string, stat: Stats | undefined): Promise<void> {
    const pathArr: string[] = filePath.split('/');
    const fileName: string = pathArr[pathArr.length - 1];

    if (
      (this.ignored.otherIgnored.includes(fileName) &&
        this.ignored.allowMoreIgnored) ||
      this.ignored.required.includes(fileName)
    ) {
      return;
    }

    if (stat && stat.isDirectory()) {
      const contents: string[] = await fs.readdir(filePath);

      if (contents.length == 0) {
        await fs.remove(filePath);
        this.logger.log(`Removed empty directory: ${filePath}`);
      }
      return;
    }

    const category: string | undefined = this.getCategory(
      path.extname(fileName).toLowerCase(),
    );

    if (typeof category == 'undefined') {
      this.logger.log(
        `File: ${fileName} cannot be moved, not exist rule or property allowOtherDir = false`,
      );
      return;
    }
    const targetDir: string = path.join(this.targetBaseDir, category);
    const targetPath: string = path.join(targetDir, fileName);

    try {
      await fs.move(filePath, targetPath, { overwrite: false });
    } catch (err) {
      // TODO: need add functional for work with fail move file (for example if him already exist)
      this.logger.error(
        Error(`Failed to move ${fileName}: ${(err as Error).message}`),
      );
    }
    this.logger.log(`Moved ${fileName} → ${category}`);
  }

  protected getCategory(ext: string): string | undefined {
    for (const cat of this.config.filesCategory) {
      if (this.config.sortedRules.fileRules[cat].includes(ext)) {
        return cat;
      }
    }

    if (this.config.sortedRules.allowOtherDir) {
      return 'Other';
    }
    return undefined;
  }
}
