import { AWAKEN_TYPES, BEFOULMENTS, BF_DANGER, BF_MAX_PRM, type AwakenType, type BefoulmentType, type CopyProgress, type Stage } from "../data";
import { isAwakenStage, stagesFor, toggleStage } from "../materials";

const chip = (done: boolean, awaken: boolean): React.CSSProperties => ({
  padding: "2px 8px", borderRadius: "10px", fontSize: "11px", cursor: "pointer", userSelect: "none",
  border: `1px solid ${done ? (awaken ? "#c9a227" : "#1a1a1a") : awaken ? "#c9a227" : "#ccc"}`,
  background: done ? (awaken ? "#c9a227" : "#1a1a1a") : "#fff",
  color: done ? "#fff" : awaken ? "#9a7a10" : "#666",
});

/** Awakening type selector for one copy. */
export function AwakenSelect({ copy, onChange }: { copy: CopyProgress; onChange: (c: CopyProgress) => void }) {
  return (
    <select value={copy.awaken} onChange={e => onChange({ ...copy, awaken: e.target.value as AwakenType })}
      style={{ fontSize: "12px", border: "1px solid #ddd", borderRadius: "4px", padding: "2px 4px", background: "#fff", cursor: "pointer" }}>
      {AWAKEN_TYPES.map(t => <option key={t} value={t}>{t || "—"}</option>)}
    </select>
  );
}

/** A toggle per stage for one copy; awakening stages are gold. */
export function StageChips({ stages, copy, onChange }: { stages: Stage[]; copy: CopyProgress; onChange: (c: CopyProgress) => void }) {
  const own = stagesFor({ stages }, copy).map(s => s.key);
  const toggle = (key: string) => onChange({ ...copy, done: toggleStage(copy.done, key, own) });
  return (
    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
      {stagesFor({ stages }, copy).map(st => (
        <span key={st.key} style={chip(copy.done.includes(st.key), isAwakenStage(st.key))} onClick={() => toggle(st.key)}>
          {copy.done.includes(st.key) ? "✓ " : ""}{st.key}
        </span>
      ))}
    </div>
  );
}

const BF_COLORS = { low: ["#e8f6ee", "#1a7a46"], medium: ["#fff4e0", "#9a6a00"], high: ["#fdecea", "#b03a2e"] } as const;

/** Target befoulment for one copy; red if it's a dangerous type or one this weapon should avoid. */
export function BefoulmentSelect({ copy, avoid = [], onChange }: { copy: CopyProgress; avoid?: BefoulmentType[]; onChange: (c: CopyProgress) => void }) {
  const bad = copy.bf && (avoid.includes(copy.bf) || BF_DANGER[copy.bf] === "high");
  const [bg, fg] = copy.bf ? BF_COLORS[bad ? "high" : BF_DANGER[copy.bf]] : ["#fff", "#999"];
  const cap = copy.bf && BF_MAX_PRM[copy.bf];
  return (
    <select value={copy.bf ?? ""} title={copy.bf ? `Target befoulment${cap ? ` (keep only Prm ≤${cap})` : ""}${bad ? " — conflicts with this weapon" : ""}` : "Target befoulment"}
      onChange={e => onChange({ ...copy, bf: (e.target.value || undefined) as BefoulmentType | undefined })}
      style={{ fontSize: "11px", fontWeight: 600, border: `1px solid ${copy.bf ? fg : "#ddd"}`, borderRadius: "4px", padding: "1px 3px", background: bg, color: fg, cursor: "pointer" }}>
      <option value="">BF —</option>
      {BEFOULMENTS.map(t => (
        <option key={t} value={t}>BF {t}{BF_MAX_PRM[t] ? ` ≤${BF_MAX_PRM[t]}` : ""}{avoid.includes(t) ? " ✕" : BF_DANGER[t] === "high" ? " ✕" : ""}</option>
      ))}
    </select>
  );
}
