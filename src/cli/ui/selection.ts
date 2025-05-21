// @ts-nocheck

import type { ScriptsConfiguration } from "@/cli/configuration/types";

import blessed from "blessed";
import chalk from "chalk";

import { spawn } from "child_process";

import { getRunningContext } from "../context";
import { getCurrentPreset } from "./presets";
import { calculatePanelDimensions } from "./elements/shared";
import { groupScriptsByGroupName } from "./utils/group-scripts";

interface RenderScriptSelectionUIProps {
  scripts: ScriptsConfiguration;
  customization: {
    showGroups: boolean;
    showScriptName: boolean;
    showScriptDescription: boolean;
  };
}

export async function renderScriptSelectionUI({
  scripts,
  customization,
}: RenderScriptSelectionUIProps) {
  const { showGroups, showScriptName, showScriptDescription } = customization;

  const context = getRunningContext();
  const preset = getCurrentPreset(context.currentPreset);

  const groups = groupScriptsByGroupName(scripts);

  // State
  let checked: Record<number, Set<number>> = {};
  for (let i = 0; i < groups.length; i++) checked[i] = new Set();

  let focusedPanel: "left" | "center" = "left";
  let leftSelected = 0;
  let centerSelected = 0;

  const screen = blessed.screen({
    smartCSR: true,
    title: "Scriptlane",
  });

  const panelsDistribution = calculatePanelDimensions(3, [2, 8, 2]);
  const leftPanelDimensions = panelsDistribution[0];
  const centerPanelDimensions = panelsDistribution[1];
  const rightPanelDimensions = panelsDistribution[2];

  const left = blessed.list({
    parent: screen,
    label: chalk.bold.black(" Groups "),
    width: "20%",
    height: "100%-2",
    border: "line",
    scrollable: true,
    style: {
      border: { fg: "grey" },
      selected: {},
      item: { fg: "white" },
    },
    scrollbar: {
      ch: " ",
      style: {
        bg: "white",
        inverse: true,
      },
    },
    keys: false,
    mouse: true,
    vi: false,
    items: groups.map((g) => `➜ ${g.name}`),
  });

  const center = blessed.list({
    parent: screen,
    label: chalk.bold.white(" Commands "),
    left: "20%",
    width: "45%",
    height: "70%-2",
    border: "line",
    scrollbar: {
      ch: " ",
      style: {
        bg: "white",
        inverse: true,
      },
    },
    style: {
      border: { fg: "white" },
      selected: {},
      item: { fg: "white" },
    },
    keys: false,
    mouse: true,
    vi: false,
    items: [],
    interactive: true,
  });

  const descBox = blessed.box({
    parent: screen,
    top: "70%-2",
    left: "20%",
    width: "45%",
    height: "30%",
    border: "line",
    label: chalk.bold.cyan(" Description "),
    tags: true,
    style: {
      border: { fg: "cyan" },
    },
    content: "",
  });

  const selectedBox = blessed.list({
    parent: screen,
    label: chalk.bold.black(" Selected "),
    left: "65%",
    width: "30%",
    height: "100%-2",
    border: "line",
    style: {
      border: { fg: "grey" },
      selected: {}, // not interactive
    },
    keys: false,
    mouse: false,
    vi: false,
    items: [],
  });

  const help = blessed.box({
    parent: screen,
    bottom: 1,
    height: 1,
    width: "100%",
    style: { fg: "gray", bg: "black" },
    tags: true,
    content: ` {bold}{gray-fg}←→{/gray-fg}{/bold} panel  {bold}{gray-fg}↑↓{/gray-fg}{/bold} move  {bold}{gray-fg}SPACE{/gray-fg}{/bold} select  {bold}{gray-fg}A{/gray-fg}{/bold} select all  {bold}{gray-fg}ENTER{/gray-fg}{/bold} run  {bold}{gray-fg}Q{/gray-fg}{/bold} quit`,
  });

  // Render panels
  function renderLeftPanel() {
    left.setItems(
      groups.map((g, idx) => {
        if (focusedPanel === "left" && leftSelected === idx) {
          return chalk.bgBlack.bold(`➜ ${g.name}`);
        }
        return chalk.white(`➜ ${g.name}`);
      }),
    );
    left.selected = leftSelected;
  }

  function renderCenterPanel() {
    center.setItems(
      groups[leftSelected].items.map((item, idx) => {
        const isChecked = checked[leftSelected].has(idx);
        let prefix = isChecked ? chalk.dim("[x]") : chalk.dim("[ ]");
        let label = chalk.dim(item.name);
        if (focusedPanel === "center" && centerSelected === idx) {
          prefix = chalk.bgBlack.white(prefix);
          label = chalk.bgBlack.white(item.name);
        }
        return `${prefix} ${label}`;
      }),
    );
    center.selected = centerSelected;
  }

  // Description box
  function updateDescription() {
    const groupIdx = leftSelected;
    const cmdIdx = centerSelected;
    const item = groups[groupIdx]?.items?.[cmdIdx];
    descBox.setContent(item ? `{white-fg}${item.description}{/white-fg}` : "");
  }

  // Selected commands box
  function updateSelectedBox() {
    const items: string[] = [];
    for (const [gIdx, s] of Object.entries(checked)) {
      const group = groups[Number(gIdx)];
      s.forEach((cmdIdx) => {
        const cmd = group.items[cmdIdx];
        items.push(`${chalk.bold.white(group.name)}: ${chalk.dim(cmd.name)}`);
      });
    }
    selectedBox.setItems(
      items.length > 0 ? items : [chalk.gray("No commands selected")],
    );
  }

  function focusPanel(panel: "left" | "center") {
    focusedPanel = panel;
    renderLeftPanel();
    renderCenterPanel();
    updateDescription();
    updateSelectedBox();
    screen.render();
  }

  // Initial render
  renderLeftPanel();
  renderCenterPanel();
  updateDescription();
  updateSelectedBox();
  focusPanel("left");

  screen.key(["a"], () => {
    const all = checked[leftSelected];
    const groupItems = groups[leftSelected].items.length;
    if (all.size < groupItems) {
      // Select all
      for (let i = 0; i < groupItems; i++) all.add(i);
    } else {
      // Deselect all
      all.clear();
    }
    renderCenterPanel();
    updateSelectedBox();
    screen.render();
  });

  // Keyboard handling
  screen.key(["left", "right"], (ch, key) => {
    if (key.name === "left" && focusedPanel === "center") {
      focusPanel("left");
    } else if (key.name === "right" && focusedPanel === "left") {
      focusPanel("center");
    }
  });

  screen.key(["up", "down"], (ch, key) => {
    if (focusedPanel === "left") {
      if (key.name === "up" && leftSelected > 0) {
        leftSelected--;
        centerSelected = 0;
      } else if (key.name === "down" && leftSelected < groups.length - 1) {
        leftSelected++;
        centerSelected = 0;
      }
      renderLeftPanel();
      renderCenterPanel();
      updateDescription();
      updateSelectedBox();
      screen.render();
    } else if (focusedPanel === "center") {
      const max = groups[leftSelected].items.length - 1;
      if (key.name === "up" && centerSelected > 0) {
        centerSelected--;
      } else if (key.name === "down" && centerSelected < max) {
        centerSelected++;
      }
      renderCenterPanel();
      updateDescription();
      screen.render();
    }
  });

  screen.key(["space"], () => {
    if (focusedPanel !== "center") return;
    const groupIdx = leftSelected;
    const cmdIdx = centerSelected;
    if (checked[groupIdx].has(cmdIdx)) checked[groupIdx].delete(cmdIdx);
    else checked[groupIdx].add(cmdIdx);
    renderCenterPanel();
    updateSelectedBox();
    screen.render();
  });

  screen.key(["enter"], async () => {
    if (focusedPanel !== "center") return;
    // Gather selected commands
    const toRun: { group: string; name: string; command: string }[] = [];
    for (const [gIdx, set] of Object.entries(checked)) {
      const group = groups[Number(gIdx)];
      set.forEach((cmdIdx) => {
        const cmd = group.items[cmdIdx];
        toRun.push({ group: group.name, name: cmd.name, command: cmd.command });
      });
    }
    if (!toRun.length) return;

    const result = await showConcurrentRunUI({ screen, commands: toRun });

    if (result === "back") {
      left.show();
      center.show();
      descBox.show();
      selectedBox.show();
      help.show();
      renderLeftPanel();
      renderCenterPanel();
      updateDescription();
      updateSelectedBox();
      focusPanel(focusedPanel); // or focusPanel("center") if you want focus on the same
      screen.render();
    }
  });

  // Mouse support
  left.on("select", (_, idx) => {
    leftSelected = idx;
    centerSelected = 0;
    focusPanel("left");
  });
  center.on("select", (_, idx) => {
    centerSelected = idx;
    focusPanel("center");
  });

  screen.key(["escape", "q", "C-c"], () => process.exit(0));
}

