import type { TvShow, Day, Status, MediaType } from "../types";
import { DAYS, STATUSES, MEDIA_TYPES } from "../types";
import { s } from "../styles";

interface Props {
  form: TvShow;
  saving: boolean;
  onChange: (form: TvShow) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function EditPanel({ form, saving, onChange, onSave, onCancel }: Props) {
  const fieldStyle = { display: "flex", flexDirection: "column" as const, gap: "4px", flex: 1, minWidth: "100px" };

  return (
    <div style={{ background: "#fffbea", border: "1px solid #f0c040", borderRadius: "8px", padding: "16px", marginBottom: "12px" }}>
      <div style={{ fontSize: "12px", fontWeight: 600, color: "#b07d00", marginBottom: "12px" }}>Editing show</div>
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "12px" }}>
        <div style={{ ...fieldStyle, flex: 3, minWidth: "200px" }}>
          <label style={s.label}>Name</label>
          <input autoFocus style={s.input} value={form.name}
            onChange={e => onChange({ ...form, name: e.target.value })}
            onKeyDown={e => { if (e.key === "Enter") onSave(); if (e.key === "Escape") onCancel(); }} />
        </div>
        <div style={fieldStyle}>
          <label style={s.label}>Air Day</label>
          <select style={s.smallSel} value={form.air_day} onChange={e => onChange({ ...form, air_day: e.target.value as Day })}>
            {DAYS.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>
        <div style={fieldStyle}>
          <label style={s.label}>Status</label>
          <select style={s.smallSel} value={form.status} onChange={e => onChange({ ...form, status: e.target.value as Status })}>
            {STATUSES.map(st => <option key={st}>{st}</option>)}
          </select>
        </div>
        <div style={fieldStyle}>
          <label style={s.label}>Episode</label>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", height: "32px" }}>
            <button style={s.episodeBtn} onClick={() => onChange({ ...form, episode: Math.max(0, form.episode - 1) })}>−</button>
            <span style={{ fontSize: "13px", minWidth: "36px", textAlign: "center" }}>
              {form.episode > 0 ? `E${form.episode}` : "—"}
            </span>
            <button style={s.episodeBtn} onClick={() => onChange({ ...form, episode: form.episode + 1 })}>+</button>
          </div>
        </div>
        <div style={fieldStyle}>
          <label style={s.label}>Type</label>
          <select style={s.smallSel} value={form.type} onChange={e => onChange({ ...form, type: e.target.value as MediaType })}>
            {MEDIA_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div style={fieldStyle}>
          <label style={s.label}>Caught Up</label>
          <div style={{ display: "flex", alignItems: "center", height: "32px" }}>
            <input type="checkbox" checked={form.caught_up} onChange={() => onChange({ ...form, caught_up: !form.caught_up })} />
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "12px" }}>
        <div style={{ ...fieldStyle, flex: 1, minWidth: "200px" }}>
          <label style={s.label}>URL</label>
          <input style={s.input} placeholder="https://…" value={form.url ?? ""}
            onChange={e => onChange({ ...form, url: e.target.value || null })} />
        </div>
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        <button style={s.btn("#fff", "#1a9e5c", "#1a9e5c")} disabled={saving} onClick={onSave}>Save</button>
        <button style={s.btn("#555", "#f5f5f5", "#e0e0e0")} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}
