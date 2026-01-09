import fs, { Stats } from 'fs-extra';
import path from 'node:path';
import { TagColors } from '../core/enum/tag-colors.enum';
import { TagService } from '../core/services/tag-service';
import { configService } from '../core/services/config-service';
import { logger } from '../core/services/logs/logger';

export class FileSorter {
  private readonly targetBaseDir: string;

  constructor(private readonly tagService: TagService) {
    this.targetBaseDir = `${configService.get().watch.main}/Sentinel`;
  }

  async moveFile(filePath: string, stat: Stats | undefined): Promise<void> {
    const fileName = path.basename(filePath);

    try {
      await this.validateFile(fileName, filePath, stat);

      const category = this.getCategory(fileName);
      const targetPath = path.join(this.targetBaseDir, category, fileName);

      await this.move(filePath, targetPath, category, fileName);
    } catch (e) {
      logger.log(`File: ${fileName} ${(e as Error).message}`);
    }
  }

  private async move(
    filePath: string,
    targetPath: string,
    category: string,
    fileName: string,
  ): Promise<void> {
    const color: TagColors =
      configService.get().sortedRules.rules[category]?.color ?? TagColors.NONE;

    await fs.move(filePath, targetPath, { overwrite: false });

    setTimeout(
      () => this.tagService.applyTag(targetPath, category, +color),
      200,
    );

    logger.log(`Moved ${fileName} → ${category}`);
  }

  protected getCategory(file: string): string {
    const sortedRules = configService.get().sortedRules;

    if (sortedRules.allowDirNew) return 'New';

    if (sortedRules.useRegExp) {
      const fileName = path.basename(file);
      const checkedCats = new Set<string>();

      for (const cat of sortedRules.regExpPriority) {
        checkedCats.add(cat);
        for (const re of sortedRules.rules[cat].compiledRegExp || []) {
          if (re.test(fileName)) return cat;
        }
      }

      for (const cat of Object.keys(sortedRules.rules)) {
        if (checkedCats.has(cat)) continue;
        for (const re of sortedRules.rules[cat].compiledRegExp || []) {
          if (re.test(fileName)) return cat;
        }
      }
    }

    const ext = path.extname(file).toLowerCase();
    for (const cat of Object.keys(sortedRules.rules)) {
      if (
        (sortedRules.rules[cat].type || [])
          .map((e) => e.toLowerCase())
          .includes(ext)
      ) {
        return cat;
      }
    }

    if (sortedRules.allowOtherDir) return 'Other';

    throw new Error(`Unknown extension: ${file}`);
  }

  private async validateFile(
    fileName: string,
    filePath: string,
    stat: Stats | undefined,
  ): Promise<void> {
    if (
      configService.get().ignored.custom.includes(fileName) ||
      configService.get().ignored.always.includes(fileName)
    ) {
      throw new Error('must be ignored');
    }

    if (stat?.isDirectory()) {
      const contents = await fs.readdir(filePath);

      if (
        contents.length === 0 ||
        (contents.length === 1 && contents.includes('.DS_Store'))
      ) {
        await fs.remove(filePath);
        logger.log(`Removed empty directory: ${filePath}`);
      }
    }
  }
}
