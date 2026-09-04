import { useState } from "react";
import { ELEMENT_META, GROUPS, type Element, type Weapon } from "./data";
import { useGbfGrid } from "./hooks/useGbfGrid";
import { useWeapons } from "./hooks/useWeapons";
import { AddPanel } from "./components/AddPanel";
import { EditPanel } from "./components/EditPanel";

type ElementFilter = Element | "All";
const FILTERS: ElementFilter[] = ["All", "Fire", "Wind", "Water", "Earth", "Light", "Dark", "Any"];

function elementStyle(el: Element): React.CSSProperties {
  const m = ELEMENT_META[el];
  return { display: "inline-block", padding: "2px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: 600, background: m.bg, color: m.color };
}

export default function GbfGridModule() {
  const [activeGroup, setActiveGroup] = useState<string>(GROUPS[0]);
  const [elementFilter, setElementFilter] = useState<ElementFilter>("All");
  const { isChecked, loading: checkedLoading, error: checkedError, setError: setCheckedError, toggle } = useGbfGrid();
  const { weapons: WEAPONS, loading: weaponsLoading, saving, error: weaponsError, setError: setWeaponsError, add, update, remove } = useWeapons();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Weapon | null>(null);

  const loading = checkedLoading || weaponsLoading;
  const error = weaponsError ?? checkedError;
  function dismissError() { setWeaponsError(null); setCheckedError(null); }

  // Group tabs: canonical order (only groups with data), plus any stragglers in the data.
  const extraGroups = Array.from(new Set(WEAPONS.map(w => w.source).filter(s => s && !GROUPS.includes(s)))).sort();
  const groupTabs = [...GROUPS.filter(g => WEAPONS.some(w => w.source === g)), ...extraGroups];

  const groupWeapons = WEAPONS.filter(w => w.source === activeGroup);
  const matchesFilter = (w: Weapon) => elementFilter === "All" || w.element === elementFilter || w.element === "Any";
  const weapons = groupWeapons.filter(matchesFilter);

  const groupDone = groupWeapons.filter(w => isChecked(w.element, w.name)).length;
  const viewDone = weapons.filter(w => isChecked(w.element, w.name)).length;

  async function handleAdd(form: Omit<Weapon, "id">) {
    if (!form.name.trim()) return;
    const ok = await add(form);
    if (ok) setShowAdd(false);
  }
  async function handleSaveEdit() {
    if (!editing) return;
    const ok = await update(editing);
    if (ok) setEditing(null);
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f9f9f9" }}>
      {/* Group tabs */}
      <div style={{ background: "#1a1a1a", padding: "8px 24px 0", display: "flex", gap: "2px", flexWrap: "wrap" }}>
        {groupTabs.map(g => {
          const total = WEAPONS.filter(w => w.source === g).length;
          const done = WEAPONS.filter(w => w.source === g && isChecked(w.element, w.name)).length;
          const isActive = g === activeGroup;
          return (
            <button key={g} onClick={() => { setActiveGroup(g); setShowAdd(false); setEditing(null); }} style={{
              padding: "8px 14px", border: "none", cursor: "pointer", fontSize: "12px",
              background: isActive ? "#f9f9f9" : "transparent",
              color: isActive ? "#1a1a1a" : "#999",
              fontWeight: isActive ? 700 : 400,
              borderRadius: "6px 6px 0 0", whiteSpace: "nowrap",
            }}>
              {g} <span style={{ fontSize: "10px", opacity: 0.7 }}>{done}/{total}</span>
            </button>
          );
        })}
      </div>

      {/* Header + element filter */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e5e5", padding: "16px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
            <span style={{ fontSize: "17px", fontWeight: 700, letterSpacing: "-0.02em" }}>{activeGroup}</span>
            <span style={{ fontSize: "13px", color: "#888" }}>{groupDone}/{groupWeapons.length} obtained</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <select
              value={elementFilter}
              onChange={e => setElementFilter(e.target.value as ElementFilter)}
              style={{ border: "1px solid #d5d5d5", borderRadius: "6px", padding: "5px 8px", fontSize: "12px", background: "#fff", cursor: "pointer" }}
            >
              {FILTERS.map(f => <option key={f} value={f}>{f === "All" ? "All elements" : f}</option>)}
            </select>
            <button
              style={{ background: "#1a1a1a", color: "#fff", border: "none", padding: "6px 14px", borderRadius: "6px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}
              onClick={() => { setShowAdd(!showAdd); setEditing(null); }}
            >
              + Add
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ background: "#fff0f0", color: "#c0392b", padding: "10px 24px", fontSize: "12px", borderBottom: "1px solid #f5c6c6" }}>
          ⚠ {error}{" "}
          <span style={{ cursor: "pointer", textDecoration: "underline", marginLeft: "8px" }} onClick={dismissError}>dismiss</span>
        </div>
      )}

      <div style={{ flex: 1, padding: "24px" }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "40vh", color: "#aaa" }}>Loading…</div>
        ) : (
          <>
            {showAdd && (
              <AddPanel source={activeGroup} saving={saving} onAdd={handleAdd} onCancel={() => setShowAdd(false)} />
            )}
            {editing && (
              <EditPanel form={editing} saving={saving} onChange={setEditing} onSave={handleSaveEdit} onCancel={() => setEditing(null)} />
            )}
            <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: "8px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
              <thead>
                <tr style={{ background: "#1a1a1a", color: "#fff" }}>
                  <th style={thStyle("40px")}>✓</th>
                  <th style={thStyle()}>Weapon</th>
                  <th style={thStyle("90px")}>Element</th>
                  <th style={thStyle("70px")}>Rank</th>
                  <th style={thStyle("220px")}>Copies</th>
                  <th style={thStyle("70px")}></th>
                </tr>
              </thead>
              <tbody>
                {weapons.map((w, i) => {
                  const done = isChecked(w.element, w.name);
                  return (
                    <tr
                      key={w.id}
                      onClick={() => toggle(w.element, w.name)}
                      style={{
                        background: done ? "#f8f8f8" : i % 2 === 0 ? "#fff" : "#fafafa",
                        cursor: "pointer",
                        opacity: done ? 0.45 : 1,
                        transition: "opacity 0.1s",
                      }}
                    >
                      <td style={tdStyle("center")}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", justifyContent: "center",
                          width: "18px", height: "18px", borderRadius: "4px",
                          border: done ? "none" : "1.5px solid #ccc",
                          background: done ? "#1a1a1a" : "transparent",
                          color: "#fff", fontSize: "11px", fontWeight: 700,
                        }}>
                          {done ? "✓" : ""}
                        </span>
                      </td>
                      <td style={{ ...tdStyle(), fontWeight: 500, textDecoration: done ? "line-through" : "none", color: done ? "#999" : "#1a1a1a" }}>
                        {w.name}
                      </td>
                      <td style={tdStyle("center")}>
                        <span style={elementStyle(w.element)}>{w.element}</span>
                      </td>
                      <td style={tdStyle("center")}>{w.rank || "—"}</td>
                      <td style={tdStyle()}>{w.copies || "—"}</td>
                      <td style={tdStyle("center")} onClick={e => e.stopPropagation()}>
                        <button
                          style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "13px", padding: "2px 5px", color: "#888" }}
                          onClick={() => { setEditing(w); setShowAdd(false); }}
                        >✎</button>
                        <button
                          style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "13px", padding: "2px 5px", color: "#c0392b" }}
                          onClick={() => { if (confirm(`Remove "${w.name}"?`)) remove(w.id); }}
                        >✕</button>
                      </td>
                    </tr>
                  );
                })}
                {weapons.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: "center", padding: "48px", color: "#aaa", fontSize: "13px" }}>No weapons</td></tr>
                )}
              </tbody>
            </table>
            <div style={{ marginTop: "12px", fontSize: "12px", color: "#aaa" }}>
              {viewDone}/{weapons.length} checked{elementFilter !== "All" ? ` (${elementFilter})` : ""}
              {saving && <span style={{ marginLeft: "12px", color: "#2253c7" }}>Saving…</span>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function thStyle(width?: string): React.CSSProperties {
  return {
    padding: "10px 16px", textAlign: "left", fontSize: "12px",
    fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase",
    width, whiteSpace: "nowrap",
  };
}

function tdStyle(align?: "center" | "left"): React.CSSProperties {
  return {
    padding: "10px 16px", fontSize: "13px", borderBottom: "1px solid #f0f0f0",
    textAlign: align ?? "left",
  };
}
