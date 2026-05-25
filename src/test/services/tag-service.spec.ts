import { EventEmitter } from 'events';
import { spawn } from 'child_process';
import { TagService } from '../../core/services/tag-service';

jest.mock('child_process');

describe('TagService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should generate plist xml', () => {
    const service = new TagService();

    const xml = (service as any).getPlistXML('Images', 4);

    expect(xml).toContain('Images');
    expect(xml).toContain('4');
  });

  test('should apply tag successfully', async () => {
    const stderr = new EventEmitter();
    const proc = new EventEmitter() as any;

    proc.stderr = stderr;

    (spawn as jest.Mock).mockReturnValue(proc);

    const service = new TagService();

    const promise = service.applyTag('/Downloads/file.png', 'Images', 4);

    proc.emit('close', 0);

    await expect(promise).resolves.toBeUndefined();
  });

  test('should reject if xattr failed', async () => {
    const stderr = new EventEmitter();
    const proc = new EventEmitter() as any;

    proc.stderr = stderr;

    (spawn as jest.Mock).mockReturnValue(proc);

    const service = new TagService();

    const promise = service.applyTag('/Downloads/file.png', 'Images', 4);

    proc.emit('close', 1);

    await expect(promise).rejects.toThrow();
  });
});
