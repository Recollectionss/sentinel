import { DaemonAbstract } from '../core/abstract/daemon.abstract';
import { WorkerAbstract } from '../core/abstract/worker.abstract';
import { Logger } from '../logger/logger';
import { DownloadSorterWorker } from '../workers/download-sorter.worker';
import { FileSorter } from '../utils/file-sorter';
import { DownloadWatcherWorker } from '../workers/download-watcher.worker';

export class Daemon extends DaemonAbstract {
  protected readonly downloadSorterWorker: WorkerAbstract;
  protected readonly downloadWatcherWorker: WorkerAbstract;
  constructor() {
    const logger = new Logger();
    super(logger);
    const sorter = new FileSorter(logger, this.config);
    this.downloadSorterWorker = new DownloadSorterWorker(
      logger,
      this.config,
      sorter,
    );
    this.downloadWatcherWorker = new DownloadWatcherWorker(
      logger,
      this.config,
      sorter,
    );
  }

  async init(): Promise<void> {
    this.logger.log('Initializing...');
    await this.downloadSorterWorker.init();
    await this.downloadWatcherWorker.init();
  }

  async upWatcher() {
    await this.downloadWatcherWorker.up();
  }

  async downWatcher() {
    await this.downloadWatcherWorker.down();
  }

  async upSorting(): Promise<void> {
    await this.downloadSorterWorker.up();
  }
}
