#!/usr/bin/env node

import { Command } from 'commander';
import { DaemonManager } from './daemon-manager';

const program = new Command();

program.name('sentinel');

program.command('start').action(() => {
  DaemonManager.start();
});

program.command('stop').action(() => {
  DaemonManager.stop();
});

program.command('restart').action(() => {
  DaemonManager.stop();
  DaemonManager.start();
});

program.command('status').action(() => {
  DaemonManager.status();
});

program.parse();
