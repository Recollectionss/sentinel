import { logger } from '../core/services/logger';

export class Queue<T extends unknown[]> {
  private queue: T[] = [];
  private resolver?: () => void;
  private running: boolean = false;

  constructor(private handle: (...args: T) => Promise<void>) {}

  add(...args: T): void {
    this.queue.push(args);

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
        await this.handle(...args);
      } catch (e) {
        //TODO: need add new try move file
        logger.error(e as Error);
      }
    }
  }

  stop(): void {
    this.running = false;
    this.resolver?.();
  }
}
