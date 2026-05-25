import fs from 'fs-extra';
import { FileSorter } from '../../utils/file-sorter';
import { TagService } from '../../core/services/tag-service';
import { configService } from '../../core/services/config-service';

jest.mock('fs-extra');

jest.mock('../../core/services/config-service', () => ({
  configService: {
    get: jest.fn(),
  },
}));

describe('FileSorter load testing', () => {
  let sorter: FileSorter;

  beforeEach(() => {
    (configService.get as unknown as jest.Mock).mockReturnValue({
      watch: {
        main: '/Downloads',
      },
      ignored: {
        always: ['.DS_Store', 'Sentinel'],
        custom: [],
      },
      sortedRules: {
        allowDirNew: false,
        allowOtherDir: true,
        useRegExp: false,
        regExpPriority: [],
        rules: {
          Images: {
            color: '4',
            type: ['.png'],
            compiledRegExp: [],
          },
        },
      },
    });

    sorter = new FileSorter({
      applyTag: jest.fn(),
    } as unknown as TagService);

    (fs.move as unknown as jest.Mock).mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should sort 1000 files', async () => {
    const promises: Promise<void>[] = [];

    for (let i = 0; i < 1000; i++) {
      promises.push(sorter.moveFile(`/Downloads/test-${i}.png`, undefined));
    }

    await Promise.all(promises);

    expect(fs.move).toHaveBeenCalledTimes(1000);
  }, 15000);

  test('should process duplicate filenames', async () => {
    (fs.move as unknown as jest.Mock)
      .mockRejectedValueOnce(new Error())
      .mockResolvedValue(undefined);

    await sorter.moveFile('/Downloads/test.png', undefined);

    expect(fs.move).toHaveBeenCalledTimes(2);
  }, 10000);
});
