import type { Status } from "./types";

export const STATUS_COLORS: Record<Status, { bg: string; text: string; border: string }> = {
  "Watching":  { bg: "#ffffff", text: "#1a1a1a", border: "#e5e5e5" },
  "Carryover": { bg: "#fff0f0", text: "#c0392b", border: "#f5c6c6" },
  "Unstarted": { bg: "#f0fff4", text: "#1a9e5c", border: "#b8e6d0" },
};
