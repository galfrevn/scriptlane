import type { ScriptsConfiguration } from "@/cli/configuration/types";

const scriptsConfiguration: ScriptsConfiguration = {
  "Generate Prisma types": {
    cmd: "npx prisma generate",
    group: "Database",
    description: "Generates Prisma Client based on your schema",
  },
  "Run migrations": {
    cmd: "npx prisma migrate dev",
    group: "Database",
    description: "Runs pending database migrations in development mode",
  },
  "Deploy migrations": {
    cmd: "npx prisma migrate deploy",
    group: "Database",
    description: "Applies pending migrations to production database",
  },
  "Open Prisma Studio": {
    cmd: "npx prisma studio",
    group: "Database",
    description: "Opens Prisma Studio GUI to manage database",
  },
  "Reset Database": {
    cmd: "npx prisma migrate reset",
    group: "Database",
    description: "Resets the database and reapplies all migrations",
  },
  "Check types": {
    cmd: "npx tsc --noEmit",
    group: "Code Quality",
    description: "Performs TypeScript type checking",
  },
  "Lint code": {
    cmd: "npx eslint . --ext .ts,.tsx",
    group: "Code Quality",
    description: "Runs ESLint to find and fix code issues",
  },
  "Format code": {
    cmd: 'npx prettier --write "**/*.{ts,tsx,json}"',
    group: "Code Quality",
    description: "Formats all TypeScript and JSON files",
  },
  "Run tests": {
    cmd: "npx jest --coverage",
    group: "Testing",
    description: "Executes tests with coverage report",
  },
  "Watch tests": {
    cmd: "npx jest --watch",
    group: "Testing",
    description: "Runs tests in watch mode",
  },
  "Run dev server": {
    cmd: "npx next dev",
    group: "Development",
    description: "Starts the development server",
  },
  "Build project": {
    cmd: "npx next build",
    group: "Development",
    description: "Creates production build",
  },
  "Start production": {
    cmd: "npx next start",
    group: "Development",
    description: "Runs the production server",
  },
  "Check updates": {
    cmd: "npx npm-check-updates",
    group: "Dependencies",
    description: "Checks for package updates in package.json",
  },
  "Update dependencies": {
    cmd: "npm update",
    group: "Dependencies",
    description: "Updates all dependencies to their latest versions",
  },
  "Clear cache": {
    cmd: "rm -rf .next node_modules/.cache",
    group: "Utilities",
    description: "Cleans development cache files",
  },
  "Install dependencies": {
    cmd: "npm install",
    group: "Utilities",
    description: "Installs project dependencies",
  },
  "Clean install": {
    cmd: "rm -rf node_modules && npm install",
    group: "Utilities",
    description: "Performs a clean installation of dependencies",
  },
  
};

export default scriptsConfiguration;
