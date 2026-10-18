import { AWAKEN_TYPES, BF_BUDGET, type AwakenType, type BefoulmentType, type CopyProgress, type Stage } from "../data";
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

/** Befoulments this weapon accepts (with permeation caps), minus ones that undercut its skills. */
export function BfRange({ avoid = [] }: { avoid?: BefoulmentType[] }) {
  const ok = (Object.keys(BF_BUDGET) as BefoulmentType[]).filter(t => !avoid.includes(t));
  return (
    <div style={{ fontSize: "11px", fontWeight: 400, marginTop: "3px", lineHeight: 1.6 }}>
      <span style={{ color: "#888" }}>BF ok: </span>
      {ok.map(t => (
        <span key={t} style={{ display: "inline-block", padding: "0 5px", marginRight: "3px", borderRadius: "3px", background: "#e8f6ee", color: "#1a7a46" }}>
          {t} ≤Prm{BF_BUDGET[t]!.maxPrm}
        </span>
      ))}
      {avoid.length > 0 && <span style={{ color: "#b03a2e" }}> · avoid {avoid.join(", ")}</span>}
    </div>
  );
}
