import blessed from "blessed";

import { getRunningContext } from "@/cli/context";
import { getCurrentPreset } from "@/cli/ui/presets";

import {
  defaultPanelConfiguration,
  defaultPanelStyleConfiguration,
  panelScrollbarConfiguration,
} from "@/cli/ui/elements/shared";

interface RenderGroupSelectorPanelProps {
  screen: blessed.Widgets.Screen;
  width: string;
  groups: any[]; // #TODO: Define shared type for groups
}

const formatGroupName = (groupName: string) => `➜ ${groupName}`;

export function renderGroupSelectorPanel(
  configuration: RenderGroupSelectorPanelProps,
) {
  const { screen, groups, width } = configuration;
  const { currentPreset } = getRunningContext();

  const preset = getCurrentPreset(currentPreset);
  const groupsToRender = groups.map(formatGroupName);

  return blessed.list({
    width,
    height: "100%-2",
    parent: screen,
    items: groupsToRender,
    style: defaultPanelStyleConfiguration,
    label: preset.colors.black(" Groups "),
    scrollbar: panelScrollbarConfiguration,
    ...defaultPanelConfiguration,
  });
}
