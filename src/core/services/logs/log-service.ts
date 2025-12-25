import fs from 'fs-extra';
import { LogData } from '../../types/log.types';

class LogService {
  async saveLogs(data: LogData): Promise<void> {
    const date: string = new Date().toISOString();
    const fileName: string = await this.createNewLogFile(date);
    fs.writeJSONSync(fileName, {
      app: 'Sentinel',
      created_at: date,
      ...data,
    });
  }

  private async createNewLogFile(date: string): Promise<string> {
    const fileName: string = `../../../../public/logs/logs-${date}.json`;
    await fs.createFile(fileName);
    return fileName;
  }
}

export const logService = new LogService();
