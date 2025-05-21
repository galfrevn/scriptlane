import type { ScriptsConfiguration } from "@/cli/configuration/types";

type GroupedScripts = {
  name: string;
  items: Array<{
    name: string;
    command: string;
    description: string;
  }>;
};

const DEFAULT_GROUP_NAME = "Default";
const DEFAULT_GROUP_DESCRIPTION = "No description available";

export function groupScriptsByGroupName(scripts: ScriptsConfiguration) {
  return Object.entries(scripts).reduce(
    (groupsAccumulator, [scriptName, scriptConfiguration]) => {
      const currentGroupName = scriptConfiguration.group || DEFAULT_GROUP_NAME;
      const currentGroup = groupsAccumulator.find(
        (group) => group.name === currentGroupName
      );

      if (!currentGroup) {
        groupsAccumulator.push({
          name: currentGroupName,
          items: [
            {
              name: scriptName,
              command: scriptConfiguration.cmd,
              description:
                scriptConfiguration.description || DEFAULT_GROUP_DESCRIPTION,
            },
          ],
        });

        return groupsAccumulator;
      }

      currentGroup.items.push({
        name: scriptName,
        command: scriptConfiguration.cmd,
        description: scriptConfiguration.description || DEFAULT_GROUP_DESCRIPTION,
      });

      return groupsAccumulator;
    },
    [] as Array<GroupedScripts>
  );
}
