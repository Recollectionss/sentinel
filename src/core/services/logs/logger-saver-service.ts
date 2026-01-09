import fs from 'fs-extra';
import { LogData } from '../../types/log.types';
import path from 'node:path';

export class LoggerSaverService {
  private logsDir = path.join(__dirname, '../../../../public/logs');

  async saveLogs(data: LogData): Promise<void> {
    await fs.ensureDir(this.logsDir);
    const date = new Date().toISOString().replace(/:/g, '-');
    const fileName = path.join(this.logsDir, `logs-${date}.json`);

    await fs
      .writeJSON(fileName, {
        app: 'Sentinel',
        created_at: date,
        ...data,
      })
      .catch((err) => {
        console.error('Failed to save log:', err);
      });
  }
}

export const loggerSaverService = new LoggerSaverService();
