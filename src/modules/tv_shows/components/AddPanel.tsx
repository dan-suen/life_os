import { useState } from "react";
import type { TvShow, Day, Status, MediaType } from "../types";
import { DAYS, STATUSES, MEDIA_TYPES, defaultShowForm } from "../types";
import { s } from "../styles";

interface Props {
  defaultDay: Day;
  saving: boolean;
  onAdd: (form: Omit<TvShow, "id">) => void;
  onCancel: () => void;
}

export function AddPanel({ defaultDay, saving, onAdd, onCancel }: Props) {
  const [form, setForm] = useState(defaultShowForm(defaultDay));
  const fieldStyle = { display: "flex", flexDirection: "column" as const, gap: "4px", flex: 1, minWidth: "100px" };

  return (
    <div style={{ background: "#f0fff4", border: "1px solid #a8e6c0", borderRadius: "8px", padding: "16px", marginBottom: "12px" }}>
      <div style={{ fontSize: "12px", fontWeight: 600, color: "#1a9e5c", marginBottom: "12px" }}>New Show</div>
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "12px" }}>
        <div style={{ ...fieldStyle, flex: 3, minWidth: "200px" }}>
          <label style={s.label}>Name</label>
          <input autoFocus style={s.input} placeholder="Show name…" value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            onKeyDown={e => { if (e.key === "Enter" && form.name.trim()) onAdd(form); if (e.key === "Escape") onCancel(); }} />
        </div>
        <div style={fieldStyle}>
          <label style={s.label}>Air Day</label>
          <select style={s.smallSel} value={form.air_day} onChange={e => setForm({ ...form, air_day: e.target.value as Day })}>
            {DAYS.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>
        <div style={fieldStyle}>
          <label style={s.label}>Status</label>
          <select style={s.smallSel} value={form.status} onChange={e => setForm({ ...form, status: e.target.value as Status })}>
            {STATUSES.map(st => <option key={st}>{st}</option>)}
          </select>
        </div>
        <div style={fieldStyle}>
          <label style={s.label}>Type</label>
          <select style={s.smallSel} value={form.type} onChange={e => setForm({ ...form, type: e.target.value as MediaType })}>
            {MEDIA_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div style={{ ...fieldStyle, flex: 3, minWidth: "200px" }}>
          <label style={s.label}>URL</label>
          <input style={s.input} placeholder="https://…" value={form.url ?? ""}
            onChange={e => setForm({ ...form, url: e.target.value || null })} />
        </div>
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        <button style={s.btn("#fff", "#1a9e5c", "#1a9e5c")} disabled={saving || !form.name.trim()} onClick={() => onAdd(form)}>Add</button>
        <button style={s.btn("#555", "#f5f5f5", "#e0e0e0")} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}
