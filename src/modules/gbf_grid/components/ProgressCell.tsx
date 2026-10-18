import { AWAKEN_TYPES, type AwakenType, type CopyProgress, type Stage } from "../data";
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
  const toggle = (key: string) => onChange({ ...copy, done: toggleStage(copy.done, key, copy.skip) });
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
