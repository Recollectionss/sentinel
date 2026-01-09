import { WorkerAbstract } from '../core/abstract/worker.abstract';
import { Stats } from 'fs-extra';
import * as chokidar from 'chokidar';
import { configService } from '../core/services/config-service';
import { logger } from '../core/services/logs/logger';
import { Queue } from '../utils/queue';

export class DownloadWatcherWorker extends WorkerAbstract {
  private watcher: chokidar.FSWatcher | null = null;

  constructor(
    private readonly sortingQueue: Queue<
      [filePath: string, stat: Stats | undefined]
    >,
  ) {
    super();
  }

  async up() {
    if (this.watcher) {
      return;
    }
    logger.log('Start watching');
    this.watcher = chokidar
      .watch(
        [configService.get().watch.main, ...configService.get().watch.optional],
        {
          ignoreInitial: true,
          depth: 0,
          persistent: true,
          awaitWriteFinish: {
            stabilityThreshold: 5000,
            pollInterval: 100,
          },
        },
      )
      .on('add', async (filePath: string, stat: Stats | undefined) => {
        this.sortingQueue.add(filePath, stat);
      })
      .on('addDir', async (filePath: string, stat: Stats | undefined) => {
        this.sortingQueue.add(filePath, stat);
      });
  }

  async down() {
    logger.log('Watcher stopped');
    await this.watcher?.close();
  }
}
