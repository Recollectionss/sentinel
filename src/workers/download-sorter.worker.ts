import { WorkerAbstract } from '../core/abstract/worker.abstract';
import * as path from 'node:path';
import fs, { Stats } from 'fs-extra';
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
        this.logger.log(`See new file ${filePath}`);
        const pathArr: string[] = filePath.split('/');
        const fileName: string = pathArr[pathArr.length - 1];

        if (stat && stat.isDirectory()) {
          const contents: string[] = await fs.readdir(filePath);

          if (contents.length === 0) {
            await fs.remove(filePath);
            this.logger.log(`Removed empty directory: ${filePath}`);
          }
        }

        if (
          this.ignored.otherIgnored.includes(fileName) &&
          this.ignored.allowMoreIgnored
        ) {
          return;
        }

        const category: string | undefined = this.getCategory(
          path.extname(fileName).toLowerCase(),
        );

        if (typeof category === 'undefined') {
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
          this.logger.error(
            Error(`Failed to move ${fileName}: ${(err as Error).message}`),
          );
        }
        this.logger.log(`Moved ${fileName} → ${category}`);
      });
  }

  async ensureCategories(): Promise<void> {
    for (const cat of this.config.filesCategory) {
      await fs.ensureDir(path.join(this.targetBaseDir, cat));
    }
  }

  getCategory(ext: string): string | undefined {
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
