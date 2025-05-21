import { getRunningContext } from "@/cli/context";
import { getCurrentPreset } from "@/cli/ui/presets";

type LogLevel = "INFO" | "DEBUG" | "WARNING" | "ERROR";
const fallbackLogLevel: LogLevel = "INFO";

export function log(message: string, level: LogLevel = fallbackLogLevel): void {
  const { isDebugMode, currentPreset } = getRunningContext();
  const preset = getCurrentPreset(currentPreset);

  if (level === "DEBUG" && !isDebugMode) {
    return;
  }

  if (level === "DEBUG") {
    return console.log(`${preset.colors.debug("[DEBUG]")} ${message}`);
  }

  if (level === "WARNING") {
    return console.log(`${preset.colors.warning("[WARNING]")} ${message}`);
  }

  return console.log(`[${level.toUpperCase()}] ${message}`);
}
