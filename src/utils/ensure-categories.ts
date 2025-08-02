import fs from 'fs-extra';
import path from 'node:path';
import os from 'node:os';
import { configService } from '../core/services/config-service';

export async function ensureCategories() {
  for (const cat of Object.keys(configService.get().sortedRules.rules)) {
    await fs.ensureDir(
      path.join(os.homedir() + configService.get().watch.main + '/Sentinel', cat),
    );
  }
}
