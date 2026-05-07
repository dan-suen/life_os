import { useState } from "react";
import type { Day, TvShow } from "./types";
import { DAYS, TODAY_DAY, defaultShowForm } from "./types";
import { s } from "./styles";
import { useTvShows } from "./hooks/useTvShows";
import { ShowRow } from "./components/ShowRow";
import { AddPanel } from "./components/AddPanel";
import { EditPanel } from "./components/EditPanel";
import { ImportPanel } from "./components/ImportPanel";

export default function TvShowsModule() {
  const { shows, loading, saving, error, setError, add, update, remove, toggleCaughtUp, adjustEpisode, importShows } = useTvShows();

  const [activeDay, setActiveDay] = useState<Day>(TODAY_DAY);
  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editing, setEditing] = useState<TvShow | null>(null);

  const dayShows = shows.filter(s => s.air_day === activeDay);

  async function handleAdd(form: Omit<TvShow, "id">) {
    if (!form.name.trim()) return;
    const ok = await add(form);
    if (ok) setShowAdd(false);
  }

  async function handleSaveEdit() {
    if (!editing) return;
    const ok = await update(editing);
    if (ok) setEditing(null);
  }

  async function handleImport(newShows: Omit<TvShow, "id">[]) {
    const ok = await importShows(newShows);
    if (ok) setShowImport(false);
  }

  return (
    <div style={s.app}>
      <div style={s.header}>
        <div style={s.headerTop}>
          <div>
            <div style={s.title}>TV Shows</div>
            <div style={s.subtitle}>{shows.length} shows · {shows.filter(s => s.air_day === TODAY_DAY).length} airing today</div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button style={s.btn("#2253c7", "#f0f4ff", "#c6d3f5")} onClick={() => { setShowImport(!showImport); setShowAdd(false); }}>↑ Import CSV</button>
            <button style={s.btn("#1a1a1a", "#f5f5f5", "#e0e0e0")} onClick={() => { setShowAdd(!showAdd); setShowImport(false); }}>+ Add</button>
          </div>
        </div>
        <div style={{ display: "flex", gap: "4px" }}>
          {DAYS.map(day => {
            const isToday = day === TODAY_DAY;
            const isActive = activeDay === day;
            return (
              <button key={day} onClick={() => setActiveDay(day)} style={{
                padding: "8px 14px", borderRadius: "6px 6px 0 0", fontSize: "13px",
                fontWeight: isActive ? 700 : 500, cursor: "pointer",
                border: "1px solid #e5e5e5",
                borderBottom: isActive ? `2px solid ${isToday ? "#7c3aed" : "#1a1a1a"}` : "1px solid #e5e5e5",
                background: isActive ? "#fff" : "#f5f5f5",
                color: isActive ? (isToday ? "#7c3aed" : "#1a1a1a") : "#666",
                transition: "all 0.1s", whiteSpace: "nowrap",
              }}>
                {day}{isToday ? " ·" : ""}
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div style={{ background: "#fff0f0", color: "#c0392b", padding: "10px 32px", fontSize: "12px", borderBottom: "1px solid #f5c6c6" }}>
          ⚠ {error} <span style={{ cursor: "pointer", textDecoration: "underline", marginLeft: "8px" }} onClick={() => setError(null)}>dismiss</span>
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "40vh", color: "#aaa" }}>Loading…</div>
      ) : (
        <div style={s.main}>
          {showImport && <ImportPanel saving={saving} onImport={handleImport} onCancel={() => setShowImport(false)} />}
          {editing && <EditPanel form={editing} saving={saving} onChange={setEditing} onSave={handleSaveEdit} onCancel={() => setEditing(null)} />}
          {showAdd && <AddPanel defaultDay={activeDay} saving={saving} onAdd={handleAdd} onCancel={() => setShowAdd(false)} />}

          {dayShows.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px", color: "#aaa", fontSize: "13px" }}>No shows for {activeDay}</div>
          ) : (
            <div style={s.list}>
              {dayShows.map(show => (
                <ShowRow key={show.id} show={show}
                  onToggleCaughtUp={toggleCaughtUp}
                  onAdjustEpisode={adjustEpisode}
                  onEdit={setEditing}
                  onDelete={remove}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div style={s.footer}>
        ☑ caught up · ✎ edit · ✕ delete · {defaultShowForm(activeDay).air_day}
        {saving && <span style={{ marginLeft: "12px", color: "#2253c7" }}>Saving…</span>}
      </div>
    </div>
  );
}
