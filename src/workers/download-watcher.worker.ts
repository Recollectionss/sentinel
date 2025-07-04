import { WorkerAbstract } from '../core/abstract/worker.abstract';

export class DownloadWatcherWorker extends WorkerAbstract {
  init(): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
