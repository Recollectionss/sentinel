import { config } from '../core/services/config-service';
import fs from 'fs-extra';
import path from 'node:path';
import os from 'node:os';

export async function ensureCategories() {
  for (const cat of Object.keys(config.sortedRules.rules)) {
    await fs.ensureDir(
      path.join(os.homedir() + config.watch.main + '/Sentinel', cat),
    );
  }
}
