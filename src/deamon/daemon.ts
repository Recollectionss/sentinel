import { DaemonAbstract } from '../core/abstract/daemon.abstract';
import { WorkerAbstract } from '../core/abstract/worker.abstract';
import { Logger } from '../logger/logger';
import { DownloadSorterWorker } from '../workers/download-sorter.worker';

export class Daemon extends DaemonAbstract {
  protected readonly downloadSorterWorker: WorkerAbstract;
  constructor() {
    const logger = new Logger();
    super(logger);
    this.downloadSorterWorker = new DownloadSorterWorker(logger, this.config);
  }
  protected async init(): Promise<void> {
    this.logger.log('Initializing...');
    await this.downloadSorterWorker.init();
  }
}
