import { Queue } from '../../utils/queue';

describe('Queue', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should process queue item', async () => {
    const handler = jest.fn().mockResolvedValue(undefined);

    const queue = new Queue(handler);

    queue.add('file.txt');

    queue.start();

    await new Promise((r) => setTimeout(r, 100));

    expect(handler).toHaveBeenCalled();
  });

  test('should retry failed task', async () => {
    const handler = jest
      .fn()
      .mockRejectedValueOnce(new Error())
      .mockResolvedValueOnce(undefined);

    const queue = new Queue(handler);

    queue.add('file.txt');

    queue.start();

    await new Promise((r) => setTimeout(r, 300));

    expect(handler).toHaveBeenCalledTimes(2);
  });

  test('should stop after max retries', async () => {
    const handler = jest.fn().mockRejectedValue(new Error());

    const queue = new Queue(handler);

    queue.add('file.txt');

    queue.start();

    await new Promise((r) => setTimeout(r, 1000));

    expect(handler).toHaveBeenCalledTimes(4);
  });

  test('should process queue in FIFO order', async () => {
    const calls: string[] = [];

    const handler = jest.fn(async (file: string) => {
      calls.push(file);
    });

    const queue = new Queue(handler);

    queue.add('1.txt');
    queue.add('2.txt');
    queue.add('3.txt');

    queue.start();

    await new Promise((r) => setTimeout(r, 300));

    expect(calls).toEqual(['1.txt', '2.txt', '3.txt']);
  });

  test('should stop queue', async () => {
    const handler = jest.fn();

    const queue = new Queue(handler);

    queue.stop();

    expect((queue as any).running).toBe(false);
  });
});
