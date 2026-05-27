import type { Commitment, Settings } from "../types";
import { TIER_COLORS, AREA_COLORS } from "../constants";
import { calcRecommendationScore } from "../utils/priority";
import { daysLabel } from "../utils/formatting";
import { s } from "../styles";

interface Props {
  commitments: Commitment[];
  settings: Settings;
  onToggleComplete: (c: Commitment) => void;
  onEdit: (c: Commitment) => void;
  onDelete: (id: number) => void;
}

export function RecommendationsPanel({ commitments, settings, onToggleComplete, onEdit, onDelete }: Props) {
  const recommendations = commitments
    .map(c => ({ c, score: calcRecommendationScore(c, settings) }))
    .filter(({ score }) => score >= 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(({ c }) => c);

  const problemAreas = Array.from(
    new Set(
      commitments
        .filter(c => !c.completed && calcRecommendationScore(c, settings) >= 0)
        .sort((a, b) => calcRecommendationScore(b, settings) - calcRecommendationScore(a, settings))
        .map(c => c.area)
    )
  ).slice(0, 3);

  return (
    <div style={{ ...s.section, borderColor: "#d97706" }}>
      <div style={{ ...s.sectionHeader, background: "#fffbeb" }}>
        <span style={{ ...s.sectionTitle, color: "#b45309" }}>
          ★ Recommendations
        </span>
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          {problemAreas.map(area => (
            <span key={area} style={{
              fontSize: "11px", fontWeight: 600, color: AREA_COLORS[area],
              padding: "1px 7px", borderRadius: "99px",
              background: AREA_COLORS[area] + "18",
              border: `1px solid ${AREA_COLORS[area]}40`,
            }}>{area}</span>
          ))}
        </div>
      </div>
      <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: "6px" }}>
        {recommendations.length === 0 ? (
          <div style={{ textAlign: "center", padding: "24px", color: "#aaa", fontSize: "13px" }}>Nothing urgent — you're on top of it.</div>
        ) : recommendations.map((c, i) => {
          const tc = TIER_COLORS[c.tier];
          const dl = daysLabel(c.deadline);
          return (
            <div key={c.id} style={{
              display: "flex", alignItems: "center", gap: "10px",
              padding: "10px 14px", background: "#fff", borderRadius: "8px",
              border: "1px solid #fde68a",
              boxShadow: i === 0 ? "0 1px 4px rgba(180,83,9,0.08)" : "none",
            }}>
              <span style={{
                flexShrink: 0, width: "20px", height: "20px", borderRadius: "50%",
                background: i === 0 ? "#b45309" : "#e5e7eb",
                color: i === 0 ? "#fff" : "#6b7280",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "11px", fontWeight: 700,
              }}>{i + 1}</span>
              <input type="checkbox" checked={c.completed} onChange={() => onToggleComplete(c)} style={{ flexShrink: 0 }} />
              <span style={{ display: "inline-block", padding: "1px 7px", borderRadius: "4px", fontSize: "10px", fontWeight: 600, background: tc.bg, color: tc.text, border: `1px solid ${tc.border}`, whiteSpace: "nowrap" }}>{c.tier}</span>
              <span style={{ flex: 1, fontWeight: 600, color: "#1a1a1a", fontSize: "13px" }}>{c.name}</span>
              <span style={{ fontSize: "11px", color: AREA_COLORS[c.area], fontWeight: 600, whiteSpace: "nowrap" }}>{c.area}</span>
              {c.deadline && <span style={{ fontSize: "11px", color: dl.color, whiteSpace: "nowrap" }}>{dl.text}</span>}
              <div style={{ display: "flex", gap: "2px", marginLeft: "auto", flexShrink: 0 }}>
                <button style={s.iconBtn} title="Edit" onClick={() => onEdit(c)}>✎</button>
                <button style={{ ...s.iconBtn, color: "#e74c3c" }} title="Delete" onClick={() => onDelete(c.id)}>✕</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
