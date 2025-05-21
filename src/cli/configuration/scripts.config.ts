import type { ScriptsConfiguration } from "@/cli/configuration/types";

const scriptsConfiguration: ScriptsConfiguration = {
  "Generate migrations": {
    cmd: 'npx prisma generate dev',
    group: "Database",
    description: "This is a command to show a basic hello world!",
  },
  "Apply migrations": {
    cmd: 'npx prisma migrate deploy',
    group: "Database",
    description: "This is a command to show a basic hello world!",
  },
  "Open studio": {
    cmd: 'npx prisma studio',
    group: "Database",
    description: "This is a command to show a basic hello world!",
  },
  "Run linter": {
    cmd: 'npx eslint .',
    group: "Code Quality",
    description: "This is a command to show a basic hello world!",
  },
  "Run prettier": {
    cmd: 'npx prettier .',
    group: "Code Quality",
    description: "This is a command to show a basic hello world!",
  },
  "Run tests": {
    cmd: 'npx jest',
    group: "Testing",
    description: "This is a command to show a basic hello world!",
  },
};

export default scriptsConfiguration;
