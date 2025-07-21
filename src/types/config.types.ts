export type Config = {
  watch: ConfigWatchT;
  ignored: ConfigIgnoredT;
  sortedRules: ConfigSortedRulesT;
};

export type ConfigWatchT = {
  main: string;
  optionals: string[];
};

export type ConfigIgnoredT = {
  required: string[];
  allowMoreIgnored: boolean;
  otherIgnored: string[];
};

export type ConfigSortedRulesT = {
  fileRules: ConfigFileRulesT;
  allowOtherDir: boolean;
  ignoreSentinel: boolean;
};

export type ConfigFileRulesT = {
  [key: string]: string[];
};
