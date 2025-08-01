import { WorkerAbstract } from '../core/abstract/worker.abstract';
import { FileSorter } from '../utils/file-sorter';
import os from 'node:os';
import fs, { Stats } from 'fs-extra';
import path from 'node:path';
import * as chokidar from 'chokidar';
import { config } from '../core/services/config-service';
import { logger } from '../core/services/logger';

export class DownloadWatcherWorker extends WorkerAbstract {
  private readonly downloadsDir: string;
  private readonly targetBaseDir: string;
  private watcher: chokidar.FSWatcher | null = null;

  constructor(private readonly fileSorter: FileSorter) {
    super();
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
    logger.log('Start watching');
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
    logger.log('Watcher stopped');
    await this.watcher?.close();
  }

  async ensureCategories(): Promise<void> {
    for (const cat of Object.keys(config.sortedRules.rules)) {
      await fs.ensureDir(path.join(this.targetBaseDir, cat));
    }
  }
}
