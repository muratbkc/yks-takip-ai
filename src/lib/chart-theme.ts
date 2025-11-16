import type { CSSProperties, SVGProps } from "react";

type TickStyle = Partial<SVGProps<SVGTextElement>>;

export const chartPrimaryTick: TickStyle = {
  fill: "var(--chart-axis)",
  fontSize: 12,
  fontWeight: 600,
};

export const chartSecondaryTick: TickStyle = {
  fill: "var(--chart-axis-muted)",
  fontSize: 11,
  fontWeight: 500,
};

export const chartTooltipStyle: CSSProperties = {
  backgroundColor: "var(--chart-tooltip-bg)",
  backdropFilter: "blur(14px)",
  borderRadius: "0.85rem",
  border: "1px solid var(--chart-tooltip-border)",
  color: "var(--chart-tooltip-color)",
  boxShadow: "0 15px 35px rgba(15, 23, 42, 0.1)",
  padding: "12px",
};

export const chartTooltipLabelStyle: CSSProperties = {
  color: "var(--chart-tooltip-color)",
  fontWeight: 600,
  marginBottom: 4,
};

export const chartTooltipItemStyle: CSSProperties = {
  color: "var(--chart-tooltip-color)",
};

export const getChartLegendStyle = (
  overrides?: CSSProperties,
): CSSProperties => ({
  color: "var(--chart-legend)",
  fontSize: 12,
  fontWeight: 600,
  paddingTop: 8,
  ...overrides,
});
