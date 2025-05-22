#!/usr/bin/env node

import { parseArguments } from "@/args/main";

import { run } from "@/cli/main";
import { setRunningContext } from "@/cli/context";

const args = parseArguments(process.argv);

setRunningContext({
  isDebugMode: args.debug,
  isHidingPackageJsonScripts: args.hideScripts,
  configurationFilePath: args.config,
  currentPreset: args.preset,
  directScriptToRun: args.script,
});

run();

process.on("SIGINT", () => {
  console.log("\nGracefully shutting down...");
  process.exit(0);
});

export type { ScriptsConfiguration } from '@/cli/configuration/types';

