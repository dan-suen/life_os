import type { Tier, Area, Settings } from "./types";

export const TIER_COLORS: Record<Tier, { bg: string; text: string; border: string }> = {
  "Urgent":           { bg: "#fff0f0", text: "#c0392b", border: "#f5c6c6" },
  "Daily":            { bg: "#f0faf5", text: "#1a9e5c", border: "#b8e6d0" },
  "Weekly":           { bg: "#f0f4ff", text: "#2253c7", border: "#c6d3f5" },
  "High Priority":    { bg: "#fffbf0", text: "#b07d00", border: "#f5e6c6" },
  "Normal":           { bg: "#f5f5f5", text: "#444444", border: "#dddddd" },
  "Non-Priority":     { bg: "#f9f9f9", text: "#888888", border: "#e5e5e5" },
};

export const AREA_COLORS: Record<Area, string> = {
  "Work / Career":                  "#2253c7",
  "Health & Fitness":               "#1a9e5c",
  "Personal Projects & Hobbies":    "#b07d00",
  "Finances":                       "#7c3aed",
};

export const DEFAULT_SETTINGS: Settings = {
  topN: {
    "Work / Career": 3,
    "Health & Fitness": 2,
    "Personal Projects & Hobbies": 2,
    "Finances": 2,
  },
  weights: { impact: 0.4, effort: 0.2, urgency: 0.4 },
  currentEnergy: "Medium",
};
