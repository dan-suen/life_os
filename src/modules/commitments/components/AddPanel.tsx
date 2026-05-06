import type { Commitment, Area, Tier, Effort, Impact, Energy } from "../types";
import { AREAS, TIERS, EFFORTS, IMPACTS, ENERGIES } from "../types";
import { s } from "../styles";

interface Props {
  showArea: boolean;
  saving: boolean;
  form: Omit<Commitment, "id">;
  onChange: (form: Omit<Commitment, "id">) => void;
  onAdd: () => void;
  onCancel: () => void;
}

const labelStyle = { fontSize: "10px", fontWeight: 600, color: "#666", textTransform: "uppercase" as const, letterSpacing: "0.05em" };
const fieldStyle = { display: "flex", flexDirection: "column" as const, gap: "4px", flex: 1, minWidth: "90px" };

export function AddPanel({ showArea, saving, form, onChange, onAdd, onCancel }: Props) {
  return (
    <div style={{ background: "#f0fff4", border: "1px solid #a8e6c0", borderRadius: "8px", padding: "16px", marginBottom: "12px" }}>
      <div style={{ fontSize: "12px", fontWeight: 600, color: "#1a9e5c", marginBottom: "12px" }}>New Commitment</div>
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "10px" }}>
        <div style={{ ...fieldStyle, flex: 3, minWidth: "180px" }}>
          <label style={labelStyle}>Name</label>
          <input autoFocus style={s.input} placeholder="Name…" value={form.name}
            onChange={e => onChange({ ...form, name: e.target.value })}
            onKeyDown={e => { if (e.key === "Enter") onAdd(); if (e.key === "Escape") onCancel(); }} />
        </div>
        <div style={{ ...fieldStyle, flex: 2, minWidth: "140px" }}>
          <label style={labelStyle}>Note</label>
          <input style={s.input} placeholder="Note…" value={form.note}
            onChange={e => onChange({ ...form, note: e.target.value })} />
        </div>
      </div>
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "12px" }}>
        {showArea && (
          <div style={fieldStyle}>
            <label style={labelStyle}>Area</label>
            <select style={s.smallSel} value={form.area} onChange={e => onChange({ ...form, area: e.target.value as Area })}>
              {AREAS.map(a => <option key={a}>{a}</option>)}
            </select>
          </div>
        )}
        <div style={fieldStyle}>
          <label style={labelStyle}>Tier</label>
          <select style={s.smallSel} value={form.tier} onChange={e => onChange({ ...form, tier: e.target.value as Tier })}>
            {TIERS.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Effort</label>
          <select style={s.smallSel} value={form.effort} onChange={e => onChange({ ...form, effort: e.target.value as Effort })}>
            {EFFORTS.map(e => <option key={e}>{e}</option>)}
          </select>
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Impact</label>
          <select style={s.smallSel} value={form.impact} onChange={e => onChange({ ...form, impact: e.target.value as Impact })}>
            {IMPACTS.map(i => <option key={i}>{i}</option>)}
          </select>
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Energy</label>
          <select style={s.smallSel} value={form.energy} onChange={e => onChange({ ...form, energy: e.target.value as Energy })}>
            {ENERGIES.map(e => <option key={e}>{e}</option>)}
          </select>
        </div>
        <div style={{ ...fieldStyle, minWidth: "120px" }}>
          <label style={labelStyle}>Deadline</label>
          <input type="date" style={{ ...s.input, fontSize: "12px" }} value={form.deadline ?? ""}
            onChange={e => onChange({ ...form, deadline: e.target.value || null })} />
        </div>
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        <button style={s.btn("#fff", "#1a9e5c", "#1a9e5c")} disabled={saving} onClick={onAdd}>Add</button>
        <button style={s.btn("#555", "#f5f5f5", "#e0e0e0")} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}
