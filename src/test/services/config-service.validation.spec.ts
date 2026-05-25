import fs from 'fs-extra';
import { ConfigServiceValidation } from '../../core/services/config-service.validation';

jest.mock('fs-extra');

describe('ConfigServiceValidation', () => {
  beforeEach(() => {
    (fs.existsSync as unknown as jest.Mock).mockReturnValue(true);

    (fs.readFileSync as unknown as jest.Mock).mockReturnValue(
      JSON.stringify({
        watch: {
          main: '/Downloads',
          optional: [],
        },
        ignored: {
          always: ['.DS_Store', 'Sentinel'],
          custom: [],
        },
        sortedRules: {
          allowOtherDir: true,
          allowDirNew: false,
          useRegExp: false,
          regExpPriority: [],
          rules: {
            Images: {
              color: '4',
              type: ['.png'],
              regExp: [],
            },
          },
        },
      }),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should validate config', () => {
    const validator = new ConfigServiceValidation();

    expect(validator.validate()).toBeDefined();
  });

  test('should throw if config not exists', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);

    expect(() => {
      new ConfigServiceValidation();
    }).toThrow();
  });

  test('should throw if main dir missing', () => {
    const validator = new ConfigServiceValidation();

    (validator as any).config.watch.main = '';

    expect(() => {
      (validator as any).mainExist();
    }).toThrow();
  });

  test('should throw if no rules', () => {
    const validator = new ConfigServiceValidation();

    (validator as any).config.sortedRules.rules.Images.type = [];

    expect(() => {
      (validator as any).filesAndRules();
    }).toThrow();
  });

  test('should throw for invalid color', () => {
    const validator = new ConfigServiceValidation();

    (validator as any).config.sortedRules.rules.Images.color = 'INVALID';

    expect(() => {
      (validator as any).filesAndRules();
    }).toThrow();
  });

  test('should throw if required ignored files missing', () => {
    const validator = new ConfigServiceValidation();

    (validator as any).config.ignored.always = [];

    expect(() => {
      (validator as any).ignored();
    }).toThrow();
  });
});
