import type { Commitment, Settings } from "../types";
import { TIER_COLORS, AREA_COLORS } from "../constants";
import { calcPriority } from "../utils/priority";
import { formatDate, daysLabel } from "../utils/formatting";
import { s } from "../styles";

interface Props {
  commitment: Commitment;
  index: number;
  showArea: boolean;
  isEditing: boolean;
  settings: Settings;
  onEdit: (c: Commitment) => void;
  onDelete: (id: number) => void;
  onToggle: (c: Commitment) => void;
}

export function CommitmentRow({ commitment: c, index: i, showArea, isEditing, settings, onEdit, onDelete, onToggle }: Props) {
  if (isEditing) {
    return (
      <tr style={{ background: "#fffbea", outline: "2px solid #f0c040" }}>
        <td style={s.td} colSpan={showArea ? 11 : 10}>
          <span style={{ fontSize: "12px", color: "#b07d00", fontStyle: "italic" }}>
            Editing "{c.name}" — see panel above
          </span>
        </td>
      </tr>
    );
  }

  const pri = calcPriority(c, settings);
  const dl = daysLabel(c.deadline);
  const tc = TIER_COLORS[c.tier];
  const rowBg = c.completed ? "#f9f9f9" : i % 2 === 0 ? "#ffffff" : "#fafafa";

  return (
    <tr style={{ background: rowBg }} onDoubleClick={() => onEdit(c)}>
      <td style={s.td}><input type="checkbox" checked={c.completed} onChange={() => onToggle(c)} /></td>
      <td style={{ ...s.td, fontWeight: 500, textOverflow: "ellipsis", whiteSpace: "nowrap", textDecoration: c.completed ? "line-through" : "none", color: c.completed ? "#aaa" : "#1a1a1a" }}>{c.name}</td>
      <td style={s.td}><span style={{ display: "inline-block", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 600, background: tc.bg, color: tc.text, border: `1px solid ${tc.border}` }}>{c.tier}</span></td>
      {showArea && <td style={{ ...s.td, fontSize: "12px", color: AREA_COLORS[c.area], fontWeight: 500, textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.area}</td>}
      <td style={{ ...s.td, fontSize: "12px", color: "#555" }}>{c.effort}</td>
      <td style={{ ...s.td, fontSize: "12px", color: "#555" }}>{c.impact}</td>
      <td style={{ ...s.td, fontSize: "12px", color: "#555" }}>{c.energy}</td>
      <td style={{ ...s.td, fontSize: "12px" }}>
        {c.deadline
          ? <span style={{ color: dl.color, fontWeight: dl.color === "#c0392b" ? 600 : 400 }}>{formatDate(c.deadline)}<br /><span style={{ fontSize: "10px" }}>{dl.text}</span></span>
          : <span style={{ color: "#ccc" }}>—</span>}
      </td>
      <td style={{ ...s.td, fontSize: "12px", fontWeight: 600, color: pri >= 7 ? "#c0392b" : pri >= 4 ? "#b07d00" : "#555" }}>
        {["Urgent", "Daily", "Weekly", "Non-Priority"].includes(c.tier) ? <span style={{ color: "#ccc" }}>—</span> : pri}
      </td>
      <td style={{ ...s.td, fontSize: "12px", color: "#888", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.note || "—"}</td>
      <td style={{ ...s.td, overflow: "visible" }}>
        <div style={{ display: "flex", gap: "2px" }}>
          <button style={s.iconBtn} title="Edit" onClick={() => onEdit(c)}>✎</button>
          <button style={{ ...s.iconBtn, color: "#e74c3c" }} title="Delete" onClick={() => onDelete(c.id)}>✕</button>
        </div>
      </td>
    </tr>
  );
}
