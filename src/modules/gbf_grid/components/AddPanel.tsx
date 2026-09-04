import { useState } from "react";
import type { Weapon, Element } from "../data";
import { ELEMENTS, GROUPS, defaultWeaponForm } from "../data";

interface Props {
  source: string;
  saving: boolean;
  onAdd: (form: Omit<Weapon, "id">) => void;
  onCancel: () => void;
}

const fieldStyle = { display: "flex", flexDirection: "column" as const, gap: "4px", flex: 1, minWidth: "100px" };
const labelStyle = { fontSize: "10px", fontWeight: 600 as const, color: "#666", textTransform: "uppercase" as const, letterSpacing: "0.05em" };
const inputStyle = { border: "1px solid #d0d0d0", background: "#fff", color: "#1a1a1a", padding: "6px 10px", borderRadius: "5px", fontSize: "13px", width: "100%", minWidth: 0, boxSizing: "border-box" as const, outline: "none" };
const selStyle = { border: "1px solid #d0d0d0", background: "#fff", color: "#1a1a1a", padding: "5px 6px", borderRadius: "5px", fontSize: "12px", cursor: "pointer", width: "100%", minWidth: 0 };
const btnStyle = (color: string, bg: string, border: string) => ({ background: bg, color, border: `1px solid ${border}`, padding: "6px 14px", borderRadius: "6px", fontSize: "12px", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" as const });

export function AddPanel({ source, saving, onAdd, onCancel }: Props) {
  const [form, setForm] = useState(defaultWeaponForm(source));

  return (
    <div style={{ background: "#f0fff4", border: "1px solid #a8e6c0", borderRadius: "8px", padding: "16px", marginBottom: "12px" }}>
      <div style={{ fontSize: "12px", fontWeight: 600, color: "#1a9e5c", marginBottom: "12px" }}>New Weapon</div>
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "12px" }}>
        <div style={{ ...fieldStyle, flex: 3, minWidth: "200px" }}>
          <label style={labelStyle}>Name</label>
          <input autoFocus style={inputStyle} placeholder="Weapon name…" value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            onKeyDown={e => { if (e.key === "Enter" && form.name.trim()) onAdd(form); if (e.key === "Escape") onCancel(); }} />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Group</label>
          <select style={selStyle} value={form.source} onChange={e => setForm({ ...form, source: e.target.value })}>
            {GROUPS.map(g => <option key={g}>{g}</option>)}
          </select>
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Element</label>
          <select style={selStyle} value={form.element} onChange={e => setForm({ ...form, element: e.target.value as Element })}>
            {ELEMENTS.map(el => <option key={el}>{el}</option>)}
          </select>
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Rank</label>
          <input style={inputStyle} placeholder="—" value={form.rank} onChange={e => setForm({ ...form, rank: e.target.value })} />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Copies</label>
          <input style={inputStyle} placeholder="2" value={form.copies} onChange={e => setForm({ ...form, copies: e.target.value })} />
        </div>
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        <button style={btnStyle("#fff", "#1a9e5c", "#1a9e5c")} disabled={saving || !form.name.trim()} onClick={() => onAdd(form)}>Add</button>
        <button style={btnStyle("#555", "#f5f5f5", "#e0e0e0")} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}
