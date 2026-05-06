import type { Commitment, Settings } from "../types";
import { TIER_COLORS, AREA_COLORS } from "../constants";
import { calcPriority } from "../utils/priority";
import { daysLabel } from "../utils/formatting";
import { s } from "../styles";

interface Props {
  items: Commitment[];
  settings: Settings;
  isTodayView: boolean;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onToggleComplete: (c: Commitment) => void;
}

export function TodaysFocusPanel({ items, settings, isTodayView, collapsed, onToggleCollapse, onToggleComplete }: Props) {
  return (
    <div style={{ ...s.section, borderColor: "#c6d3f5" }}>
      <div style={{ ...s.sectionHeader, background: "#f0f4ff", cursor: isTodayView ? "default" : "pointer" }}
        onClick={() => !isTodayView && onToggleCollapse()}>
        <span style={{ ...s.sectionTitle, color: "#2253c7" }}>
          📋 Today's Focus {!isTodayView && (collapsed ? "▸" : "▾")}
        </span>
        <span style={{ fontSize: "11px", color: "#2253c7" }}>{items.filter(c => !c.completed).length} remaining</span>
      </div>
      {(isTodayView || !collapsed) && (
        <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: "4px" }}>
          {items.map(c => {
            const tc = TIER_COLORS[c.tier];
            const dl = daysLabel(c.deadline);
            return (
              <div key={c.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px", background: c.completed ? "#f9f9f9" : "#fff", borderRadius: "6px", border: "1px solid #e8eef8" }}>
                <input type="checkbox" checked={c.completed} onChange={() => onToggleComplete(c)} style={{ flexShrink: 0 }} />
                <span style={{ display: "inline-block", padding: "1px 7px", borderRadius: "4px", fontSize: "10px", fontWeight: 600, background: tc.bg, color: tc.text, border: `1px solid ${tc.border}`, whiteSpace: "nowrap" }}>{c.tier}</span>
                <span style={{ flex: 1, fontWeight: 500, color: c.completed ? "#aaa" : "#1a1a1a", textDecoration: c.completed ? "line-through" : "none", fontSize: "13px" }}>{c.name}</span>
                <span style={{ fontSize: "11px", color: AREA_COLORS[c.area], fontWeight: 600, whiteSpace: "nowrap" }}>{c.area}</span>
                {c.deadline && <span style={{ fontSize: "11px", color: dl.color, whiteSpace: "nowrap" }}>{dl.text}</span>}
                {["High Priority", "Normal"].includes(c.tier) && <span style={{ fontSize: "11px", fontWeight: 700, color: "#888" }}>{calcPriority(c, settings)}</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
