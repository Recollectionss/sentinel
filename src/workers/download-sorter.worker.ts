import { WorkerAbstract } from '../core/worker.abstract';
import * as os from 'node:os';
import * as path from 'node:path';
import fs from 'fs-extra';
import { FILE_CATEGORY } from '../enums/file-category.enum';

export class DownloadSorterWorker extends WorkerAbstract {
  private downloadsDir = `${os.homedir()}/Downloads`;
  private targetBaseDir = `${this.downloadsDir}/Sentinel`;

  async init(): Promise<void> {
    this.logger.log('Start');
    await this.ensureCategories();

    const files = await fs.readdir(this.downloadsDir);

    for (const fileName of files) {
      const filePath = path.join(this.downloadsDir, fileName);
      const ignored = ['.DS_Store', 'ALL', 'Sentinel'];

      if (ignored.includes(fileName)) continue;

      if ((await fs.readdir(`${this.downloadsDir}/${fileName}`)).length === 0) {
        await fs.remove(`${this.downloadsDir}/${fileName}`);
        this.logger.log(`Remove ${fileName} → Trash}`);
      }

      const category = this.getCategory(path.extname(fileName).toLowerCase());
      const targetDir = path.join(this.targetBaseDir, category);
      const targetPath = path.join(targetDir, fileName);

      await fs.move(filePath, targetPath, { overwrite: false });
      this.logger.log(`Moved ${fileName} → ${category}`);
    }
  }

  async ensureCategories() {
    for (const cat of Object.values(FILE_CATEGORY)) {
      await fs.ensureDir(path.join(this.targetBaseDir, cat));
    }
  }

  getCategory(ext: string): string {
    if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext))
      return FILE_CATEGORY.IMAGE;

    if (['.mp4', '.mov', '.avi', '.mkv'].includes(ext))
      return FILE_CATEGORY.VIDEO;

    if (['.zip', '.rar', '.7z', '.tar', '.gz'].includes(ext))
      return FILE_CATEGORY.ARCHIVE;

    if (['.pdf', '.txt', '.docs'].includes(ext)) return FILE_CATEGORY.TEXT;

    if (['.app'].includes(ext)) return FILE_CATEGORY.APPLICATION;

    return FILE_CATEGORY.OTHER;
  }
}
