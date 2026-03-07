import { useState, useEffect } from "react";
import type { CSSProperties } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── Constants ────────────────────────────────────────────────────────────────
const AREAS = ["Work / Career", "Health & Fitness", "Personal Projects & Hobbies", "Finances"] as const;
type Area = typeof AREAS[number];

const TIERS = ["Urgent", "Weekly", "High Priority", "Normal", "Non-Priority"] as const;
type Tier = typeof TIERS[number];

const EFFORTS = ["Low", "Medium", "High"] as const;
type Effort = typeof EFFORTS[number];

const IMPACTS = ["Low", "Medium", "High"] as const;
type Impact = typeof IMPACTS[number];

const ENERGIES = ["Low", "Medium", "High"] as const;
type Energy = typeof ENERGIES[number];

const TIER_COLORS: Record<Tier, { bg: string; text: string; border: string }> = {
  "Urgent":           { bg: "#fff0f0", text: "#c0392b", border: "#f5c6c6" },
  "Weekly":           { bg: "#f0f4ff", text: "#2253c7", border: "#c6d3f5" },
  "High Priority":    { bg: "#fffbf0", text: "#b07d00", border: "#f5e6c6" },
  "Normal":           { bg: "#f5f5f5", text: "#444444", border: "#dddddd" },
  "Non-Priority":     { bg: "#f9f9f9", text: "#888888", border: "#e5e5e5" },
};

const AREA_COLORS: Record<Area, string> = {
  "Work / Career":                  "#2253c7",
  "Health & Fitness":               "#1a9e5c",
  "Personal Projects & Hobbies":    "#b07d00",
  "Finances":                       "#7c3aed",
};

interface Commitment {
  id: number;
  name: string;
  area: Area;
  tier: Tier;
  effort: Effort;
  impact: Impact;
  energy: Energy;
  deadline: string | null;
  completed: boolean;
  completed_at: string | null;
  original_deadline: string | null;
  note: string;
}

interface Settings {
  topN: Record<Area, number>;
  weights: { impact: number; effort: number; urgency: number };
  currentEnergy: Energy;
}

const DEFAULT_SETTINGS: Settings = {
  topN: {
    "Work / Career": 3,
    "Health & Fitness": 2,
    "Personal Projects & Hobbies": 2,
    "Finances": 2,
  },
  weights: { impact: 0.4, effort: 0.2, urgency: 0.4 },
  currentEnergy: "Medium",
};

// ─── Priority algorithm ───────────────────────────────────────────────────────
const IMPACT_SCORE: Record<Impact, number> = { Low: 2, Medium: 5, High: 10 };
const EFFORT_SCORE: Record<Effort, number> = { Low: 10, Medium: 5, High: 2 };
const ENERGY_MATCH: Record<Energy, Record<Energy, number>> = {
  Low:    { Low: 1.3, Medium: 1.0, High: 0.7 },
  Medium: { Low: 1.0, Medium: 1.3, High: 1.0 },
  High:   { Low: 0.7, Medium: 1.0, High: 1.3 },
};

function urgencyScore(deadline: string | null): number {
  if (!deadline) return 0;
  const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
  if (days <= 0) return 10;
  if (days <= 3) return 8;
  if (days <= 7) return 6;
  if (days <= 14) return 4;
  if (days <= 30) return 2;
  return 0;
}

function calcPriority(c: Commitment, settings: Settings): number {
  if (c.tier === "Urgent" || c.tier === "Weekly" || c.tier === "Non-Priority") return 0;
  const { impact, effort, urgency } = settings.weights;
  const energyMult = ENERGY_MATCH[settings.currentEnergy][c.energy];
  const base =
    IMPACT_SCORE[c.impact] * impact +
    EFFORT_SCORE[c.effort] * effort +
    urgencyScore(c.deadline) * urgency;
  return Math.round(base * energyMult * 10) / 10;
}

