import { getRunningContext } from "@/cli/context";

import { renderScriptSelectionUI } from "@/cli/ui/selection";

export async function run() {
  const context = getRunningContext();

  const { loadPackageJsonScripts } = await import("./utils/load-package-json");
  const { loadConfigurationFile } = await import("./utils/load-config-file");

  let packageJsonScripts = await loadPackageJsonScripts();
  const configuredScripts = await loadConfigurationFile(
    context.configurationFilePath,
  );

  if (context.isHidingPackageJsonScripts) {
    packageJsonScripts = {};
  }

  const availableScriptsToExecute = {
    ...packageJsonScripts,
    ...configuredScripts,
  };

  if (context.directScriptToRun) {
    const { runScript } = await import("./utils/run-script");
    return runScript(context.directScriptToRun, {
      scripts: availableScriptsToExecute,
    });
  }

  await renderScriptSelectionUI({
    scripts: availableScriptsToExecute,
    customization: {
      showGroups: true,
      showScriptName: true,
      showScriptDescription: true,
    },
  });
}
