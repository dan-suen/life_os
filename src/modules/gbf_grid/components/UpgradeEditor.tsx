import { AWAKEN_TYPES, type AwakenType, type CopyProgress, type Mats, type Stage } from "../data";
import { ANIMA, PENDANTS, QUARTZ, STAGE_KEYS, STONES, isSkillStage, matCategory, sortStages } from "../materials";

const labelStyle = { fontSize: "10px", fontWeight: 600 as const, color: "#666", textTransform: "uppercase" as const, letterSpacing: "0.05em" };
const sel: React.CSSProperties = { border: "1px solid #d0d0d0", background: "#fff", color: "#1a1a1a", padding: "4px 6px", borderRadius: "5px", fontSize: "12px", cursor: "pointer" };
const num: React.CSSProperties = { ...sel, width: "80px", cursor: "text" };
const link: React.CSSProperties = { fontSize: "11px", color: "#2253c7", cursor: "pointer", userSelect: "none" };
const box: React.CSSProperties = { background: "#fff", border: "1px solid #eee", borderRadius: "6px", padding: "10px 12px", display: "flex", flexDirection: "column", gap: "8px" };

const VARIANTS = { Stone: STONES, Quartz: QUARTZ, Anima: ANIMA, Pendant: PENDANTS } as const;
type Kind = keyof typeof VARIANTS;

interface StagesProps {
  stages: Stage[];
  onChange: (stages: Stage[]) => void;
}

/** Per-copy upgrade stages: pick the stage, then material type → variant → amount. "Skill" is a plain toggle. */
export function StagesEditor({ stages, onChange }: StagesProps) {
  const unused = STAGE_KEYS.filter(k => !stages.some(s => s.key === k));

  const matsFor = (key: string, mats: Mats): Mats => isSkillStage(key) ? {} : mats;
  const set = (next: Stage[]) => onChange(sortStages(next));
  const patch = (i: number, s: Stage) => set(stages.map((x, j) => j === i ? s : x));

  function setLine(i: number, oldName: string, name: string, n: number) {
    const entries = Object.entries(stages[i].mats).map(([k, v]) => k === oldName ? [name, n] as const : [k, v] as const);
    patch(i, { ...stages[i], mats: Object.fromEntries(entries) });
  }
  function addLine(i: number) {
    const taken = Object.keys(stages[i].mats);
    const name = [...STONES, ...QUARTZ, ...ANIMA, ...PENDANTS].find(n => !taken.includes(n))!;
    patch(i, { ...stages[i], mats: { ...stages[i].mats, [name]: 0 } });
  }
  function removeLine(i: number, name: string) {
    const { [name]: _, ...rest } = stages[i].mats;
    patch(i, { ...stages[i], mats: rest });
  }

  return (
    <div style={box}>
      <span style={labelStyle}>Upgrade stages (per copy)</span>
      {stages.map((st, i) => (
        <div key={st.key} style={{ display: "flex", gap: "10px", alignItems: "flex-start", borderTop: i ? "1px solid #f3f3f3" : "none", paddingTop: i ? "8px" : 0 }}>
          <select style={{ ...sel, fontWeight: 600, width: "90px" }} value={st.key}
            onChange={e => patch(i, { key: e.target.value, mats: matsFor(e.target.value, st.mats) })}>
            {[st.key, ...unused].map(k => <option key={k}>{k}</option>)}
          </select>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
            {isSkillStage(st.key) ? (
              <span style={{ fontSize: "12px", color: "#888", padding: "4px 0" }}>Skill fully levelled — no materials tracked</span>
            ) : (
              <>
                {Object.entries(st.mats).map(([name, n]) => {
                  const kind = (matCategory(name) ?? "Stone") as Kind;
                  return (
                    <div key={name} style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      <select style={sel} value={kind} onChange={e => setLine(i, name, VARIANTS[e.target.value as Kind][0], n)}>
                        {(Object.keys(VARIANTS) as Kind[]).map(k => <option key={k}>{k}</option>)}
                      </select>
                      <select style={sel} value={name} onChange={e => setLine(i, name, e.target.value, n)}>
                        {VARIANTS[kind].map(v => <option key={v} disabled={v !== name && v in st.mats}>{v}</option>)}
                      </select>
                      <input type="number" min={0} style={num} value={n} onChange={e => setLine(i, name, name, Math.max(0, Number(e.target.value)))} />
                      <span style={{ ...link, color: "#c0392b" }} onClick={() => removeLine(i, name)}>✕</span>
                    </div>
                  );
                })}
                <span style={link} onClick={() => addLine(i)}>+ material</span>
              </>
            )}
          </div>
          <span style={{ ...link, color: "#c0392b" }} onClick={() => set(stages.filter((_, j) => j !== i))}>remove</span>
        </div>
      ))}
      {unused.length > 0 && (
        <span style={link} onClick={() => set([...stages, { key: unused[0], mats: {} }])}>+ stage</span>
      )}
    </div>
  );
}

interface CopiesProps {
  copies: CopyProgress[];
  onChange: (copies: CopyProgress[]) => void;
}

/** Number of copies and each copy's awakening type. */
export function CopiesEditor({ copies, onChange }: CopiesProps) {
  function resize(n: number) {
    onChange(n > copies.length
      ? [...copies, ...Array.from({ length: n - copies.length }, () => ({ done: [], awaken: "" as AwakenType }))]
      : copies.slice(0, n));
  }
  return (
    <div style={box}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
        <span style={labelStyle}>Copies</span>
        <select style={sel} value={copies.length} onChange={e => resize(Number(e.target.value))}>
          {Array.from({ length: 10 }, (_, i) => i + 1).map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        {copies.map((c, i) => (
          <label key={i} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#888" }}>
            #{i + 1}
            <select style={sel} value={c.awaken}
              onChange={e => onChange(copies.map((x, j) => j === i ? { ...x, awaken: e.target.value as AwakenType } : x))}>
              {AWAKEN_TYPES.map(t => <option key={t} value={t}>{t || "No awakening type"}</option>)}
            </select>
          </label>
        ))}
      </div>
    </div>
  );
}
