import { spawn } from "node:child_process";

export function runCommandsConcurrently(commands: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    let finished = 0;
    let hasError = false;

    if (!commands.length) {
      resolve();
      return;
    }

    for (const cmd of commands) {
      const proc = spawn(cmd, { shell: true, stdio: "ignore" });

      proc.on("error", (err) => {
        if (!hasError) {
          hasError = true;
          reject(err);
        }
      });

      proc.on("close", () => {
        finished++;
        if (finished === commands.length && !hasError) {
          resolve();
        }
      });
    }
  });
}
