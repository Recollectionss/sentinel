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
    const pathArr: string[] = filePath.split('/');
    const fileName: string = pathArr[pathArr.length - 1];

    if (
      config.ignored.custom.includes(fileName) ||
      config.ignored.always.includes(fileName)
    ) {
      return;
    }

    if (stat && stat.isDirectory()) {
      const contents: string[] = await fs.readdir(filePath);

      if (contents.length == 0) {
        await fs.remove(filePath);
        logger.log(`Removed empty directory: ${filePath}`);
      }
      return;
    }

    const category: string | undefined = this.getCategory(
      path.extname(fileName).toLowerCase(),
    );

    if (typeof category == 'undefined') {
      logger.log(
        `File: ${fileName} cannot be moved, not exist rule or property allowOtherDir = false`,
      );
      return;
    }
    const targetDir: string = path.join(this.targetBaseDir, category);
    const targetPath: string = path.join(targetDir, fileName);

    try {
      const color = config.sortedRules.rules[category]?.color
        ? +config.sortedRules.rules[category].color
        : +TagColors.NONE;
      await this.tagService.applyTag(filePath, category, color);

      await fs.move(filePath, targetPath, { overwrite: false });
      logger.log(`Moved ${fileName} → ${category}`);
    } catch (err) {
      // TODO: need add functional for work with fail move file (for example if him already exist)
      logger.error(
        Error(`Failed to move ${fileName}: ${(err as Error).message}`),
      );
    }
  }

  protected getCategory(ext: string): string | undefined {
    for (const cat of Object.keys(config.sortedRules.rules)) {
      if (config.sortedRules.rules[cat].type.includes(ext)) {
        return cat;
      }
    }

    if (config.sortedRules.allowOtherDir) {
      return 'Other';
    }
    return undefined;
  }
}
