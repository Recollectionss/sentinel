import { WorkerAbstract } from '../core/worker.abstract';
import * as os from 'node:os';
import * as path from 'node:path';
import fs from 'fs-extra';
import { FILE_CATEGORY } from '../enums/file-category.enum';
import chokidar from 'chokidar';

export class DownloadSorterWorker extends WorkerAbstract {
  private downloadsDir = `${os.homedir()}/Downloads`;
  private targetBaseDir = `${this.downloadsDir}/Sentinel`;
  private ignored = ['.DS_Store', 'ALL', 'Sentinel'];

  async init(): Promise<void> {
    this.logger.log('Start watching');
    await this.ensureCategories();
    chokidar
      .watch(this.downloadsDir, {
        ignoreInitial: true,
        awaitWriteFinish: {
          stabilityThreshold: 500,
          pollInterval: 100,
        },
        depth: 0,
      })
      .on('add', async (filePath) => {
        this.logger.log('See new file');
        await this.ensureCategories();
        const pathArr = filePath.split('/');
        const fileName = pathArr[pathArr.length - 1];

        if (this.ignored.includes(filePath)) return;

        const stat = await fs.stat(filePath);

        if (stat.isDirectory()) {
          const contents = await fs.readdir(filePath);

          if (contents.length === 0) {
            await fs.remove(filePath);
            this.logger.log(`Removed empty directory: ${filePath}`);
          }
        }

        const category = this.getCategory(path.extname(fileName).toLowerCase());
        const targetDir = path.join(this.targetBaseDir, category);
        const targetPath = path.join(targetDir, fileName);

        await fs.move(filePath, targetPath, { overwrite: false });
        this.logger.log(`Moved ${fileName} → ${category}`);
        this.logger.log('Complete sorting');
      });
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
