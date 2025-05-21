import blessed from "blessed";

const { colors } = blessed;

type ListConfiguration =
  blessed.Widgets.ListOptions<blessed.Widgets.ListElementStyle>;

export const panelScrollbarConfiguration: ListConfiguration["scrollbar"] = {
  ch: " ", // Character used for the scrollbar
  style: {
    bg: colors.match("#FFF"),
    inverse: true,
  },
};

export const defaultPanelStyleConfiguration: ListConfiguration["style"] = {
  border: { fg: "grey" },
  selected: {},
  item: { fg: "white" },
};

export const defaultPanelConfiguration: ListConfiguration = {
  vi: false,
  keys: false,
  mouse: true,
  scrollable: true,
  border: "line",
};

export const calculatePanelDimensions = (
  panelCount: number,
  columnDistribution?: Array<number>,
) => {
  if (columnDistribution && columnDistribution.length !== panelCount) {
    throw new Error(
      "Column distribution array length must match number of panels",
    );
  }

  const panelDimensions = [];
  let accumulatedWidth = 0;

  for (let panelIndex = 0; panelIndex < panelCount; panelIndex++) {
    const columnCount = columnDistribution
      ? columnDistribution[panelIndex]
      : Math.floor(12 / panelCount);

    const panelWidth = `${(columnCount / 12) * 100}%`;
    const panelPosition = `${accumulatedWidth}%`;

    panelDimensions.push({ width: panelWidth, left: panelPosition });
    accumulatedWidth += (columnCount / 12) * 100;
  }

  return panelDimensions;
};
