import path from "node:path";
import url from "node:url";

import { log } from "@/cli/utils/log";

import type { ScriptsConfiguration } from "@/cli/configuration/types";

const configurationFilename = "scripts.config.ts";
const fallbackConfigurationFilePathname = `./${configurationFilename}`;

export async function loadConfigurationFile(
  pathname: string = fallbackConfigurationFilePathname,
) {
  log(`Loading configuration file from: "${pathname}"`, "DEBUG");

  try {
    const configurationFilePathname = path.resolve(process.cwd(), pathname);
    const configurationFile = url.pathToFileURL(configurationFilePathname).href;
    const module = await import(configurationFile);

    const amountOfLoadedScripts = Object.keys(module.default).length;

    log(
      `Loaded ${amountOfLoadedScripts} script${
        amountOfLoadedScripts > 1 ? "s" : ""
      } successfully!`,
      "DEBUG",
    );

    return (module.default as ScriptsConfiguration) || {};
  } catch (error) {
    log(
      `Failed to load configuration file, falling back to default configuration.`,
      "WARNING",
    );

    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {};
  }
}
