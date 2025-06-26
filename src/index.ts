import { Daemon } from './deamon/daemon';
import { Logger } from './logger/logger';
import { DownloadSorterWorker } from './workers/download-sorter.worker';
const logger = new Logger();
new Daemon(logger, new DownloadSorterWorker(logger)).start();
