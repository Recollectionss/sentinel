import { DaemonAbstract } from '../core/abstract/daemon.abstract';
import { WorkerAbstract } from '../core/abstract/worker.abstract';
import { logger } from '../core/services/logger';
import { DownloadSorterWorker } from '../workers/download-sorter.worker';
import { FileSorter } from '../utils/file-sorter';
import { DownloadWatcherWorker } from '../workers/download-watcher.worker';
import { TagService } from '../core/services/tag-service';
import { ensureCategories } from '../utils/ensure-categories';

export class Daemon extends DaemonAbstract {
  protected readonly downloadSorterWorker: WorkerAbstract;
  protected readonly downloadWatcherWorker: WorkerAbstract;
  constructor() {
    super();
    const tagService = new TagService();
    const sorter = new FileSorter(tagService);
    this.downloadSorterWorker = new DownloadSorterWorker(sorter);
    this.downloadWatcherWorker = new DownloadWatcherWorker(sorter);
  }

  protected async init(): Promise<void> {
    logger.log('Initializing...');
    await ensureCategories();
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