export async function showConcurrentRunUI({
  screen,
  commands,
}: {
  screen: blessed.Widgets.Screen;
  commands: CommandToRun[];
}): Promise<"back" | "exit"> {
  // Hide all other panels
  screen.children.forEach((c) => c.hide?.());

  let focusedPanel: "left" | "logs" = "left";
  let logScroll = 0; // 0 = bottom, higher numbers = scrolled up
  let shouldResetLogScroll = true;

  let processesRunning = true;
  let userScrolling = false;

  // Track output for each command
  const output: string[][] = commands.map(() => []);
  let finished: boolean[] = commands.map(() => false);

  // UI: Left list of commands, right log viewer
  const left = blessed.list({
    parent: screen,
    label: chalk.bold.black(" Running "),
    width: "20%",
    height: "100%-2",
    border: "line",
    style: {
      border: { fg: "black" },
      selected: { bg: "black", fg: "white" },
      item: { fg: "black" },
    },
    keys: false,
    mouse: false,
    vi: false,
    items: commands.map(
      (c, idx) =>
        chalk.yellow(`${c.group}:`) +
        " " +
        chalk.white(c.name) +
        (finished[idx] ? chalk.green(" ✔") : ""),
    ),
  });

  const logBox = blessed.box({
    parent: screen,
    left: "20%",
    width: "80%",
    height: "100%-2",
    border: "line",
    label: chalk.bold.black(" Logs "),
    tags: true,
    scrollable: true,
    scrollbar: {
      ch: " ",
      style: {
        bg: "white",
        inverse: true,
      },
    },
    alwaysScroll: true,
    style: {
      border: { fg: "black" },
      fg: "white",
    },
    keys: false,
    mouse: true,
    vi: false,
    content: "",
  });

  const runHelp = blessed.box({
    parent: screen,
    bottom: 1,
    height: 1,
    left: "0%",
    width: "100%",
    style: { fg: "gray", bg: "black" },
    tags: true,
    content: chalk.gray(
      "Press {bold}b{/bold} to go back to script selection • {bold}q{/bold} to quit",
    ),
  });

  const finishedBox = blessed.box({
    parent: screen,
    left: "20%",
    top: "100%-5", // position below log
    width: "80%",
    label: chalk.bold.green(" Output "),
    height: 3,
    border: "line",
    hidden: true,
    align: "center",
    valign: "middle",
    style: { border: { fg: "green" }, fg: "green" },
    tags: true,
    content: "",
  });

  let leftSelected = 0;
  let scrollOffset = 0;
  let scrollTimer: NodeJS.Timeout | null = null;

  // Function to update UI
  function renderLogs(selectedIdx: number) {
    if (!left || !left.width || typeof left.width !== "number") return;

    const panelWidth = left.width as number;
    const displayWidth = Math.max(8, panelWidth - 4);

    left.style.border.fg = focusedPanel === "left" ? "cyan" : "gray";
    logBox.style.border.fg = focusedPanel === "logs" ? "cyan" : "gray";

    left.setItems(
      commands.map((c, idx) => {
        const isDone = finished[idx];
        const check = isDone ? chalk.green("✔ ") : "  ";
        const raw = `${c.group}: ${c.name}`;
        const visible =
          selectedIdx === idx
            ? check +
              chalk.bgBlack.white(
                getScrollingLabel(raw, displayWidth, scrollOffset),
              )
            : check + chalk.white(getScrollingLabel(raw, displayWidth, 0));
        return visible;
      }),
    );
    left.selected = selectedIdx;
    logBox.setContent(
      output[selectedIdx].join("") || chalk.gray("Waiting for output...\n"),
    );

    if (shouldResetLogScroll && !userScrolling) {
      logBox.setScrollPerc(100);
      shouldResetLogScroll = false;
    }

    screen.render();
  }

  function getScrollingLabel(
    text: string,
    width: number,
    offset: number,
  ): string {
    if (text.length <= width) {
      return text; // No scrolling needed
    }
    // Loop seamlessly by repeating the string with a separator (eg, spaces)
    const spacer = "   ";
    const looped = text + spacer + text;
    // Keep offset in range [0, text.length + spacer.length)
    const realOffset = offset % (text.length + spacer.length);
    return looped.substring(realOffset, realOffset + width);
  }

  function startScrolling() {
    if (scrollTimer) clearInterval(scrollTimer);
    scrollOffset = 0;

    const panelWidth = left.width as number;
    const displayWidth = Math.max(8, panelWidth - 4);

    scrollTimer = setInterval(() => {
      const raw = `${commands[leftSelected].group}: ${commands[leftSelected].name}`;
      // Only scroll if needed!
      if (raw.length > displayWidth) {
        scrollOffset++;
      } else {
        scrollOffset = 0; // No scrolling
      }
      renderLogs(leftSelected);
    }, 200); // Adjust scroll speed here
  }

  function stopScrolling() {
    if (scrollTimer) {
      clearInterval(scrollTimer);
      scrollTimer = null;
    }
  }

  function updateRunHelp() {
    if (focusedPanel === "left") {
      runHelp.setContent(
        chalk.gray("←/→ switch panel  ↑/↓ select command  b: back  q: quit"),
      );
    } else {
      runHelp.setContent(
        chalk.gray("←/→ switch panel  ↑/↓ scroll log  b: back  q: quit"),
      );
    }
    screen.render();
  }

  function adjustLogBoxHeight(showFinished: boolean) {
    if (showFinished) {
      logBox.height = "100%-5"; // reduce height
    } else {
      logBox.height = "100%-2"; // full height
    }
    screen.render();
  }

  renderLogs(leftSelected);

  let resolveResult: (result: "back" | "exit") => void;
  const resultPromise = new Promise<"back" | "exit">((resolve) => {
    resolveResult = resolve;
  });

  let currentLogIdx = 0;

  function focusLogPanel() {
    focusedPanel = "logs";
    currentLogIdx = leftSelected;
    userScrolling = false;
    shouldResetLogScroll = true;
    logBox.setContent(
      output[currentLogIdx].join("") || chalk.gray("Waiting for output...\n"),
    );
    renderLogs(leftSelected);
    screen.render();
  }

  function focusLeftPanel() {
    focusedPanel = "left";
    updateRunHelp();
    renderLogs(leftSelected);
    screen.render();
  }

  function handleKeyPress(ch, key) {
    // Left/right to change panel focus
    if (key.name === "right" && focusedPanel === "left") {
      focusLogPanel();
      return;
    }
    if (key.name === "left" && focusedPanel === "logs") {
      focusLeftPanel();
      return;
    }

    // Command list navigation (when left panel focused)
    if (focusedPanel === "left") {
      if (key.name === "up" && leftSelected > 0) {
        leftSelected--;
        scrollOffset = 0;
        shouldResetLogScroll = true;
        currentLogIdx = leftSelected;
        logBox.setContent(
          output[currentLogIdx].join("") ||
            chalk.gray("Waiting for output...\n"),
        );
        logBox.setScrollPerc(100); // Always show latest by default
        renderLogs(leftSelected);
        startScrolling();
        screen.render();
      } else if (key.name === "down" && leftSelected < commands.length - 1) {
        leftSelected++;
        scrollOffset = 0;
        shouldResetLogScroll = true;
        currentLogIdx = leftSelected;
        logBox.setContent(
          output[currentLogIdx].join("") ||
            chalk.gray("Waiting for output...\n"),
        );
        logBox.setScrollPerc(100);
        renderLogs(leftSelected);
        startScrolling();
        screen.render();
      }
    }
    if (focusedPanel === "logs") {
      if (key.name === "down") {
        logBox.scroll(1);
        userScrolling = true;
        screen.render();
      } else if (key.name === "up") {
        logBox.scroll(-1);
        userScrolling = true;
        screen.render();
      } else if (key.name === "pageup") {
        logBox.scroll(Math.floor((logBox.height as number) / 2));
        userScrolling = true;
        screen.render();
      } else if (key.name === "pagedown") {
        logBox.scroll(-Math.floor((logBox.height as number) / 2));
        userScrolling = true;
        screen.render();
      }
    }
  }

  screen.on("keypress", handleKeyPress);

  startScrolling();

  // Add 'b' for back, and standard quit
  screen.key(["b"], () => {
    if (processesRunning) {
      runHelp.setContent(
        chalk.red(
          "Cannot go back while commands are running! Wait until all finish.",
        ),
      );
      screen.render();
      return;
    }
    stopScrolling();
    screen.removeListener("keypress", handleKeyPress);

    left.destroy();
    logBox.destroy();
    runHelp.destroy();
    finishedBox.destroy();
    screen.render();
    resolveResult("back");
  });

  screen.key(["escape", "q", "C-c"], () => {
    stopScrolling();
    screen.removeListener("keypress", handleKeyPress);

    process.exit(0);
  });

  // Exit with Q, Esc, Ctrl+C
  screen.key(["escape", "q", "C-c"], () => process.exit(0));

  // Launch all commands concurrently
  await Promise.all(
    commands.map(
      (c, idx) =>
        new Promise<void>((resolve) => {
          const proc = spawn(c.command, { shell: true });

          proc.stdout?.on("data", (data) => {
            output[idx].push(data.toString());
            if (idx === leftSelected) renderLogs(leftSelected);
          });
          proc.stderr?.on("data", (data) => {
            output[idx].push(chalk.red(data.toString()));
            if (idx === leftSelected) renderLogs(leftSelected);
          });
          proc.on("close", () => {
            finished[idx] = true;
            if (idx === leftSelected) renderLogs(leftSelected);
            resolve();
          });
        }),
    ),
  );

  // All done: mark as finished, let user quit
  renderLogs(leftSelected);
  processesRunning = false;
  adjustLogBoxHeight(true);
  finishedBox.setContent(
    chalk.green.bold(
      "✔ All commands finished! Press Q to quit or {bold}b{/bold} to go back.",
    ),
  );
  finishedBox.show();
  screen.render();

  return resultPromise;
}
