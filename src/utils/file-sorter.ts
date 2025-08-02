import fs, { Stats } from 'fs-extra';
import path from 'node:path';
import { TagColors } from '../core/enum/tag-colors.enum';
import { TagService } from '../core/services/tag-service';
import { config } from '../core/services/config-service';
import { logger } from '../core/services/logger';

export class FileSorter {
  private readonly targetBaseDir: string;

  constructor(private readonly tagService: TagService) {
    this.targetBaseDir = `${config.watch.main}/Sentinel`;
  }

  async sort(filePath: string, stat: Stats | undefined): Promise<void> {
    const fileName: string = path.basename(filePath);
    try {
      await this.validateFile(fileName, filePath, stat);

      const category: string = this.getCategory(
        path.extname(fileName).toLowerCase(),
      );

      const targetPath: string = path.join(
        this.targetBaseDir,
        category,
        fileName,
      );

      await this.move(filePath, targetPath, category, fileName);
    } catch (e) {
      logger.error(new Error(`File: ${fileName}` + (e as Error).message));
    }
  }

  async moveToNew(filePath: string, stat: Stats | undefined): Promise<void> {}

  private async move(
    filePath: string,
    targetPath: string,
    category: string,
    fileName: string,
  ) {
    try {
      const color = config.sortedRules.rules[category]?.color
        ? +config.sortedRules.rules[category].color
        : +TagColors.NONE;
      await this.tagService.applyTag(filePath, category, color);

      await fs.move(filePath, targetPath, { overwrite: false });
      logger.log(`Moved ${fileName} → ${category}`);
    } catch (err) {
      // TODO: need add functional for work with fail move file (for example if him already exist)
      logger.error(Error(`failed to move: ${(err as Error).message}`));
    }
  }

  protected getCategory(ext: string): string {
    for (const cat of Object.keys(config.sortedRules.rules)) {
      if (config.sortedRules.rules[cat].type.includes(ext)) {
        return cat;
      }
    }

    if (config.sortedRules.allowOtherDir) {
      return 'Other';
    }

    throw new Error(`Unknown extension: ${ext}`);
  }

  private async validateFile(
    fileName: string,
    filePath: string,
    stat: Stats | undefined,
  ): Promise<void> {
    if (
      config.ignored.custom.includes(fileName) ||
      config.ignored.always.includes(fileName)
    ) {
      throw new Error('must be ignored');
    }

    if (stat?.isDirectory()) {
      const contents: string[] = await fs.readdir(filePath);

      if (
        contents.length == 0 ||
        (contents.length === 1 && contents.includes('.DS_Store'))
      ) {
        await fs.remove(filePath);
        logger.log(`Removed empty directory: ${filePath}`);
      }
    }
  }
}