// ─── Weekly recurrence ────────────────────────────────────────────────────────
function shouldRecreateWeekly(c: Commitment): boolean {
  if (c.tier !== "Weekly" || !c.completed || !c.original_deadline) return false;
  const orig = new Date(c.original_deadline);
  const now = new Date();
  // Find next occurrence on same weekday
  const dayDiff = (orig.getDay() - now.getDay() + 7) % 7;
  const next = new Date(now);
  next.setDate(now.getDate() + (dayDiff === 0 ? 7 : dayDiff));
  return now >= next;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const defaultForm = (): Omit<Commitment, "id"> => ({
  name: "", area: AREAS[0], tier: "Normal", effort: "Medium",
  impact: "Medium", energy: "Medium", deadline: null,
  completed: false, completed_at: null, original_deadline: null, note: "",
});

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-CA", { month: "short", day: "numeric" });
}

function daysLabel(d: string | null): { text: string; color: string } {
  if (!d) return { text: "", color: "#888" };
  const days = Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
  if (days < 0) return { text: `${Math.abs(days)}d overdue`, color: "#c0392b" };
  if (days === 0) return { text: "Today", color: "#c0392b" };
  if (days <= 3) return { text: `${days}d`, color: "#e67e22" };
  if (days <= 7) return { text: `${days}d`, color: "#b07d00" };
  return { text: `${days}d`, color: "#888" };
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const BASE: CSSProperties = {
  fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  fontSize: "14px",
  color: "#1a1a1a",
  background: "#ffffff",
};

const s = {
  app: { ...BASE, minHeight: "100vh", background: "#f8f8f8" } as CSSProperties,
  header: { background: "#ffffff", borderBottom: "1px solid #e5e5e5", padding: "20px 32px 0" } as CSSProperties,
  headerTop: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" } as CSSProperties,
  title: { fontSize: "20px", fontWeight: 700, color: "#1a1a1a", letterSpacing: "-0.02em" } as CSSProperties,
  subtitle: { fontSize: "12px", color: "#888", marginTop: "2px" } as CSSProperties,
  navRow: { display: "flex", gap: "6px", flexWrap: "wrap" as const, marginBottom: "0" },
  tierRow: { display: "flex", gap: "6px", flexWrap: "wrap" as const, padding: "10px 0 0" },
  main: { padding: "24px 32px" } as CSSProperties,
  section: { background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "8px", marginBottom: "16px", overflow: "hidden" } as CSSProperties,
  sectionHeader: { padding: "12px 16px", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fafafa" } as CSSProperties,
  sectionTitle: { fontWeight: 600, fontSize: "13px", color: "#1a1a1a" } as CSSProperties,
  tableWrap: { overflowX: "auto" as const } as CSSProperties,
  table: { width: "100%", borderCollapse: "collapse" as const, tableLayout: "fixed" as const } as CSSProperties,
  th: { textAlign: "left" as const, padding: "9px 12px", fontSize: "11px", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" as const, color: "#666", borderBottom: "1px solid #e5e5e5", background: "#fafafa", whiteSpace: "nowrap" as const, overflow: "hidden" as const } as CSSProperties,
  td: { padding: "10px 12px", fontSize: "13px", verticalAlign: "middle" as const, borderBottom: "1px solid #f5f5f5", color: "#1a1a1a", overflow: "hidden" as const } as CSSProperties,
  input: { border: "1px solid #d0d0d0", background: "#fff", color: "#1a1a1a", padding: "6px 10px", borderRadius: "5px", fontSize: "13px", width: "100%", boxSizing: "border-box" as const, outline: "none" } as CSSProperties,
  smallSel: { border: "1px solid #d0d0d0", background: "#fff", color: "#1a1a1a", padding: "5px 6px", borderRadius: "5px", fontSize: "12px", cursor: "pointer", width: "100%" } as CSSProperties,
  btn: (color: string, bg: string, border: string): CSSProperties => ({ background: bg, color, border: `1px solid ${border}`, padding: "6px 14px", borderRadius: "6px", fontSize: "12px", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }),
  iconBtn: { background: "transparent", border: "none", cursor: "pointer", fontSize: "14px", padding: "2px 5px", color: "#888" } as CSSProperties,
  settingsOverlay: { position: "fixed" as const, inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 100, display: "flex", justifyContent: "flex-end" },
  settingsDrawer: { background: "#fff", width: "320px", height: "100vh", overflowY: "auto" as const, padding: "24px", boxShadow: "-4px 0 20px rgba(0,0,0,0.1)" },
  label: { fontSize: "11px", fontWeight: 600, color: "#666", textTransform: "uppercase" as const, letterSpacing: "0.05em", display: "block", marginBottom: "4px" } as CSSProperties,
  formGroup: { marginBottom: "16px" } as CSSProperties,
  addRowBg: { background: "#fffef5" } as CSSProperties,
  emptyRow: { textAlign: "center" as const, padding: "32px", color: "#aaa", fontSize: "13px" } as CSSProperties,
};

const COL_WIDTHS = ["3%", "26%", "10%", "9%", "8%", "8%", "8%", "9%", "7%", "8%", "4%"];
const COL_HEADERS = ["", "Commitment", "Tier", "Area", "Effort", "Impact", "Energy", "Deadline", "Priority", "Note", ""];
const COL_WIDTHS_NO_AREA = ["3%", "30%", "11%", "10%", "9%", "9%", "10%", "8%", "9%", "1%"];
const COL_HEADERS_NO_AREA = ["", "Commitment", "Tier", "Effort", "Impact", "Energy", "Deadline", "Priority", "Note", ""];

// ─── Main component ───────────────────────────────────────────────────────────
export default function App() {
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [areaFilter, setAreaFilter] = useState<Area | "All">("All");
  const [tierFilter, setTierFilter] = useState<Tier | "All">("All");
  const [editing, setEditing] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Commitment | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newForm, setNewForm] = useState(defaultForm());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);
  const [todoCollapsed, setTodoCollapsed] = useState(false);

  // ─── Load ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data, error } = await supabase.from("commitments").select("*").order("id");
      if (error) { setError(error.message); setLoading(false); return; }
      const items = (data ?? []) as Commitment[];
      // Check weekly recurrence
      for (const c of items) {
        if (shouldRecreateWeekly(c)) {
          const next = nextWeeklyDate(c.original_deadline!);
          const { data: exists } = await supabase
            .from("commitments")
            .select("id")
            .eq("name", c.name)
            .eq("area", c.area)
            .eq("tier", "Weekly")
            .eq("completed", false);
          if (!exists || exists.length === 0) {
            await supabase.from("commitments").insert([{
              name: c.name, area: c.area, tier: "Weekly",
              effort: c.effort, impact: c.impact, energy: c.energy,
              deadline: next, completed: false, completed_at: null,
              original_deadline: c.original_deadline, note: c.note,
            }]);
          }
        }
      }
      // Reload after potential inserts
      const { data: fresh } = await supabase.from("commitments").select("*").order("id");
      setCommitments((fresh ?? []) as Commitment[]);
      setLoading(false);
    }
    load();
  }, []);

  function nextWeeklyDate(original: string): string {
    const orig = new Date(original);
    const now = new Date();
    const dayDiff = (orig.getDay() - now.getDay() + 7) % 7;
    const next = new Date(now);
    next.setDate(now.getDate() + (dayDiff === 0 ? 7 : dayDiff));
    return next.toISOString().split("T")[0];
  }

  // ─── CRUD ─────────────────────────────────────────────────────────────────
  async function addCommitment() {
    if (!newForm.name.trim()) return;
    setSaving(true);
    const payload = {
      ...newForm,
      original_deadline: newForm.tier === "Weekly" ? newForm.deadline : null,
    };
    const { data, error } = await supabase.from("commitments").insert([payload]).select().single();
    if (error) setError(error.message);
    else { setCommitments((p) => [...p, data as Commitment]); setShowAdd(false); setNewForm(defaultForm()); }
    setSaving(false);
  }

  async function saveEdit() {
    if (!editForm) return;
    setSaving(true);
    const { error } = await supabase.from("commitments").update({
      name: editForm.name, area: editForm.area, tier: editForm.tier,
      effort: editForm.effort, impact: editForm.impact, energy: editForm.energy,
      deadline: editForm.deadline, note: editForm.note,
      original_deadline: editForm.tier === "Weekly" ? (editForm.original_deadline || editForm.deadline) : null,
    }).eq("id", editForm.id);
    if (error) setError(error.message);
    else { setCommitments((p) => p.map((c) => c.id === editForm.id ? editForm : c)); setEditing(null); setEditForm(null); }
    setSaving(false);
  }

  async function deleteCommitment(id: number) {
    setSaving(true);
    const { error } = await supabase.from("commitments").delete().eq("id", id);
    if (error) setError(error.message);
    else setCommitments((p) => p.filter((c) => c.id !== id));
    setSaving(false);
  }

  async function toggleComplete(c: Commitment) {
    const now = new Date().toISOString();
    const completed = !c.completed;
    const { error } = await supabase.from("commitments").update({
      completed, completed_at: completed ? now : null,
    }).eq("id", c.id);
    if (error) setError(error.message);
    else setCommitments((p) => p.map((x) => x.id === c.id ? { ...x, completed, completed_at: completed ? now : null } : x));
  }

  async function removeAllComplete() {
    const ids = commitments.filter((c) => c.completed && c.tier !== "Weekly").map((c) => c.id);
    if (ids.length === 0) return;
    setSaving(true);
    const { error } = await supabase.from("commitments").delete().in("id", ids);
    if (error) setError(error.message);
    else setCommitments((p) => p.filter((c) => !ids.includes(c.id)));
    setSaving(false);
  }

  // ─── Derived data ──────────────────────────────────────────────────────────
  const filtered = commitments
    .filter((c) => areaFilter === "All" || c.area === areaFilter)
    .filter((c) => tierFilter === "All" || c.tier === tierFilter);

  const urgentItems = filtered.filter((c) => c.tier === "Urgent");

  const todoItems = (areaFilter === "All" ? AREAS : [areaFilter]).flatMap((area) => {
    const n = settings.topN[area];
    return commitments
      .filter((c) => c.area === area && !c.completed && ["High Priority", "Normal"].includes(c.tier))
      .sort((a, b) => calcPriority(b, settings) - calcPriority(a, settings))
      .slice(0, n);
  });

  const areasToShow: Area[] = areaFilter === "All" ? [...AREAS] : [areaFilter];

  function getAreaItems(area: Area): Commitment[] {
    return filtered
      .filter((c) => c.area === area && c.tier !== "Urgent")
      .sort((a, b) => calcPriority(b, settings) - calcPriority(a, settings));
  }

  // ─── Row renderer ──────────────────────────────────────────────────────────
  const showArea = areaFilter === "All";
  const widths = showArea ? COL_WIDTHS : COL_WIDTHS_NO_AREA;
  const headers = showArea ? COL_HEADERS : COL_HEADERS_NO_AREA;

  function renderRow(c: Commitment, i: number) {
    const pri = calcPriority(c, settings);
    const dl = daysLabel(c.deadline);
    const tc = TIER_COLORS[c.tier];
    const rowBg = c.completed ? "#f9f9f9" : i % 2 === 0 ? "#ffffff" : "#fafafa";
    if (editing === c.id && editForm) {
      return (
        <tr key={c.id} style={{ background: "#fffef5" }}>
          <td style={s.td}><input type="checkbox" checked={editForm.completed} onChange={() => setEditForm({ ...editForm, completed: !editForm.completed })} /></td>
          <td style={s.td}><input style={s.input} value={editForm.name} autoFocus onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} onKeyDown={(e) => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") { setEditing(null); setEditForm(null); }}} /></td>
          <td style={s.td}><select style={s.smallSel} value={editForm.tier} onChange={(e) => setEditForm({ ...editForm, tier: e.target.value as Tier })}>{TIERS.map((t) => <option key={t}>{t}</option>)}</select></td>
          {showArea && <td style={s.td}><select style={s.smallSel} value={editForm.area} onChange={(e) => setEditForm({ ...editForm, area: e.target.value as Area })}>{AREAS.map((a) => <option key={a}>{a}</option>)}</select></td>}
          <td style={s.td}><select style={s.smallSel} value={editForm.effort} onChange={(e) => setEditForm({ ...editForm, effort: e.target.value as Effort })}>{EFFORTS.map((e) => <option key={e}>{e}</option>)}</select></td>
          <td style={s.td}><select style={s.smallSel} value={editForm.impact} onChange={(e) => setEditForm({ ...editForm, impact: e.target.value as Impact })}>{IMPACTS.map((imp) => <option key={imp}>{imp}</option>)}</select></td>
          <td style={s.td}><select style={s.smallSel} value={editForm.energy} onChange={(e) => setEditForm({ ...editForm, energy: e.target.value as Energy })}>{ENERGIES.map((en) => <option key={en}>{en}</option>)}</select></td>
          <td style={s.td}><input type="date" style={{ ...s.input, fontSize: "12px" }} value={editForm.deadline ?? ""} onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value || null })} /></td>
          <td style={s.td}><span style={{ fontSize: "12px", color: "#888" }}>—</span></td>
          <td style={s.td}><input style={s.input} value={editForm.note} placeholder="Note…" onChange={(e) => setEditForm({ ...editForm, note: e.target.value })} /></td>
          <td style={s.td}>
            <div style={{ display: "flex", gap: "4px" }}>
              <button style={s.btn("#fff", "#1a9e5c", "#1a9e5c")} disabled={saving} onClick={saveEdit}>Save</button>
              <button style={s.iconBtn} onClick={() => { setEditing(null); setEditForm(null); }}>✕</button>
            </div>
          </td>
        </tr>
      );
    }
    return (
      <tr key={c.id} style={{ background: rowBg }} onDoubleClick={() => { setEditing(c.id); setEditForm({ ...c }); }}>
        <td style={s.td}><input type="checkbox" checked={c.completed} onChange={() => toggleComplete(c)} /></td>
        <td style={{ ...s.td, fontWeight: 500, textOverflow: "ellipsis", whiteSpace: "nowrap", textDecoration: c.completed ? "line-through" : "none", color: c.completed ? "#aaa" : "#1a1a1a" }}>{c.name}</td>
        <td style={s.td}><span style={{ display: "inline-block", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 600, background: tc.bg, color: tc.text, border: `1px solid ${tc.border}` }}>{c.tier}</span></td>
        {showArea && <td style={{ ...s.td, fontSize: "12px", color: AREA_COLORS[c.area], fontWeight: 500, textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.area}</td>}
        <td style={{ ...s.td, fontSize: "12px", color: "#555" }}>{c.effort}</td>
        <td style={{ ...s.td, fontSize: "12px", color: "#555" }}>{c.impact}</td>
        <td style={{ ...s.td, fontSize: "12px", color: "#555" }}>{c.energy}</td>
        <td style={{ ...s.td, fontSize: "12px" }}>
          {c.deadline ? <span style={{ color: dl.color, fontWeight: dl.color === "#c0392b" ? 600 : 400 }}>{formatDate(c.deadline)}<br /><span style={{ fontSize: "10px" }}>{dl.text}</span></span> : <span style={{ color: "#ccc" }}>—</span>}
        </td>
        <td style={{ ...s.td, fontSize: "12px", fontWeight: 600, color: pri >= 7 ? "#c0392b" : pri >= 4 ? "#b07d00" : "#555" }}>
          {["Urgent", "Weekly", "Non-Priority"].includes(c.tier) ? <span style={{ color: "#ccc" }}>—</span> : pri}
        </td>
        <td style={{ ...s.td, fontSize: "12px", color: "#888", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.note || "—"}</td>
        <td style={s.td}>
          <div style={{ display: "flex", gap: "2px" }}>
            <button style={s.iconBtn} title="Edit" onClick={() => { setEditing(c.id); setEditForm({ ...c }); }}>✎</button>
            <button style={{ ...s.iconBtn, color: "#e74c3c" }} title="Delete" onClick={() => deleteCommitment(c.id)}>✕</button>
          </div>
        </td>
      </tr>
    );
  }

  function renderAddRow() {
    if (!showAdd) return null;
    return (
      <tr style={s.addRowBg}>
        <td style={s.td}></td>
        <td style={s.td}><input autoFocus style={s.input} placeholder="Name…" value={newForm.name} onChange={(e) => setNewForm({ ...newForm, name: e.target.value })} onKeyDown={(e) => { if (e.key === "Enter") addCommitment(); if (e.key === "Escape") setShowAdd(false); }} /></td>
        <td style={s.td}><select style={s.smallSel} value={newForm.tier} onChange={(e) => setNewForm({ ...newForm, tier: e.target.value as Tier })}>{TIERS.map((t) => <option key={t}>{t}</option>)}</select></td>
        {showArea && <td style={s.td}><select style={s.smallSel} value={newForm.area} onChange={(e) => setNewForm({ ...newForm, area: e.target.value as Area })}>{AREAS.map((a) => <option key={a}>{a}</option>)}</select></td>}
        <td style={s.td}><select style={s.smallSel} value={newForm.effort} onChange={(e) => setNewForm({ ...newForm, effort: e.target.value as Effort })}>{EFFORTS.map((e) => <option key={e}>{e}</option>)}</select></td>
        <td style={s.td}><select style={s.smallSel} value={newForm.impact} onChange={(e) => setNewForm({ ...newForm, impact: e.target.value as Impact })}>{IMPACTS.map((imp) => <option key={imp}>{imp}</option>)}</select></td>
        <td style={s.td}><select style={s.smallSel} value={newForm.energy} onChange={(e) => setNewForm({ ...newForm, energy: e.target.value as Energy })}>{ENERGIES.map((en) => <option key={en}>{en}</option>)}</select></td>
        <td style={s.td}><input type="date" style={{ ...s.input, fontSize: "12px" }} value={newForm.deadline ?? ""} onChange={(e) => setNewForm({ ...newForm, deadline: e.target.value || null })} /></td>
        <td style={s.td}>—</td>
        <td style={s.td}><input style={s.input} placeholder="Note…" value={newForm.note} onChange={(e) => setNewForm({ ...newForm, note: e.target.value })} /></td>
        <td style={s.td}><div style={{ display: "flex", gap: "4px" }}><button style={s.btn("#fff", "#1a9e5c", "#1a9e5c")} disabled={saving} onClick={addCommitment}>Add</button><button style={s.iconBtn} onClick={() => setShowAdd(false)}>✕</button></div></td>
      </tr>
    );
  }

  function TableHead() {
    return (
      <thead>
        <tr>
          {headers.map((h, i) => (
            <th key={i} style={{ ...s.th, width: widths[i] }}>{h}</th>
          ))}
        </tr>
      </thead>
    );
  }

  // ─── Area nav button ───────────────────────────────────────────────────────
  function AreaBtn({ area }: { area: Area | "All" }) {
    const active = areaFilter === area;
    const color = area === "All" ? "#1a1a1a" : AREA_COLORS[area];
    return (
      <button onClick={() => setAreaFilter(area)} style={{
        padding: "8px 16px", borderRadius: "6px 6px 0 0", fontSize: "13px", fontWeight: active ? 700 : 500,
        cursor: "pointer", border: "1px solid #e5e5e5", borderBottom: active ? "2px solid " + color : "1px solid #e5e5e5",
        background: active ? "#fff" : "#f5f5f5", color: active ? color : "#666",
        transition: "all 0.1s", whiteSpace: "nowrap",
      }}>{area}</button>
    );
  }

  function TierBtn({ tier }: { tier: Tier | "All" }) {
    const active = tierFilter === tier;
    const tc = tier === "All" ? null : TIER_COLORS[tier];
    return (
      <button onClick={() => setTierFilter(tier)} style={{
        padding: "5px 14px", borderRadius: "100px", fontSize: "12px", fontWeight: active ? 600 : 400,
        cursor: "pointer", border: `1px solid ${active && tc ? tc.border : "#e0e0e0"}`,
        background: active && tc ? tc.bg : active ? "#f0f0f0" : "#fff",
        color: active && tc ? tc.text : active ? "#1a1a1a" : "#666",
        transition: "all 0.1s",
      }}>{tier}</button>
    );
  }

  const hasComplete = commitments.some((c) => c.completed && c.tier !== "Weekly");

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={s.app}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.headerTop}>
          <div>
            <div style={s.title}>Commitment Triage</div>
            <div style={s.subtitle}>Life OS · {commitments.filter(c => !c.completed).length} active</div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {hasComplete && (
              <button style={s.btn("#c0392b", "#fff0f0", "#f5c6c6")} onClick={removeAllComplete}>
                Remove completed
              </button>
            )}
            <button style={s.btn("#1a1a1a", "#f5f5f5", "#e0e0e0")} onClick={() => setShowAdd(!showAdd)}>
              + Add
            </button>
            <button style={s.btn("#555", "#fff", "#e0e0e0")} onClick={() => setShowSettings(true)}>
              ⚙ Settings
            </button>
          </div>
        </div>

        {/* Area nav */}
        <div style={s.navRow}>
          <AreaBtn area="All" />
          {AREAS.map((a) => <AreaBtn key={a} area={a} />)}
        </div>

        {/* Tier tabs */}
        <div style={s.tierRow}>
          <TierBtn tier="All" />
          {TIERS.map((t) => <TierBtn key={t} tier={t} />)}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: "#fff0f0", color: "#c0392b", padding: "10px 32px", fontSize: "12px", borderBottom: "1px solid #f5c6c6" }}>
          ⚠ {error} <span style={{ cursor: "pointer", textDecoration: "underline", marginLeft: "8px" }} onClick={() => setError(null)}>dismiss</span>
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "40vh", color: "#aaa" }}>Loading…</div>
      ) : (
        <div style={s.main}>

          {/* Urgent section — always on top in All Areas view */}
          {(tierFilter === "All" || tierFilter === "Urgent") && urgentItems.length > 0 && (
            <div style={{ ...s.section, borderColor: "#f5c6c6" }}>
              <div style={{ ...s.sectionHeader, background: "#fff8f8" }}>
                <span style={{ ...s.sectionTitle, color: "#c0392b" }}>🔴 Urgent</span>
                <span style={{ fontSize: "11px", color: "#c0392b" }}>{urgentItems.filter(c => !c.completed).length} active</span>
              </div>
              <div style={s.tableWrap}>
                <table style={s.table}>
                  <colgroup>{widths.map((w, i) => <col key={i} style={{ width: w }} />)}</colgroup>
                  <TableHead />
                  <tbody>
                    {urgentItems.map((c, i) => renderRow(c, i))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Todo panel */}
          {(tierFilter === "All" || tierFilter === "High Priority" || tierFilter === "Normal") && todoItems.length > 0 && (
            <div style={{ ...s.section, borderColor: "#c6d3f5" }}>
              <div style={{ ...s.sectionHeader, background: "#f0f4ff", cursor: "pointer" }} onClick={() => setTodoCollapsed(!todoCollapsed)}>
                <span style={{ ...s.sectionTitle, color: "#2253c7" }}>📋 Today's Focus {todoCollapsed ? "▸" : "▾"}</span>
                <span style={{ fontSize: "11px", color: "#2253c7" }}>{todoItems.filter(c => !c.completed).length} remaining</span>
              </div>
              {!todoCollapsed && (
                <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: "6px" }}>
                  {todoItems.map((c) => (
                    <div key={c.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px", background: c.completed ? "#f9f9f9" : "#fff", borderRadius: "6px", border: "1px solid #e8eef8" }}>
                      <input type="checkbox" checked={c.completed} onChange={() => toggleComplete(c)} style={{ flexShrink: 0 }} />
                      <span style={{ flex: 1, fontWeight: 500, color: c.completed ? "#aaa" : "#1a1a1a", textDecoration: c.completed ? "line-through" : "none", fontSize: "13px" }}>{c.name}</span>
                      <span style={{ fontSize: "11px", color: AREA_COLORS[c.area], fontWeight: 600, whiteSpace: "nowrap" }}>{c.area}</span>
                      {c.deadline && <span style={{ fontSize: "11px", color: daysLabel(c.deadline).color, whiteSpace: "nowrap" }}>{daysLabel(c.deadline).text}</span>}
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "#888" }}>{calcPriority(c, settings)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Add row — shown above first area table when not in a section */}
          {showAdd && (
            <div style={s.section}>
              <div style={s.sectionHeader}>
                <span style={s.sectionTitle}>New Commitment</span>
                <button style={s.iconBtn} onClick={() => setShowAdd(false)}>✕</button>
              </div>
              <div style={s.tableWrap}>
                <table style={s.table}>
                  <colgroup>{widths.map((w, i) => <col key={i} style={{ width: w }} />)}</colgroup>
                  <TableHead />
                  <tbody>{renderAddRow()}</tbody>
                </table>
              </div>
            </div>
          )}

          {/* Area sections */}
          {areasToShow.map((area) => {
            const items = getAreaItems(area);
            if (items.length === 0 && !showAdd) return null;
            const areaColor = AREA_COLORS[area];
            const incomplete = items.filter(c => !c.completed).length;
            return (
              <div key={area} style={{ ...s.section, borderTop: `3px solid ${areaColor}` }}>
                <div style={s.sectionHeader}>
                  <span style={{ ...s.sectionTitle, color: areaColor }}>{area}</span>
                  <span style={{ fontSize: "11px", color: "#888" }}>{incomplete} active · {items.filter(c => c.completed).length} complete</span>
                </div>
                <div style={s.tableWrap}>
                  <table style={s.table}>
                    <colgroup>{widths.map((w, i) => <col key={i} style={{ width: w }} />)}</colgroup>
                    <TableHead />
                    <tbody>
                      {items.length === 0
                        ? <tr><td colSpan={headers.length} style={s.emptyRow}>No items in this area</td></tr>
                        : items.map((c, i) => renderRow(c, i))
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}

        </div>
      )}

      {/* Settings drawer */}
      {showSettings && (
        <div style={s.settingsOverlay} onClick={() => setShowSettings(false)}>
          <div style={s.settingsDrawer} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
              <span style={{ fontSize: "16px", fontWeight: 700 }}>Settings</span>
              <button style={s.iconBtn} onClick={() => setShowSettings(false)}>✕</button>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <div style={{ ...s.label, fontSize: "13px", color: "#1a1a1a", marginBottom: "12px" }}>Current Energy Level</div>
              <div style={{ display: "flex", gap: "8px" }}>
                {ENERGIES.map((e) => (
                  <button key={e} onClick={() => setSettings({ ...settings, currentEnergy: e })} style={s.btn(settings.currentEnergy === e ? "#fff" : "#555", settings.currentEnergy === e ? "#2253c7" : "#f5f5f5", settings.currentEnergy === e ? "#2253c7" : "#e0e0e0")}>{e}</button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <div style={{ ...s.label, fontSize: "13px", color: "#1a1a1a", marginBottom: "12px" }}>Priority Weights <span style={{ color: "#aaa", fontWeight: 400 }}>(must sum to 1)</span></div>
              {(["impact", "effort", "urgency"] as const).map((key) => (
                <div key={key} style={s.formGroup}>
                  <label style={s.label}>{key}</label>
                  <input type="number" step="0.05" min="0" max="1" style={{ ...s.input, width: "100px" }}
                    value={settings.weights[key]}
                    onChange={(e) => setSettings({ ...settings, weights: { ...settings.weights, [key]: parseFloat(e.target.value) || 0 } })}
                  />
                </div>
              ))}
            </div>

            <div>
              <div style={{ ...s.label, fontSize: "13px", color: "#1a1a1a", marginBottom: "12px" }}>Today's Focus — Items per Area</div>
              {AREAS.map((area) => (
                <div key={area} style={s.formGroup}>
                  <label style={s.label}>{area}</label>
                  <input type="number" min="1" max="10" style={{ ...s.input, width: "80px" }}
                    value={settings.topN[area]}
                    onChange={(e) => setSettings({ ...settings, topN: { ...settings.topN, [area]: parseInt(e.target.value) || 1 } })}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={{ padding: "12px 32px", borderTop: "1px solid #e5e5e5", fontSize: "11px", color: "#bbb", background: "#fff" }}>
        Double-click any row to edit · Check to complete · Settings to adjust focus and priority weights
        {saving && <span style={{ marginLeft: "12px", color: "#2253c7" }}>Saving…</span>}
      </div>
    </div>
  );
}
