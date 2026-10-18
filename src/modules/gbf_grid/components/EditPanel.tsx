import { useState } from "react";
import type { Weapon, Element } from "../data";
import { stagesToText, textToStages } from "../materials";
import { ELEMENTS, GROUPS } from "../data";

interface Props {
  form: Weapon;
  saving: boolean;
  onChange: (form: Weapon) => void;
  onSave: () => void;
  onCancel: () => void;
}

const fieldStyle = { display: "flex", flexDirection: "column" as const, gap: "4px", flex: 1, minWidth: "100px" };
const labelStyle = { fontSize: "10px", fontWeight: 600 as const, color: "#666", textTransform: "uppercase" as const, letterSpacing: "0.05em" };
const inputStyle = { border: "1px solid #d0d0d0", background: "#fff", color: "#1a1a1a", padding: "6px 10px", borderRadius: "5px", fontSize: "13px", width: "100%", minWidth: 0, boxSizing: "border-box" as const, outline: "none" };
const selStyle = { border: "1px solid #d0d0d0", background: "#fff", color: "#1a1a1a", padding: "5px 6px", borderRadius: "5px", fontSize: "12px", cursor: "pointer", width: "100%", minWidth: 0 };
const btnStyle = (color: string, bg: string, border: string) => ({ background: bg, color, border: `1px solid ${border}`, padding: "6px 14px", borderRadius: "6px", fontSize: "12px", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" as const });

export function EditPanel({ form, saving, onChange, onSave, onCancel }: Props) {
  const [stagesText, setStagesText] = useState(() => stagesToText(form.stages));
  return (
    <div style={{ background: "#fffbea", border: "1px solid #f0c040", borderRadius: "8px", padding: "16px", marginBottom: "12px" }}>
      <div style={{ fontSize: "12px", fontWeight: 600, color: "#b07d00", marginBottom: "12px" }}>Editing weapon</div>
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "12px" }}>
        <div style={{ ...fieldStyle, flex: 3, minWidth: "200px" }}>
          <label style={labelStyle}>Name</label>
          <input autoFocus style={inputStyle} value={form.name}
            onChange={e => onChange({ ...form, name: e.target.value })}
            onKeyDown={e => { if (e.key === "Enter") onSave(); if (e.key === "Escape") onCancel(); }} />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Group</label>
          <select style={selStyle} value={form.source} onChange={e => onChange({ ...form, source: e.target.value })}>
            {GROUPS.map(g => <option key={g}>{g}</option>)}
            {!GROUPS.includes(form.source) && <option>{form.source}</option>}
          </select>
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Element</label>
          <select style={selStyle} value={form.element} onChange={e => onChange({ ...form, element: e.target.value as Element })}>
            {ELEMENTS.map(el => <option key={el}>{el}</option>)}
          </select>
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Rank</label>
          <input style={inputStyle} value={form.rank} onChange={e => onChange({ ...form, rank: e.target.value })} />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Copies</label>
          <input style={inputStyle} value={form.copies} onChange={e => onChange({ ...form, copies: e.target.value })} />
        </div>
      </div>
      <div style={{ ...fieldStyle, marginBottom: "12px" }}>
        <label style={labelStyle}>Stages per copy (one per line, "Awaken…" = awakening)</label>
        <textarea style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} rows={4}
          placeholder={"4★: 200 Katana Stone, 200 Light Quartz, 10 Horus Omega Anima\nSL15: 12000 Skill Points\nAwaken: 15 Horus Omega Anima"}
          value={stagesText} onChange={e => { setStagesText(e.target.value); onChange({ ...form, stages: textToStages(e.target.value) }); }} />
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        <button style={btnStyle("#fff", "#1a9e5c", "#1a9e5c")} disabled={saving || !form.name.trim()} onClick={onSave}>Save</button>
        <button style={btnStyle("#555", "#f5f5f5", "#e0e0e0")} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}
