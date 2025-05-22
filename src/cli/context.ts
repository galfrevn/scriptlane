interface CliConfigurationContext {
  configurationFilePath?: string;
  isDebugMode?: boolean;
  isHidingPackageJsonScripts?: boolean;
  currentPreset?: string;
  directScriptToRun?: string;
}

let _runningContext: CliConfigurationContext = {
  isDebugMode: false,
  isHidingPackageJsonScripts: false,
  configurationFilePath: undefined,
  currentPreset: "default",
  directScriptToRun: undefined,
};

export function setRunningContext(context: CliConfigurationContext): void {
  _runningContext = context;
}

export function getRunningContext(): CliConfigurationContext {
  return _runningContext;
}
