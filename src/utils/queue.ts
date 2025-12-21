import { logger } from '../core/services/logger';

type QueueItem<T extends unknown[]> = {
  data: T;
  tries: number;
};

export class Queue<T extends unknown[]> {
  private queue: QueueItem<T>[] = [];
  private resolver?: () => void;
  private running: boolean = false;

  constructor(private handle: (...args: T) => Promise<void>) {}

  add(...args: T): void {
    this.queue.push({ data: args, tries: 0 });

    if (this.resolver) {
      this.resolver();
      this.resolver = undefined;
    }
  }

  start(): void {
    this.work();
  }

  private async work(): Promise<void> {
    if (this.running) return;
    this.running = true;

    while (this.running) {
      if (this.queue.length === 0) {
        await new Promise<void>((resolve) => {
          this.resolver = resolve;
        });
        continue;
      }
      const args = this.queue.shift();

      if (typeof args === 'undefined') {
        logger.log('Element in queue undefiend');
        continue;
      }

      try {
        await this.handle(...args.data);
      } catch (e) {
        logger.error(e as Error);

        if (args.tries < 3) {
          this.queue.push({ data: args.data, tries: args.tries + 1 });
        } else {
          logger.log(`Cannot move ${args.data} with 3 tries`);
        }
      }
    }
  }

  stop(): void {
    this.running = false;
    this.resolver?.();
  }
}
