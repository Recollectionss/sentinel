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

describe('FileSorter', () => {
  let sorter: FileSorter;

  beforeEach(() => {
    (configService.get as jest.Mock).mockReturnValue({
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
            type: ['.png', '.jpg'],
            compiledRegExp: [],
          },
          Archives: {
            color: '1',
            type: ['.zip'],
            compiledRegExp: [],
          },
        },
      },
    });
    sorter = new FileSorter({
      applyTag: jest.fn(),
    } as unknown as TagService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should return Images category', () => {
    expect((sorter as any).getCategory('photo.png')).toBe('Images');
  });

  test('should return Archives category', () => {
    expect((sorter as any).getCategory('backup.zip')).toBe('Archives');
  });

  test('should return Other for unknown extension', () => {
    expect((sorter as any).getCategory('virus.exe')).toBe('Other');
  });

  test('should throw error for unknown extension', () => {
    (configService.get as jest.Mock).mockReturnValue({
      sortedRules: {
        allowDirNew: false,
        allowOtherDir: false,
        useRegExp: false,
        regExpPriority: [],
        rules: {},
      },
    });

    expect(() => (sorter as any).getCategory('test.xyz')).toThrow();
  });

  test('should use regexp priority', () => {
    (configService.get as jest.Mock).mockReturnValue({
      sortedRules: {
        allowDirNew: false,
        allowOtherDir: true,
        useRegExp: true,
        regExpPriority: ['Zoom'],
        rules: {
          Zoom: {
            color: '2',
            type: [],
            compiledRegExp: [/^\d{4}-\d{2}-\d{2}/],
          },
        },
      },
    });

    expect((sorter as any).getCategory('2025-05-12 Meeting.mp4')).toBe('Zoom');
  });

  test('should ignore system file', async () => {
    await expect(
      (sorter as any).validateFile(
        '.DS_Store',
        '/Downloads/.DS_Store',
        undefined,
      ),
    ).rejects.toThrow('must be ignored');
  });

  test('should remove empty directory', async () => {
    const stat = {
      isDirectory: () => true,
    };

    (fs.readdir as unknown as jest.Mock).mockResolvedValue([]);

    await (sorter as any).validateFile('Temp', '/Downloads/Temp', stat as any);

    expect(fs.remove).toHaveBeenCalled();
  });

  test('should move file', async () => {
    (fs.move as unknown as jest.Mock).mockResolvedValue(undefined);

    await sorter.moveFile('/Downloads/photo.png', undefined);

    expect(fs.move).toHaveBeenCalled();
  });

  test('should rename file if already exists', async () => {
    (fs.move as jest.Mock)
      .mockRejectedValueOnce(new Error())
      .mockResolvedValueOnce(undefined);

    await (sorter as any).move(
      '/Downloads/photo.png',
      '/Downloads/Sentinel/Images/photo.png',
      'Images',
      'photo.png',
    );

    expect(fs.move).toHaveBeenCalledTimes(2);
  });
});
