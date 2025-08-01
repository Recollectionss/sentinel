import { WorkerAbstract } from '../core/abstract/worker.abstract';
import * as path from 'node:path';
import fs from 'fs-extra';
import * as os from 'node:os';
import { FileSorter } from '../utils/file-sorter';
import { logger } from '../core/services/logger';
import { config } from '../core/services/config-service';

export class DownloadSorterWorker extends WorkerAbstract {
  private readonly downloadsDir: string;
  private readonly targetBaseDir: string;

  constructor(private readonly fileSorter: FileSorter) {
    super(logger);
    this.downloadsDir = os.homedir() + config.watch.main;
    this.targetBaseDir = `${this.downloadsDir}/Sentinel`;
  }

  async init(): Promise<void> {
    await this.ensureCategories();
  }

  async up() {
    this.logger.log(`Start sorting ${this.downloadsDir}`);
    fs.readdir(this.downloadsDir, (err, files) => {
      files.forEach((file) => {
        fs.stat(file, (err, stats) => {
          this.fileSorter.sort(`${this.downloadsDir}/${file}`, stats);
        });
      });
    });
  }

  async ensureCategories(): Promise<void> {
    for (const cat of Object.keys(config.sortedRules.rules)) {
      await fs.ensureDir(path.join(this.targetBaseDir, cat));
    }
  }

  down(): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
