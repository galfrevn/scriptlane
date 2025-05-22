import yargs from "yargs";
import { hideBin } from "yargs/helpers";

export function parseArguments(argv: NodeJS.Process["argv"] = process.argv) {
  return yargs(hideBin(argv))
    .option("config", {
      alias: "c",
      type: "string",
      description: "Path to the configuration file",
    })
    .option("debug", {
      alias: "d",
      type: "boolean",
      description: "Enable debug logging",
      default: false,
    })
    .option("preset", {
      alias: "p",
      type: "string",
      description: "Theme preset for the CLI",
      default: "default",
      choices: ["default"],
    })
    .option("hide-scripts", {
      alias: "hs",
      type: "boolean",
      description: "Hide package.json scripts",
      default: false,
    })
    .option("script", {
      alias: "s",
      type: "string",
      describe: "Run a specific script by alias/name and exit",
    })
    .help()
    .alias("help", "h")
    .parseSync();
}
