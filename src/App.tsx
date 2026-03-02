import { useState, useEffect } from "react";
import type { CSSProperties } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── Supabase config ───────────────────────────────────────────────────────────
// Replace these with your actual values from supabase.com → Project Settings → API
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── Types ─────────────────────────────────────────────────────────────────────
const AREAS = ["Work / Career", "Health & Fitness", "Personal Projects & Hobbies", "Finances"] as const;
type Area = typeof AREAS[number];

const STATUSES = [
  { label: "Keep",     color: "#4ade80" },
  { label: "Pause",    color: "#facc15" },
  { label: "Delegate", color: "#60a5fa" },
  { label: "Drop",     color: "#f87171" },
] as const;
type StatusLabel = typeof STATUSES[number]["label"];

const EFFORTS = ["Low", "Medium", "High"] as const;
type Effort = typeof EFFORTS[number];

const IMPACTS = ["Low", "Medium", "High"] as const;
type Impact = typeof IMPACTS[number];

interface Commitment {
  id: number;
  name: string;
  area: Area;
  status: StatusLabel;
  effort: Effort;
  impact: Impact;
  note: string;
}

// ─── Scoring ───────────────────────────────────────────────────────────────────
const impactScore: Record<Impact, number> = { Low: 1, Medium: 2, High: 3 };
const effortScore: Record<Effort, number> = { Low: 3, Medium: 2, High: 1 };
const priorityScore = (c: Commitment) => impactScore[c.impact] * 2 + effortScore[c.effort];
const getStatus = (label: StatusLabel) => STATUSES.find((s) => s.label === label) ?? STATUSES[0];

const defaultCommitment = (): Omit<Commitment, "id"> => ({
  name: "", area: AREAS[0], status: "Keep", effort: "Medium", impact: "Medium", note: "",
});

// ─── Column widths — fixed so layout never shifts ──────────────────────────────
const COL_WIDTHS = ["28%", "16%", "10%", "8%", "8%", "8%", "16%", "6%"];

