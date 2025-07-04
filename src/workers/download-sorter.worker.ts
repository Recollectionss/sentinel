import { WorkerAbstract } from '../core/abstract/worker.abstract';
import * as path from 'node:path';
import fs, { Stats } from 'fs-extra';
import { FILE_CATEGORY } from '../enums/file-category.enum';
import chokidar from 'chokidar';
import { LoggerAbstract } from '../core/abstract/logger.abstract';
import { Config, ConfigIgnoredT } from '../types/config.types';
import * as os from 'node:os';

export class DownloadSorterWorker extends WorkerAbstract {
  private readonly downloadsDir: string;
  private readonly targetBaseDir: string;
  private readonly ignored: ConfigIgnoredT;

  constructor(
    logger: LoggerAbstract,
    private readonly config: Config,
  ) {
    super(logger);
    this.downloadsDir = os.homedir() + config.watch.main;
    this.targetBaseDir = `${this.downloadsDir}/Sentinel`;
    this.ignored = config.ignored;
  }

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
      .on('add', async (filePath: string, stat: Stats | undefined) => {
        this.logger.log('See new file');
        await this.ensureCategories();
        const pathArr: string[] = filePath.split('/');
        const fileName: string = pathArr[pathArr.length - 1];

        if (this.ignored.otherIgnored.includes(fileName)) {
          if (this.ignored.allowMoreIgnored) {
            return;
          }
        }

        if (stat.isDirectory()) {
          const contents: string[] = await fs.readdir(filePath);

          if (contents.length === 0) {
            await fs.remove(filePath);
            this.logger.log(`Removed empty directory: ${filePath}`);
          }
        }

        const category: string = this.getCategory(
          path.extname(fileName).toLowerCase(),
        );
        const targetDir: string = path.join(this.targetBaseDir, category);
        const targetPath: string = path.join(targetDir, fileName);

        await fs.move(filePath, targetPath, { overwrite: false });
        this.logger.log(`Moved ${fileName} → ${category}`);
        this.logger.log('Complete sorting');
      });
    this.logger.log(`Watch dir: ${this.downloadsDir}`);
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
