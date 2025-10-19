import fs, { Stats } from 'fs-extra';
import path from 'node:path';
import { TagColors } from '../core/enum/tag-colors.enum';
import { TagService } from '../core/services/tag-service';
import { configService } from '../core/services/config-service';
import { logger } from '../core/services/logger';

export class FileSorter {
  private readonly targetBaseDir: string;

  constructor(private readonly tagService: TagService) {
    this.targetBaseDir = `${configService.get().watch.main}/Sentinel`;
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
      logger.log(`File: ${fileName} ` + (e as Error).message);
    }
  }

  async moveFile(filePath: string, stat: Stats | undefined): Promise<void> {
    const fileName: string = path.basename(filePath);
    try {
      await this.validateFile(fileName, filePath, stat);

      const category: string = this.getCategory(fileName);

      const targetPath: string = path.join(
        this.targetBaseDir,
        category,
        fileName,
      );

      await this.move(filePath, targetPath, category, fileName);
    } catch (e) {
      logger.log(`File: ${fileName}` + (e as Error).message);
    }
  }

  private async move(
    filePath: string,
    targetPath: string,
    category: string,
    fileName: string,
  ): Promise<void> {
    try {
      const color: TagColors = configService.get().sortedRules.rules[category]
        ?.color
        ? configService.get().sortedRules.rules[category].color
        : TagColors.NONE;
      await this.tagService.applyTag(filePath, category, +color);

      await fs.move(filePath, targetPath, { overwrite: false });
      logger.log(`Moved ${fileName} → ${category}`);
    } catch (err) {
      // TODO: need add functional for work with fail move file (for example if him already exist)
      logger.log(`failed to move: ${(err as Error).message}`);
    }
  }

  protected getCategory(ext: string): string {
    if (configService.get().sortedRules.allowDirNew) {
      return 'New';
    }

    for (const cat of Object.keys(configService.get().sortedRules.rules)) {
      if (configService.get().sortedRules.rules[cat].type.includes(ext)) {
        return cat;
      }
    }

    if (configService.get().sortedRules.allowOtherDir) {
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
      configService.get().ignored.custom.includes(fileName) ||
      configService.get().ignored.always.includes(fileName)
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
