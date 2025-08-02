import { WorkerAbstract } from '../core/abstract/worker.abstract';
import { FileSorter } from '../utils/file-sorter';
import { Stats } from 'fs-extra';
import * as chokidar from 'chokidar';
import { config } from '../core/services/config-service';
import { logger } from '../core/services/logger';

export class DownloadWatcherWorker extends WorkerAbstract {
  private watcher: chokidar.FSWatcher | null = null;

  constructor(private readonly fileSorter: FileSorter) {
    super();
  }

  async up() {
    if (this.watcher) {
      return;
    }
    logger.log('Start watching');
    this.watcher = chokidar
      .watch(config.watch.main, {
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
}
