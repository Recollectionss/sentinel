import { WorkerAbstract } from '../core/abstract/worker.abstract';
import fs from 'fs-extra';
import * as os from 'node:os';
import { FileSorter } from '../utils/file-sorter';
import { config } from '../core/services/config-service';
import { logger } from '../core/services/logger';

export class DownloadSorterWorker extends WorkerAbstract {
  private readonly downloadsDir: string;

  constructor(private readonly fileSorter: FileSorter) {
    super();
    this.downloadsDir = os.homedir() + config.watch.main;
  }

  async up() {
    logger.log(`Start sorting ${this.downloadsDir}`);
    fs.readdir(this.downloadsDir, (err, files) => {
      files.forEach((file) => {
        fs.stat(file, (err, stats) => {
          this.fileSorter.sort(`${this.downloadsDir}/${file}`, stats);
        });
      });
    });
  }

  down(): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
