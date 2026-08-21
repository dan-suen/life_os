import { useState } from "react";
import { ELEMENTS, CATEGORIES, ELEMENT_META, type Element, type Category, type Weapon } from "./data";
import { useGbfGrid } from "./hooks/useGbfGrid";
import { useWeapons } from "./hooks/useWeapons";
import { AddPanel } from "./components/AddPanel";
import { EditPanel } from "./components/EditPanel";

const SOURCE_COLORS: Record<string, { bg: string; color: string }> = {
  "Omega Rebirth": { bg: "#fff0e0", color: "#b85c00" },
  "Regalia":       { bg: "#f0e8ff", color: "#6b21a8" },
  "Odious":        { bg: "#ffe8e8", color: "#b91c1c" },
  "Ennead":        { bg: "#e8f5e9", color: "#166534" },
  "Ancestral":     { bg: "#e8f0ff", color: "#1e40af" },
  "Malice":        { bg: "#fdf2ff", color: "#86198f" },
};

export default function GbfGridModule() {
  const [activeElement, setActiveElement] = useState<Element>("Fire");
  const [activeCategory, setActiveCategory] = useState<Category>("Core");
  const { isChecked, loading: checkedLoading, error: checkedError, setError: setCheckedError, toggle } = useGbfGrid();
  const { weapons: WEAPONS, loading: weaponsLoading, saving, error: weaponsError, setError: setWeaponsError, add, update, remove } = useWeapons();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Weapon | null>(null);

  const loading = checkedLoading || weaponsLoading;
  const error = weaponsError ?? checkedError;
  function dismissError() { setWeaponsError(null); setCheckedError(null); }

  const meta = ELEMENT_META[activeElement];
  const weapons = WEAPONS.filter(w => w.element === activeElement && w.category === activeCategory);
  const doneInView = weapons.filter(w => isChecked(activeElement, w.name)).length;
  const totalDone = WEAPONS.filter(w => w.element === activeElement && isChecked(activeElement, w.name)).length;
  const totalAll = WEAPONS.filter(w => w.element === activeElement).length;

  // Sources that still have unchecked weapons across all categories for this element
  const incompleteSources = Array.from(
    new Set(
      WEAPONS
        .filter(w => w.element === activeElement && w.source && !isChecked(activeElement, w.name))
        .map(w => w.source)
    )
  ).sort();

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
      {/* Element tabs */}
      <div style={{ background: "#1a1a1a", padding: "0 32px", display: "flex", gap: "2px" }}>
        {ELEMENTS.map(el => {
          const m = ELEMENT_META[el];
          const isActive = el === activeElement;
          return (
            <button key={el} onClick={() => setActiveElement(el)} style={{
              padding: "10px 18px", border: "none", cursor: "pointer", fontSize: "13px",
              background: isActive ? m.bg : "transparent",
              color: isActive ? m.color : "#888",
              fontWeight: isActive ? 700 : 400,
              borderRadius: "6px 6px 0 0",
              transition: "all 0.1s",
            }}>
              {el}
            </button>
          );
        })}
      </div>

      {/* Category tabs + title */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e5e5", padding: "16px 32px 0" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "12px", marginBottom: "10px" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
            <span style={{ fontSize: "17px", fontWeight: 700, letterSpacing: "-0.02em", color: meta.color }}>
              {activeElement} · {meta.boss}
            </span>
            <span style={{ fontSize: "13px", color: "#888" }}>{totalDone}/{totalAll} obtained</span>
          </div>
          <button
            style={{ background: "#1a1a1a", color: "#fff", border: "none", padding: "6px 14px", borderRadius: "6px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}
            onClick={() => { setShowAdd(!showAdd); setEditing(null); }}
          >
            + Add
          </button>
        </div>
        {!loading && incompleteSources.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "12px" }}>
            {incompleteSources.map(src => {
              const s = SOURCE_COLORS[src];
              const remaining = WEAPONS.filter(w => w.element === activeElement && w.source === src && !isChecked(activeElement, w.name)).length;
              return (
                <span key={src} style={{
                  display: "inline-flex", alignItems: "center", gap: "5px",
                  padding: "3px 10px", borderRadius: "99px", fontSize: "12px", fontWeight: 600,
                  background: s?.bg ?? "#f0f0f0", color: s?.color ?? "#555",
                  border: `1px solid ${s?.color ?? "#ccc"}40`,
                }}>
                  {src}
                  <span style={{ fontWeight: 400, opacity: 0.7 }}>{remaining}</span>
                </span>
              );
            })}
          </div>
        )}
        <div style={{ display: "flex", gap: "4px" }}>
          {CATEGORIES.map(cat => {
            const total = WEAPONS.filter(w => w.element === activeElement && w.category === cat).length;
            const done = WEAPONS.filter(w => w.element === activeElement && w.category === cat && isChecked(activeElement, w.name)).length;
            const isActive = cat === activeCategory;
            return (
              <button key={cat} onClick={() => setActiveCategory(cat)} style={{
                padding: "8px 16px", border: "1px solid #e5e5e5",
                borderBottom: isActive ? `2px solid ${meta.color}` : "1px solid #e5e5e5",
                borderRadius: "6px 6px 0 0", background: isActive ? "#fff" : "#f5f5f5",
                color: isActive ? meta.color : "#666", fontWeight: isActive ? 700 : 400,
                fontSize: "13px", cursor: "pointer", transition: "all 0.1s",
              }}>
                {cat} <span style={{ fontSize: "11px", color: isActive ? meta.color : "#aaa", opacity: 0.8 }}>({done}/{total})</span>
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div style={{ background: "#fff0f0", color: "#c0392b", padding: "10px 32px", fontSize: "12px", borderBottom: "1px solid #f5c6c6" }}>
          ⚠ {error}{" "}
          <span style={{ cursor: "pointer", textDecoration: "underline", marginLeft: "8px" }} onClick={dismissError}>dismiss</span>
        </div>
      )}

      <div style={{ flex: 1, padding: "24px 32px" }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "40vh", color: "#aaa" }}>Loading…</div>
        ) : (
          <>
            {showAdd && (
              <AddPanel element={activeElement} category={activeCategory} saving={saving} onAdd={handleAdd} onCancel={() => setShowAdd(false)} />
            )}
            {editing && (
              <EditPanel form={editing} saving={saving} onChange={setEditing} onSave={handleSaveEdit} onCancel={() => setEditing(null)} />
            )}
            <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: "8px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
              <thead>
                <tr style={{ background: "#1a1a1a", color: "#fff" }}>
                  <th style={thStyle("40px")}>✓</th>
                  <th style={thStyle()}>Weapon</th>
                  <th style={thStyle("80px")}>Rank</th>
                  <th style={thStyle("100px")}>Copies</th>
                  <th style={thStyle("140px")}>Source</th>
                  <th style={thStyle("70px")}></th>
                </tr>
              </thead>
              <tbody>
                {weapons.map((w, i) => {
                  const done = isChecked(activeElement, w.name);
                  const srcStyle = SOURCE_COLORS[w.source];
                  return (
                    <tr
                      key={w.id}
                      onClick={() => toggle(activeElement, w.name)}
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
                          background: done ? meta.color : "transparent",
                          color: "#fff", fontSize: "11px", fontWeight: 700,
                        }}>
                          {done ? "✓" : ""}
                        </span>
                      </td>
                      <td style={{ ...tdStyle(), fontWeight: 500, textDecoration: done ? "line-through" : "none", color: done ? "#999" : "#1a1a1a" }}>
                        {w.name}
                      </td>
                      <td style={tdStyle("center")}>{w.rank || "—"}</td>
                      <td style={tdStyle("center")}>{w.copies || "—"}</td>
                      <td style={tdStyle("center")}>
                        {w.source ? (
                          <span style={{
                            display: "inline-block", padding: "2px 8px", borderRadius: "4px",
                            fontSize: "12px", fontWeight: 600,
                            background: srcStyle?.bg ?? "#f0f0f0",
                            color: srcStyle?.color ?? "#555",
                          }}>
                            {w.source}
                          </span>
                        ) : (
                          <span style={{ color: "#ccc" }}>—</span>
                        )}
                      </td>
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
                  <tr><td colSpan={6} style={{ textAlign: "center", padding: "48px", color: "#aaa", fontSize: "13px" }}>No weapons listed</td></tr>
                )}
              </tbody>
            </table>
          </>
        )}
        <div style={{ marginTop: "12px", fontSize: "12px", color: "#aaa" }}>
          {doneInView}/{weapons.length} checked in this category
          {saving && <span style={{ marginLeft: "12px", color: "#2253c7" }}>Saving…</span>}
        </div>
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
