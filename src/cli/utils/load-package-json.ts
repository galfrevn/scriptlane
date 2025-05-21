import path from "node:path";
import fs from "node:fs/promises";

import type { CustomScript } from "@/cli/configuration/types";

type PackageJsonScripts = Record<string, string>;
type ParsedPackageJsonScripts = Record<string, CustomScript>;

export async function loadPackageJsonScripts(): Promise<ParsedPackageJsonScripts> {
  const packageJsonPath = path.resolve(process.cwd(), "package.json");
  const packageJsonRaw = await fs.readFile(packageJsonPath, "utf-8");

  const packageJson = JSON.parse(packageJsonRaw);
  const packageJsonScripts = (packageJson.scripts || {}) as PackageJsonScripts;

  return Object.fromEntries(
    Object.entries(packageJsonScripts).map(([name, cmd]) => [name, { cmd }]),
  );
}
