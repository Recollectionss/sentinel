import { WorkerAbstract } from '../core/abstract/worker.abstract';
import { LoggerAbstract } from '../core/abstract/logger.abstract';
import { Config } from '../core/types/config.types';
import { FileSorter } from '../utils/file-sorter';
import os from 'node:os';
import fs, { Stats } from 'fs-extra';
import path from 'node:path';
import * as chokidar from 'chokidar';

export class DownloadWatcherWorker extends WorkerAbstract {
  private readonly downloadsDir: string;
  private readonly targetBaseDir: string;
  private watcher: chokidar.FSWatcher | null = null;

  constructor(
    logger: LoggerAbstract,
    private readonly config: Config,
    private readonly fileSorter: FileSorter,
  ) {
    super(logger);
    this.downloadsDir = os.homedir() + config.watch.main;
    this.targetBaseDir = `${this.downloadsDir}/Sentinel`;
  }

  async init(): Promise<void> {
    await this.ensureCategories();
  }

  async up() {
    if (this.watcher) {
      return;
    }
    this.logger.log('Start watching');
    this.watcher = chokidar
      .watch(this.downloadsDir, {
        ignoreInitial: true,
        depth: 0,
        persistent: true,
      })
      .on('add', async (filePath: string, stat: Stats | undefined) => {
        await this.fileSorter.sort(filePath, stat);
      });
  }
  async down() {
    this.logger.log('Watcher stopped');
    await this.watcher?.close();
  }

  async ensureCategories(): Promise<void> {
    for (const cat of Object.keys(this.config.sortedRules.rules)) {
      await fs.ensureDir(path.join(this.targetBaseDir, cat));
    }
  }
}
