import { DaemonAbstract } from '../core/daemon.abstract';
import { LoggerAbstract } from '../core/logger.abstract';
import { WorkerAbstract } from '../core/worker.abstract';

export class Daemon extends DaemonAbstract {
  constructor(
    logger: LoggerAbstract,
    private readonly downloadSorterWorker: WorkerAbstract,
  ) {
    super(logger);
  }
  protected async init(): Promise<void> {
    this.logger.log('Initializing...');
    await this.downloadSorterWorker.init();
  }
}
