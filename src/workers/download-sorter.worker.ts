import { WorkerAbstract } from '../core/abstract/worker.abstract';
import fs, { Stats } from 'fs-extra';
import { logger } from '../core/services/logger';
import os from 'node:os';
import path from 'node:path';
import { configService } from '../core/services/config-service';
import { Queue } from '../utils/queue';

export class DownloadSorterWorker extends WorkerAbstract {
  constructor(
    private readonly sortingQueue: Queue<
      [filePath: string, stat: Stats | undefined]
    >,
  ) {
    super();
  }

  async up() {
    this.readDir(configService.get().watch.main);
  }

  async readDirNew() {
    this.readDir(path.resolve(os.homedir(), 'Downloads', 'Sentinel', 'New'));
  }

  private readDir(path: string) {
    logger.log(`Start sorting ${configService.get().watch.main}`);
    fs.readdir(path, (err, files) => {
      files.forEach((file) => {
        console.log(file);
        fs.stat(file, (err, stats) => {
          this.sortingQueue.add(`${path}/${file}`, stats);
        });
      });
    });
  }

  down(): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
