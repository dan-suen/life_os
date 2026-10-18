import { AWAKEN_TYPES, type AwakenType, type CopyProgress, type Weapon } from "../data";
import { copiesOf, isAwakenStage } from "../materials";

interface Props {
  weapon: Weapon;
  onChange: (progress: CopyProgress[]) => void;
}

const chip = (done: boolean, awaken: boolean): React.CSSProperties => ({
  padding: "1px 7px", borderRadius: "10px", fontSize: "11px", cursor: "pointer", userSelect: "none",
  border: `1px solid ${done ? "#1a1a1a" : awaken ? "#c9a227" : "#ccc"}`,
  background: done ? (awaken ? "#c9a227" : "#1a1a1a") : "#fff",
  color: done ? "#fff" : awaken ? "#9a7a10" : "#666",
});

/** One line per copy: awakening type + a toggle chip per stage. */
export function ProgressCell({ weapon, onChange }: Props) {
  const copies = copiesOf(weapon);
  if (!weapon.stages?.length) return <span style={{ color: "#bbb" }}>—</span>;

  function patch(i: number, next: Partial<CopyProgress>) {
    onChange(copies.map((c, j) => j === i ? { ...c, ...next } : c));
  }
  function toggle(i: number, key: string) {
    const done = copies[i].done;
    patch(i, { done: done.includes(key) ? done.filter(k => k !== key) : [...done, key] });
  }
  function resize(n: number) {
    if (n < 1) return;
    onChange(n > copies.length ? [...copies, ...Array.from({ length: n - copies.length }, () => ({ done: [], awaken: "" as AwakenType }))] : copies.slice(0, n));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }} onClick={e => e.stopPropagation()}>
      {copies.map((c, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: "4px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "11px", color: "#999", width: "18px" }}>#{i + 1}</span>
          <select value={c.awaken} onChange={e => patch(i, { awaken: e.target.value as AwakenType })}
            style={{ fontSize: "11px", border: "1px solid #ddd", borderRadius: "4px", padding: "0 2px", background: "#fff" }}>
            {AWAKEN_TYPES.map(t => <option key={t} value={t}>{t || "—"}</option>)}
          </select>
          {weapon.stages.map(st => (
            <span key={st.key} style={chip(c.done.includes(st.key), isAwakenStage(st.key))} onClick={() => toggle(i, st.key)}>
              {st.key}
            </span>
          ))}
        </div>
      ))}
      <div style={{ display: "flex", gap: "6px", fontSize: "11px", color: "#aaa" }}>
        <span style={{ cursor: "pointer" }} onClick={() => resize(copies.length + 1)}>+ copy</span>
        {copies.length > 1 && <span style={{ cursor: "pointer" }} onClick={() => resize(copies.length - 1)}>− copy</span>}
      </div>
    </div>
  );
}
