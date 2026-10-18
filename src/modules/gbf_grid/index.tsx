import { useState } from "react";
import { BF_CAP, ELEMENT_META, GROUPS, type BefoulmentType, type CopyProgress, type Element, type Mats, type Weapon } from "./data";
import { useGbfGrid } from "./hooks/useGbfGrid";
import { useWeapons } from "./hooks/useWeapons";
import { AddPanel } from "./components/AddPanel";
import { EditPanel } from "./components/EditPanel";
import { AwakenSelect, BfEditor, BfRange, StageChips } from "./components/ProgressCell";
import { MatList } from "./components/MatList";
import { MaterialsView } from "./components/MaterialsView";
import { addMats, bfUsage, copiesNote, copiesOf, copyRemaining, copyRemainingExtra, remainingExtra, remainingMats } from "./materials";

type ElementFilter = Element | "All";
const MATERIALS_TAB = "Σ Materials";
const FILTERS: ElementFilter[] = ["All", "Fire", "Wind", "Water", "Earth", "Light", "Dark", "Any"];

function elementStyle(el: Element): React.CSSProperties {
  const m = ELEMENT_META[el];
  return { display: "inline-block", padding: "2px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: 600, background: m.bg, color: m.color };
}

export default function GbfGridModule() {
  const [activeGroup, setActiveGroup] = useState<string>(GROUPS[0]);
  const [elementFilter, setElementFilter] = useState<ElementFilter>("All");
  const { isChecked, loading: checkedLoading, error: checkedError, setError: setCheckedError, toggle } = useGbfGrid();
  const { weapons: WEAPONS, loading: weaponsLoading, saving, error: weaponsError, setError: setWeaponsError, add, update, setProgress, remove } = useWeapons();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Weapon | null>(null);
  const [remainingOpen, setRemainingOpen] = useState(false);

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
  const isMaterials = activeGroup === MATERIALS_TAB;
  const viewRemaining: Mats = {};
  const viewExtra: Mats = {};
  for (const w of weapons) { addMats(viewRemaining, remainingMats(w)); addMats(viewExtra, remainingExtra(w)); }
  // Befoulment budget is per element, counted over all of that element's weapons in the group.
  const bfElements = Array.from(new Set(groupWeapons.map(w => w.element))).filter(el => weapons.some(w => w.element === el));
  const bfUsed = Object.fromEntries(bfElements.map(el => [el, bfUsage(groupWeapons, el)]));


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
        <button onClick={() => { setActiveGroup(MATERIALS_TAB); setShowAdd(false); setEditing(null); }} style={{
          padding: "8px 14px", border: "none", cursor: "pointer", fontSize: "12px", marginLeft: "auto",
          background: isMaterials ? "#f9f9f9" : "transparent", color: isMaterials ? "#1a1a1a" : "#c9a227",
          fontWeight: 700, borderRadius: "6px 6px 0 0", whiteSpace: "nowrap",
        }}>{MATERIALS_TAB}</button>
      </div>

      {/* Header + element filter */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e5e5", padding: "16px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
            <span style={{ fontSize: "17px", fontWeight: 700, letterSpacing: "-0.02em" }}>{activeGroup}</span>
            {!isMaterials && <span style={{ fontSize: "13px", color: "#888" }}>{groupDone}/{groupWeapons.length} obtained</span>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <select
              value={elementFilter}
              onChange={e => setElementFilter(e.target.value as ElementFilter)}
              style={{ border: "1px solid #d5d5d5", borderRadius: "6px", padding: "5px 8px", fontSize: "12px", background: "#fff", cursor: "pointer" }}
            >
              {FILTERS.map(f => <option key={f} value={f}>{f === "All" ? "All elements" : f}</option>)}
            </select>
            {!isMaterials && <button
              style={{ background: "#1a1a1a", color: "#fff", border: "none", padding: "6px 14px", borderRadius: "6px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}
              onClick={() => { setShowAdd(!showAdd); setEditing(null); }}
            >
              + Add
            </button>}
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
        ) : isMaterials ? (
          <MaterialsView weapons={WEAPONS} groups={groupTabs} elementFilter={elementFilter} />
        ) : (
          <>
            {showAdd && (
              <AddPanel source={activeGroup} saving={saving} onAdd={handleAdd} onCancel={() => setShowAdd(false)} />
            )}
            {editing && (
              <EditPanel form={editing} saving={saving} onChange={setEditing} onSave={handleSaveEdit} onCancel={() => setEditing(null)} />
            )}
            <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", background: "#fff", border: "1px solid #eee", borderRadius: "8px", padding: "12px 16px", marginBottom: "12px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: 0 }}>
                <span onClick={() => setRemainingOpen(o => !o)} style={{ fontSize: "11px", fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap", cursor: "pointer", userSelect: "none" }}>
                  {remainingOpen ? "▾" : "▸"} Remaining{elementFilter !== "All" ? ` (${elementFilter})` : ""}
                  <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0, marginLeft: "8px", color: "#aaa" }}>
                    {weapons.some(w => w.stages?.length)
                      ? `${Object.values(viewRemaining).filter(n => n > 0).length} materials${Object.values(viewExtra).some(n => n > 0) ? ` + ${Object.values(viewExtra).filter(n => n > 0).length} group-specific` : ""}`
                      : "no stage data yet"}
                  </span>
                </span>
                {remainingOpen && weapons.some(w => w.stages?.length) && <MatList mats={viewRemaining} extras={viewExtra} />}
              </div>
              {activeGroup === "Odious" && (
                <div style={{ marginLeft: "auto", fontSize: "12px", color: "#555", display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em" }}>Grid BF budget (in-grid copies)</span>
                  {bfElements.map(el => (
                    <span key={el}>
                      <span style={{ ...elementStyle(el), fontSize: "10px", padding: "0 5px", marginRight: "6px" }}>{el}</span>
                      {(Object.entries(BF_CAP) as [BefoulmentType, number][]).map(([t, cap]) => {
                        const u = bfUsed[el]?.[t] ?? 0;
                        return <span key={t} style={{ marginRight: "8px", color: u > cap + 1e-9 ? "#b03a2e" : u > 0 ? "#1a1a1a" : "#aaa" }}>{t} {Math.round(u)}/{cap}%</span>;
                      })}
                    </span>
                  ))}
                  <span style={{ fontSize: "11px", color: "#999" }}>No C.A., M.A. or Turn. Untaken pieces assume exorcision Lvl 5.</span>
                </div>
              )}
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: "8px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
              <thead>
                <tr style={{ background: "#1a1a1a", color: "#fff" }}>
                  <th style={thStyle("40px")}>✓</th>
                  <th style={thStyle()}>Weapon</th>
                  <th style={thStyle("90px")}>Element</th>
                  <th style={thStyle("70px")}>Rank</th>
                  <th style={thStyle("150px")}>Copy</th>
                  <th style={thStyle()}>Stages</th>
                  <th style={thStyle("200px")}>Remaining</th>
                  <th style={thStyle("70px")}></th>
                </tr>
              </thead>
              <tbody>
                {weapons.map((w, i) => {
                  const done = isChecked(w.element, w.name);
                  const copies = w.stages?.length ? copiesOf(w) : [];
                  const span = Math.max(copies.length, 1);
                  const note = copiesNote(w.copies);
                  const hasForge = w.stages?.some(st => st.key === "Forge");
                  const isOdious = w.source === "Odious";
                  const bg = done ? "#f8f8f8" : i % 2 === 0 ? "#fff" : "#fafafa";
                  const fade: React.CSSProperties = { opacity: done ? 0.45 : 1, transition: "opacity 0.1s" };
                  const last = (j: number) => j === span - 1 ? {} : { borderBottom: "1px dashed #eee" };
                  const setCopy = (j: number, c: CopyProgress) => setProgress(w.id, copies.map((x, k) => k === j ? c : x));
                  const copyCells = (j: number) => copies[j] ? (
                    <>
                      <td style={{ ...tdStyle(), ...last(j), whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: "11px", color: "#999", marginRight: "6px" }}>#{j + 1}</span>
                        {hasForge && (
                          <span style={forgeBadge(!copies[j].skip?.includes("Forge"))}>{copies[j].skip?.includes("Forge") ? "Unforged" : "Mk II"}</span>
                        )}
                        <AwakenSelect copy={copies[j]} onChange={c => setCopy(j, c)} />
                        {isOdious && <div style={{ marginTop: "3px" }}><BfEditor copy={copies[j]} avoid={w.befoulment?.avoid} used={bfUsed[w.element] ?? {}} onChange={c => setCopy(j, c)} /></div>}
                      </td>
                      <td style={{ ...tdStyle(), ...last(j) }}><StageChips stages={w.stages} copy={copies[j]} onChange={c => setCopy(j, c)} /></td>
                      <td style={{ ...tdStyle(), ...last(j) }}><MatList mats={copyRemaining(w, copies[j])} extras={copyRemainingExtra(w, copies[j])} limit={4} /></td>
                    </>
                  ) : (
                    <td colSpan={3} style={{ ...tdStyle(), color: "#bbb" }}>{w.copies && !note ? `${w.copies} · ` : ""}no stage data</td>
                  );
                  return Array.from({ length: span }, (_, j) => (
                    <tr key={`${w.id}:${j}`} style={{ background: bg }}>
                      {j === 0 && (
                        <>
                          <td rowSpan={span} style={{ ...tdStyle("center"), ...fade, cursor: "pointer" }} onClick={() => toggle(w.element, w.name)}>
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
                          <td rowSpan={span} style={{ ...tdStyle(), ...fade, fontWeight: 500, cursor: "pointer", textDecoration: done ? "line-through" : "none", color: done ? "#999" : "#1a1a1a" }}
                            onClick={() => toggle(w.element, w.name)}>
                            {w.name}
                            {note && <div style={{ fontSize: "11px", color: "#999", fontWeight: 400 }}>{note}</div>}
                            {!note && w.copies && copies.length > 0 && (
                              <div style={{ fontSize: "11px", color: "#888", fontWeight: 400, marginTop: "2px" }}>Goal: {w.copies}</div>
                            )}
                            {isOdious && <BfRange avoid={w.befoulment?.avoid} used={bfUsed[w.element] ?? {}} />}
                          </td>
                          <td rowSpan={span} style={{ ...tdStyle("center"), ...fade }}>
                            <span style={elementStyle(w.element)}>{w.element}</span>
                          </td>
                          <td rowSpan={span} style={{ ...tdStyle("center"), ...fade }}>{w.rank || "—"}</td>
                        </>
                      )}
                      {copyCells(j)}
                      {j === 0 && (
                        <td rowSpan={span} style={tdStyle("center")}>
                          <button
                            style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "13px", padding: "2px 5px", color: "#888" }}
                            onClick={() => { setEditing(w); setShowAdd(false); }}
                          >✎</button>
                          <button
                            style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "13px", padding: "2px 5px", color: "#c0392b" }}
                            onClick={() => { if (confirm(`Remove "${w.name}"?`)) remove(w.id); }}
                          >✕</button>
                        </td>
                      )}
                    </tr>
                  ));
                })}
                {weapons.length === 0 && (
                  <tr><td colSpan={8} style={{ textAlign: "center", padding: "48px", color: "#aaa", fontSize: "13px" }}>No weapons</td></tr>
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

function forgeBadge(forge: boolean): React.CSSProperties {
  return {
    display: "inline-block", padding: "1px 6px", borderRadius: "4px", fontSize: "10px", fontWeight: 700,
    marginRight: "6px", letterSpacing: "0.03em",
    background: forge ? "#fdecea" : "#f0f0f0", color: forge ? "#b03a2e" : "#888",
  };
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
