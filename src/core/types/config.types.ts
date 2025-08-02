import { TagColors } from '../enum/tag-colors.enum';

export type Config = {
  watch: ConfigWatchT;
  ignored: ConfigIgnoredT;
  sortedRules: ConfigSortedRulesT;
};

export type ConfigWatchT = {
  main: string;
  optional: string[];
};

export type ConfigIgnoredT = {
  always: string[];
  custom: string[];
};

export type ConfigSortedRulesT = {
  rules: ConfigFileRulesT;
  allowOtherDir: boolean;
  allowDirNew: boolean;
};

export type ConfigFileRulesT = {
  [key: string]: {
    color: TagColors;
    type: string[];
  };
};
