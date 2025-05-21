import chalk from "chalk";

export const defaultPreset = {
  typography: {
    bold: (str: string) => chalk.bold(str),
  },
  colors: {
    debug: (str: string) => chalk.bgCyan.white(str),
    warning: (str: string) => chalk.bgGray.bold.white(str),
    black: (str: string) => chalk.black(str),
  },
};

const PRESETS = {
  default: defaultPreset,
};

type AvailablePresets = keyof typeof PRESETS;
export const getCurrentPreset = (presetName?: string) =>
  PRESETS[presetName as AvailablePresets] || defaultPreset;