export default function App() {
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [filter, setFilter] = useState<StatusLabel | "All">("All");
  const [areaFilter, setAreaFilter] = useState<Area | "All">("All");
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState<Commitment | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newForm, setNewForm] = useState(defaultCommitment());
  const [sort, setSort] = useState<"priority" | "area" | "name">("priority");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── Load from Supabase on mount ─────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from("commitments")
        .select("*")
        .order("id", { ascending: true });
      if (error) setError(error.message);
      else setCommitments((data ?? []) as Commitment[]);
      setLoading(false);
    }
    load();
  }, []);

  // ─── CRUD ─────────────────────────────────────────────────────────────────────
  async function addCommitment() {
    if (!newForm.name.trim()) return;
    setSaving(true);
    const { data, error } = await supabase
      .from("commitments")
      .insert([newForm])
      .select()
      .single();
    if (error) setError(error.message);
    else { setCommitments((prev) => [...prev, data as Commitment]); setShowAdd(false); setNewForm(defaultCommitment()); }
    setSaving(false);
  }

  async function saveEdit() {
    if (!form) return;
    setSaving(true);
    const { error } = await supabase
      .from("commitments")
      .update({ name: form.name, area: form.area, status: form.status, effort: form.effort, impact: form.impact, note: form.note })
      .eq("id", form.id);
    if (error) setError(error.message);
    else { setCommitments((prev) => prev.map((c) => (c.id === form.id ? form : c))); setEditing(null); setForm(null); }
    setSaving(false);
  }

  async function deleteCommitment(id: number) {
    setSaving(true);
    const { error } = await supabase.from("commitments").delete().eq("id", id);
    if (error) setError(error.message);
    else { setCommitments((prev) => prev.filter((c) => c.id !== id)); if (editing === id) setEditing(null); }
    setSaving(false);
  }

  async function cycleStatus(id: number) {
    const c = commitments.find((x) => x.id === id);
    if (!c) return;
    const idx = STATUSES.findIndex((s) => s.label === c.status);
    const next = STATUSES[(idx + 1) % STATUSES.length].label;
    const { error } = await supabase.from("commitments").update({ status: next }).eq("id", id);
    if (error) setError(error.message);
    else setCommitments((prev) => prev.map((x) => (x.id === id ? { ...x, status: next } : x)));
  }

  // ─── Filtered + sorted view ───────────────────────────────────────────────────
  const sorted = [...commitments]
    .filter((c) => filter === "All" || c.status === filter)
    .filter((c) => areaFilter === "All" || c.area === areaFilter)
    .sort((a, b) => {
      if (sort === "priority") return priorityScore(b) - priorityScore(a);
      if (sort === "area") return a.area.localeCompare(b.area);
      return a.name.localeCompare(b.name);
    });

  const counts = STATUSES.reduce<Record<string, number>>((acc, s) => {
    acc[s.label] = commitments.filter((c) => c.status === s.label).length;
    return acc;
  }, {});

  // ─── Styles ───────────────────────────────────────────────────────────────────
  const st: Record<string, CSSProperties> = {
    app:       { minHeight: "100vh", background: "#0a0a0a", color: "#e8e0d5", fontFamily: "'Georgia', serif" },
    header:    { borderBottom: "1px solid #1f1f1f", padding: "32px 40px 24px" },
    eyebrow:   { fontSize: "13px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#6b6b6b", marginBottom: "6px" },
    h1:        { fontSize: "clamp(24px, 3vw, 38px)", fontWeight: 400, color: "#e8e0d5", margin: "0 0 24px", letterSpacing: "-0.02em", lineHeight: 1.1 },
    pills:     { display: "flex", gap: "8px", flexWrap: "wrap" },
    main:      { padding: "24px 40px" },
    toolbar:   { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "12px" },
    addBtn:    { background: "#e8e0d5", color: "#0a0a0a", border: "none", padding: "9px 20px", borderRadius: "6px", fontSize: "13px", cursor: "pointer", fontFamily: "'Georgia', serif", fontWeight: 600 },
    sel:       { background: "#111", border: "1px solid #2a2a2a", color: "#e8e0d5", padding: "7px 12px", borderRadius: "6px", fontSize: "12px", cursor: "pointer" },
    tableWrap: { width: "100%", overflowX: "auto" },
    table:     { width: "100%", borderCollapse: "collapse", tableLayout: "fixed" },
    th:        { textAlign: "left", padding: "10px 14px", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#4a4a4a", borderBottom: "1px solid #1a1a1a", overflow: "hidden" },
    td:        { padding: "12px 14px", fontSize: "14px", verticalAlign: "middle", overflow: "hidden" },
    input:     { background: "#161616", border: "1px solid #2a2a2a", color: "#e8e0d5", padding: "6px 10px", borderRadius: "5px", fontSize: "13px", width: "100%", boxSizing: "border-box", fontFamily: "'Georgia', serif" },
    smallSel:  { background: "#161616", border: "1px solid #2a2a2a", color: "#e8e0d5", padding: "5px 6px", borderRadius: "5px", fontSize: "11px", cursor: "pointer", width: "100%" },
    saveBtn:   { background: "#4ade80", color: "#000", border: "none", padding: "5px 12px", borderRadius: "5px", fontSize: "12px", cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap" },
    cancelBtn: { background: "transparent", color: "#6b6b6b", border: "1px solid #2a2a2a", padding: "5px 10px", borderRadius: "5px", fontSize: "12px", cursor: "pointer" },
    delBtn:    { background: "transparent", color: "#4a4a4a", border: "none", cursor: "pointer", fontSize: "15px", padding: "2px 4px" },
    addRow:    { background: "#0e0e0e", borderTop: "1px solid #2a2a2a", borderBottom: "1px solid #2a2a2a" },
    statsRow:  { display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap" },
    statLabel: { fontSize: "10px", letterSpacing: "0.12em", color: "#4a4a4a", textTransform: "uppercase", marginTop: "4px" },
    empty:     { textAlign: "center", padding: "60px 20px", color: "#3a3a3a", fontSize: "14px" },
    footer:    { padding: "16px 40px", borderTop: "1px solid #141414", fontSize: "11px", color: "#2a2a2a", letterSpacing: "0.05em" },
    errorBar:  { background: "#2d0a0a", color: "#f87171", padding: "10px 40px", fontSize: "12px", borderBottom: "1px solid #f8717133" },
    loadWrap:  { display: "flex", alignItems: "center", justifyContent: "center", height: "40vh", color: "#3a3a3a", fontSize: "14px", letterSpacing: "0.1em" },
  };

  const pill = (active: boolean, color: string): CSSProperties => ({
    padding: "5px 14px", borderRadius: "100px", fontSize: "12px", letterSpacing: "0.05em",
    border: `1px solid ${active ? color : "#2a2a2a"}`, background: active ? color + "22" : "transparent",
    color: active ? color : "#6b6b6b", cursor: "pointer", transition: "all 0.15s",
  });

  const trStyle = (i: number): CSSProperties => ({
    borderBottom: "1px solid #141414", background: i % 2 === 0 ? "#0a0a0a" : "#0d0d0d",
  });

  const badge = (label: StatusLabel): CSSProperties => {
    const s = getStatus(label);
    return { display: "inline-block", padding: "3px 10px", borderRadius: "100px", fontSize: "11px", letterSpacing: "0.06em", border: `1px solid ${s.color}44`, color: s.color, background: s.color + "18", cursor: "pointer", userSelect: "none", whiteSpace: "nowrap" };
  };

  const dot = (score: number): CSSProperties => ({
    width: "8px", height: "8px", borderRadius: "50%",
    background: score >= 8 ? "#f87171" : score >= 6 ? "#facc15" : "#4ade80",
    display: "inline-block", marginRight: "6px", verticalAlign: "middle",
  });

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div style={st.app}>
      <div style={st.header}>
        <div style={st.eyebrow}>Life OS</div>
        <h1 style={st.h1}>Commitment Triage</h1>
        <div style={st.pills}>
          {(["All", ...STATUSES.map((x) => x.label)] as const).map((f) => {
            const s = STATUSES.find((x) => x.label === f);
            const color = s ? s.color : "#e8e0d5";
            return (
              <button key={f} style={pill(filter === f, color)} onClick={() => setFilter(f as StatusLabel | "All")}>
                {f} ({f === "All" ? commitments.length : (counts[f] ?? 0)})
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div style={st.errorBar}>
          ⚠ {error} — <span style={{ cursor: "pointer", textDecoration: "underline" }} onClick={() => setError(null)}>dismiss</span>
        </div>
      )}

      {loading ? (
        <div style={st.loadWrap}>Loading commitments…</div>
      ) : (
        <div style={st.main}>
          {commitments.length > 0 && (
            <div style={st.statsRow}>
              {STATUSES.map((s) => (
                <div key={s.label} style={{ flex: "1", minWidth: "90px", padding: "16px", borderRadius: "8px", border: `1px solid ${s.color}33`, background: s.color + "0a" }}>
                  <div style={{ fontSize: "26px", fontWeight: 300, color: s.color, lineHeight: 1 }}>{counts[s.label] || 0}</div>
                  <div style={st.statLabel}>{s.label}</div>
                </div>
              ))}
            </div>
          )}

          <div style={st.toolbar}>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <select style={st.sel} value={areaFilter} onChange={(e) => setAreaFilter(e.target.value as Area | "All")}>
                <option value="All">All areas</option>
                {AREAS.map((a) => <option key={a}>{a}</option>)}
              </select>
              <select style={st.sel} value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
                <option value="priority">Sort: Priority</option>
                <option value="area">Sort: Area</option>
                <option value="name">Sort: Name</option>
              </select>
            </div>
            <button style={st.addBtn} disabled={saving} onClick={() => { setShowAdd(true); setEditing(null); }}>
              + Add Commitment
            </button>
          </div>

          <div style={st.tableWrap}>
            <table style={st.table}>
              <colgroup>
                {COL_WIDTHS.map((w, i) => <col key={i} style={{ width: w }} />)}
              </colgroup>
              <thead>
                <tr>
                  {["Commitment", "Area", "Status", "Effort", "Impact", "Priority", "Note", ""].map((h) => (
                    <th key={h} style={st.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {showAdd && (
                  <tr style={st.addRow}>
                    <td style={st.td}><input autoFocus style={st.input} placeholder="Name…" value={newForm.name} onChange={(e) => setNewForm({ ...newForm, name: e.target.value })} onKeyDown={(e) => { if (e.key === "Enter") addCommitment(); if (e.key === "Escape") setShowAdd(false); }} /></td>
                    <td style={st.td}><select style={st.smallSel} value={newForm.area} onChange={(e) => setNewForm({ ...newForm, area: e.target.value as Area })}>{AREAS.map((a) => <option key={a}>{a}</option>)}</select></td>
                    <td style={st.td}><select style={st.smallSel} value={newForm.status} onChange={(e) => setNewForm({ ...newForm, status: e.target.value as StatusLabel })}>{STATUSES.map((x) => <option key={x.label}>{x.label}</option>)}</select></td>
                    <td style={st.td}><select style={st.smallSel} value={newForm.effort} onChange={(e) => setNewForm({ ...newForm, effort: e.target.value as Effort })}>{EFFORTS.map((e) => <option key={e}>{e}</option>)}</select></td>
                    <td style={st.td}><select style={st.smallSel} value={newForm.impact} onChange={(e) => setNewForm({ ...newForm, impact: e.target.value as Impact })}>{IMPACTS.map((i) => <option key={i}>{i}</option>)}</select></td>
                    <td style={st.td}>—</td>
                    <td style={st.td}><input style={st.input} placeholder="Note…" value={newForm.note} onChange={(e) => setNewForm({ ...newForm, note: e.target.value })} /></td>
                    <td style={st.td}><div style={{ display: "flex", gap: "4px" }}><button style={st.saveBtn} disabled={saving} onClick={addCommitment}>Add</button><button style={st.cancelBtn} onClick={() => setShowAdd(false)}>✕</button></div></td>
                  </tr>
                )}

                {sorted.length === 0 && !showAdd && (
                  <tr><td colSpan={8} style={st.empty}>{commitments.length === 0 ? "No commitments yet — add one to get started." : "No commitments match this filter."}</td></tr>
                )}

                {sorted.map((c, i) =>
                  editing === c.id && form ? (
                    <tr key={c.id} style={{ ...trStyle(i), background: "#121212" }}>
                      <td style={st.td}><input autoFocus style={st.input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} onKeyDown={(e) => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setEditing(null); }} /></td>
                      <td style={st.td}><select style={st.smallSel} value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value as Area })}>{AREAS.map((a) => <option key={a}>{a}</option>)}</select></td>
                      <td style={st.td}><select style={st.smallSel} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as StatusLabel })}>{STATUSES.map((x) => <option key={x.label}>{x.label}</option>)}</select></td>
                      <td style={st.td}><select style={st.smallSel} value={form.effort} onChange={(e) => setForm({ ...form, effort: e.target.value as Effort })}>{EFFORTS.map((e) => <option key={e}>{e}</option>)}</select></td>
                      <td style={st.td}><select style={st.smallSel} value={form.impact} onChange={(e) => setForm({ ...form, impact: e.target.value as Impact })}>{IMPACTS.map((imp) => <option key={imp}>{imp}</option>)}</select></td>
                      <td style={st.td}>—</td>
                      <td style={st.td}><input style={st.input} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></td>
                      <td style={st.td}><div style={{ display: "flex", gap: "4px" }}><button style={st.saveBtn} disabled={saving} onClick={saveEdit}>Save</button><button style={st.cancelBtn} onClick={() => setEditing(null)}>✕</button></div></td>
                    </tr>
                  ) : (
                    <tr key={c.id} style={trStyle(i)} onDoubleClick={() => { setEditing(c.id); setForm({ ...c }); }}>
                      <td style={{ ...st.td, fontWeight: 500, color: "#d4ccc4", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name || <span style={{ color: "#3a3a3a" }}>Unnamed</span>}</td>
                      <td style={{ ...st.td, fontSize: "12px", color: "#6b6b6b", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.area}</td>
                      <td style={st.td}><span style={badge(c.status)} onClick={() => cycleStatus(c.id)}>{c.status}</span></td>
                      <td style={{ ...st.td, fontSize: "12px", color: "#6b6b6b" }}>{c.effort}</td>
                      <td style={{ ...st.td, fontSize: "12px", color: "#6b6b6b" }}>{c.impact}</td>
                      <td style={st.td}><span style={dot(priorityScore(c))} /><span style={{ fontSize: "12px", color: "#6b6b6b" }}>{priorityScore(c)}</span></td>
                      <td style={{ ...st.td, fontSize: "12px", color: "#5a5a5a", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.note || "—"}</td>
                      <td style={st.td}><div style={{ display: "flex", gap: "4px" }}><button style={{ ...st.delBtn, color: "#6b6b6b" }} onClick={() => { setEditing(c.id); setForm({ ...c }); }}>✎</button><button style={st.delBtn} onClick={() => deleteCommitment(c.id)}>✕</button></div></td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div style={st.footer}>
        Double-click any row to edit · Click a status badge to cycle it · Sort by priority to see what to cut first
        {saving && <span style={{ marginLeft: "16px", color: "#4a4a4a" }}>Saving…</span>}
      </div>
    </div>
  );
}
