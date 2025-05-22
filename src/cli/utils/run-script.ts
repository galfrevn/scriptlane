import type { ScriptsConfiguration } from "@/cli/configuration/types";

import { log } from "@/cli/utils/log";

import { spawn } from "node:child_process";

type RunScriptOptions = {
  scripts: ScriptsConfiguration;
};

export function runScript(scriptName: string, configuration: RunScriptOptions) {
  const { scripts } = configuration;

  const scriptKey = Object.keys(scripts).find(
    (key) =>
      key.toLowerCase() === scriptName.toLowerCase() ||
      scripts[key].alias?.toLowerCase() === scriptName.toLowerCase(),
  );

  if (!scriptKey) {
    log(`➜ Script "${scriptName}" not found in scripts.config.ts`, "ERROR");
    process.exit(1);
  }

  const script = scripts[scriptKey];
  log(`➜ Running script "${scriptKey}":\n${script.cmd}\n`, "DEBUG");
  const child = spawn(script.cmd, { stdio: "inherit", shell: true });
  child.on("exit", (code) => process.exit(code ?? 1));
  return;
}
