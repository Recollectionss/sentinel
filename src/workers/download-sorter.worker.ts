import { WorkerAbstract } from '../core/abstract/worker.abstract';
import fs from 'fs-extra';
import { FileSorter } from '../utils/file-sorter';
import { config } from '../core/services/config-service';
import { logger } from '../core/services/logger';

export class DownloadSorterWorker extends WorkerAbstract {
  constructor(private readonly fileSorter: FileSorter) {
    super();
  }

  async up() {
    logger.log(`Start sorting ${config.watch.main}`);
    fs.readdir(config.watch.main, (err, files) => {
      files.forEach((file) => {
        fs.stat(file, (err, stats) => {
          this.fileSorter.sort(`${config.watch.main}/${file}`, stats);
        });
      });
    });
  }

  down(): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
