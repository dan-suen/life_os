import { useState } from "react";
import type { TvShow, Day, Status, MediaType } from "../types";
import { DAYS, STATUSES, MEDIA_TYPES, defaultShowForm } from "../types";
import { s } from "../styles";
import { fetchMalByUrl, searchMalByName } from "../utils/mal";

interface Props {
  defaultDay: Day;
  saving: boolean;
  onAdd: (form: Omit<TvShow, "id">) => void;
  onCancel: () => void;
}

export function AddPanel({ defaultDay, saving, onAdd, onCancel }: Props) {
  const [form, setForm] = useState(defaultShowForm(defaultDay));
  const [fetching, setFetching] = useState(false);
  const fieldStyle = { display: "flex", flexDirection: "column" as const, gap: "4px", flex: 1, minWidth: "100px" };

  async function handleUrlChange(url: string) {
    setForm(f => ({ ...f, url: url || null }));
    if (!url.includes("myanimelist.net/anime/")) return;
    setFetching(true);
    const info = await fetchMalByUrl(url);
    setFetching(false);
    if (info) setForm(f => ({ ...f, name: info.name, type: info.type, status: info.status, url, poster: info.poster }));
  }

  async function handleFetchByName() {
    if (!form.name.trim()) return;
    setFetching(true);
    const info = await searchMalByName(form.name);
    setFetching(false);
    if (info) setForm(f => ({ ...f, name: info.name, type: info.type, status: info.status, url: info.url, poster: info.poster }));
  }

  const showFetchBtn = !fetching && form.name.trim() !== "";

  return (
    <div style={{ background: "#f0fff4", border: "1px solid #a8e6c0", borderRadius: "8px", padding: "16px", marginBottom: "12px" }}>
      <div style={{ fontSize: "12px", fontWeight: 600, color: "#1a9e5c", marginBottom: "12px" }}>
        New Show {fetching && <span style={{ fontWeight: 400, color: "#888" }}>— fetching from MAL…</span>}
      </div>
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "12px" }}>
        <div style={{ ...fieldStyle, flex: 3, minWidth: "200px" }}>
          <label style={s.label}>Name</label>
          <div style={{ display: "flex", gap: "6px" }}>
            <input autoFocus style={s.input} placeholder="Show name…" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              onKeyDown={e => { if (e.key === "Enter" && form.name.trim()) onAdd(form); if (e.key === "Escape") onCancel(); }} />
            {showFetchBtn && (
              <button style={{ ...s.btn("#2253c7", "#f0f4ff", "#c6d3f5"), whiteSpace: "nowrap" }} onClick={handleFetchByName}>
                ↓ MAL
              </button>
            )}
          </div>
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
          <input style={s.input} placeholder="https://myanimelist.net/anime/…" value={form.url ?? ""}
            onChange={e => handleUrlChange(e.target.value)} />
        </div>
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        <button style={s.btn("#fff", "#1a9e5c", "#1a9e5c")} disabled={saving || fetching || !form.name.trim()} onClick={() => onAdd(form)}>Add</button>
        <button style={s.btn("#555", "#f5f5f5", "#e0e0e0")} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}
