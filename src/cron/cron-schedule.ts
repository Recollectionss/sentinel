import {
  CONFIG_ALLOW_NEW_EVENT,
  configService,
} from '../core/services/config-service';
import nodeCron from 'node-cron';
import { DownloadSorterWorker } from '../workers/download-sorter.worker';
import { logger } from '../core/services/logger';

export class CronSchedule {
  constructor(private readonly downloadSorter: DownloadSorterWorker) {
    this.readConfigUpdate();
  }

  private readConfigUpdate(): void {
    configService.on(CONFIG_ALLOW_NEW_EVENT, (): void => {
      this.bootstrap();
    });
  }

  private bootstrap(): void {
    if (configService.get().sortedRules.allowDirNew) {
      logger.log('start cron');
      nodeCron.schedule('*/10 * * * * *', () =>
        this.downloadSorter.readDirNew(),
      );
    } else {
      logger.log('start timeout');
      setTimeout(() => this.downloadSorter.readDirNew(), 60);
    }
  }
}
