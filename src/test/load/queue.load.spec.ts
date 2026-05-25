import { Queue } from '../../utils/queue';

describe('Queue load testing', () => {
  test('should process 1000 queue tasks', async () => {
    let processed = 0;

    const handler = jest.fn(async () => {
      processed++;
    });

    const queue = new Queue<[filePath: string]>(handler);

    queue.start();

    for (let i = 0; i < 1000; i++) {
      queue.add(`file-${i}.png`);
    }

    await new Promise((resolve) => setTimeout(resolve, 3000));

    expect(processed).toBe(1000);
  }, 10000);

  test('should process tasks without memory leaks', async () => {
    const handler = jest.fn(async () => {});

    const queue = new Queue<[filePath: string]>(handler);

    queue.start();

    for (let i = 0; i < 5000; i++) {
      queue.add(`load-${i}.png`);
    }

    await new Promise((resolve) => setTimeout(resolve, 5000));

    expect(handler).toHaveBeenCalledTimes(5000);
  }, 15000);

  test('should handle retry storm', async () => {
    let counter = 0;

    const handler = jest.fn(async () => {
      counter++;

      if (counter < 300) {
        throw new Error('temporary fail');
      }
    });

    const queue = new Queue<[filePath: string]>(handler);

    queue.start();

    for (let i = 0; i < 100; i++) {
      queue.add(`retry-${i}.png`);
    }

    await new Promise((resolve) => setTimeout(resolve, 6000));

    expect(handler).toHaveBeenCalled();
  }, 20000);
});
