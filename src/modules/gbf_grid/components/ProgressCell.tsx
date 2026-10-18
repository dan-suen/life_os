import { AWAKEN_TYPES, BEFOULMENTS, BF_CAP, BF_PIECE_MAX_PRM, bfValue, maxPrmFitting, type AwakenType, type BefoulmentType, type CopyBf, type CopyProgress, type Stage } from "../data";
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

type Usage = Partial<Record<BefoulmentType, number>>;
const room = (t: BefoulmentType, used: Usage) => (BF_CAP[t] ?? 0) - (used[t] ?? 0);
const pct = (n: number) => `${Math.round(n * 10) / 10}%`;
const bfSel: React.CSSProperties = { fontSize: "11px", border: "1px solid #ddd", borderRadius: "4px", padding: "1px 2px", background: "#fff", cursor: "pointer" };

/**
 * What still fits in this element's befoulment budget: each allowed type with the worst permeation
 * worth keeping (assuming exorcision to Lvl 5), minus types that undercut this weapon's skills.
 */
export function BfRange({ avoid = [], used }: { avoid?: BefoulmentType[]; used: Usage }) {
  const fits = (Object.keys(BF_CAP) as BefoulmentType[])
    .filter(t => !avoid.includes(t))
    .map(t => [t, maxPrmFitting(t, room(t, used))] as const);
  return (
    <div style={{ fontSize: "11px", fontWeight: 400, marginTop: "3px", lineHeight: 1.7 }}>
      <span style={{ color: "#888" }}>BF ok: </span>
      {fits.map(([t, p]) => (
        <span key={t} title={p ? `${pct(room(t, used))} of ${t} budget left for this element` : `${t} budget used up for this element`}
          style={{ display: "inline-block", padding: "0 5px", marginRight: "3px", borderRadius: "3px",
            background: p ? "#e8f6ee" : "#f2f2f2", color: p ? "#1a7a46" : "#aaa", textDecoration: p ? "none" : "line-through" }}>
          {t}{p ? ` ≤Prm${p}` : ""}
        </span>
      ))}
      {avoid.length > 0 && <span style={{ color: "#b03a2e" }}> · avoid {avoid.join(", ")}</span>}
    </div>
  );
}

/** The befoulment one copy rolled: type, permeation, exorcision level, in-grid toggle; red if it breaks the budget. */
export function BfEditor({ copy, avoid = [], used, onChange }: { copy: CopyProgress; avoid?: BefoulmentType[]; used: Usage; onChange: (c: CopyProgress) => void }) {
  const bf = copy.bf;
  const set = (next: CopyBf | undefined) => onChange({ ...copy, bf: next });
  if (!bf) {
    return (
      <select style={{ ...bfSel, color: "#999" }} value="" onChange={e => e.target.value && set({ type: e.target.value as BefoulmentType, prm: 1, exo: 1 })}>
        <option value="">+ BF</option>
        {BEFOULMENTS.map(t => {
          const p = BF_CAP[t] !== undefined && !avoid.includes(t) ? maxPrmFitting(t, room(t, used)) : 0;
          return <option key={t} value={t}>{t}{avoid.includes(t) ? " ✕ conflicts" : !BF_CAP[t] ? " ✕ never" : p ? ` ✓ ≤Prm${p}` : " ✕ over budget"}</option>;
        })}
      </select>
    );
  }
  const inGrid = bf.grid !== false;
  const value = bfValue(bf.type, bf.prm, bf.exo);
  const tooHigh = bf.prm > (BF_PIECE_MAX_PRM[bf.type] ?? 0);
  const bad = avoid.includes(bf.type) || BF_CAP[bf.type] === undefined || tooHigh || (inGrid && (used[bf.type] ?? 0) > (BF_CAP[bf.type] ?? 0) + 1e-9);
  const color = bad ? "#b03a2e" : "#1a7a46";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "2px", padding: "1px 3px", borderRadius: "4px", background: bad ? "#fdecea" : "#e8f6ee" }}>
      <select style={{ ...bfSel, color, fontWeight: 600 }} value={bf.type} onChange={e => e.target.value ? set({ ...bf, type: e.target.value as BefoulmentType }) : set(undefined)}>
        <option value="">✕ clear</option>
        {BEFOULMENTS.map(t => <option key={t} value={t}>{t}</option>)}
      </select>
      <select style={bfSel} value={bf.prm} title="Permeation" onChange={e => set({ ...bf, prm: Number(e.target.value) })}>
        {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>Prm{n}</option>)}
      </select>
      <select style={bfSel} value={bf.exo} title="Exorcision level" onChange={e => set({ ...bf, exo: Number(e.target.value) })}>
        {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>Exo{n}</option>)}
      </select>
      <label title="Counts against this element's grid budget" style={{ fontSize: "10px", color: "#666", display: "inline-flex", alignItems: "center", gap: "1px", cursor: "pointer" }}>
        <input type="checkbox" checked={inGrid} onChange={e => set({ ...bf, grid: e.target.checked })} style={{ margin: 0 }} />grid
      </label>
      <span style={{ fontSize: "10px", color, marginLeft: "2px" }} title={bad ? (avoid.includes(bf.type) ? "Undercuts this weapon's skills" : BF_CAP[bf.type] === undefined ? "Never worth taking" : tooHigh ? `Permeation worse than Prm${BF_PIECE_MAX_PRM[bf.type]} — not worth keeping` : "Puts this element over its budget") : "Within budget"}>
        −{pct(value)}
      </span>
    </span>
  );
}
