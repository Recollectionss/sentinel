import fs from 'fs-extra';
import path from 'node:path';
import { spawn } from 'child_process';

const PID_PATH = path.resolve(process.cwd(), '.sentinel.pid');

export class DaemonManager {
  static start(): void {
    if (fs.existsSync(PID_PATH)) {
      console.log('Sentinel already running');
      return;
    }

    const child = spawn(process.execPath, ['dist/index.js'], {
      detached: true,
      stdio: 'ignore',
    });

    child.unref();

    fs.writeFileSync(PID_PATH, child.pid!.toString());

    console.log(`Sentinel started PID=${child.pid}`);
  }

  static stop(): void {
    if (!fs.existsSync(PID_PATH)) {
      console.log('Sentinel not running');
      return;
    }

    const pid = Number(fs.readFileSync(PID_PATH, 'utf-8'));

    process.kill(pid, 'SIGTERM');

    fs.removeSync(PID_PATH);

    console.log('Sentinel stopped');
  }

  static status(): void {
    if (!fs.existsSync(PID_PATH)) {
      console.log('Sentinel stopped');
      return;
    }

    const pid = Number(fs.readFileSync(PID_PATH, 'utf-8'));

    try {
      process.kill(pid, 0);
      console.log(`Sentinel running PID=${pid}`);
    } catch {
      console.log('Dead process');
      fs.removeSync(PID_PATH);
    }
  }
}
