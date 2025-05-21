interface CliConfigurationContext {
  configurationFilePath?: string;
  isDebugMode?: boolean;
  isHidingPackageJsonScripts?: boolean;
  currentPreset?: string;
}

let _runningContext: CliConfigurationContext = {
  isDebugMode: false,
  isHidingPackageJsonScripts: false,
  configurationFilePath: undefined,
  currentPreset: "default",
};

export function setRunningContext(context: CliConfigurationContext): void {
  _runningContext = context;
}

export function getRunningContext(): CliConfigurationContext {
  return _runningContext;
}
