import { useState, useEffect } from "react";

const AREAS = [
  "Work / Career",
  "Health & Fitness",
  "Personal Projects & Hobbies",
  "Finances",
];

const STATUSES = [
  { label: "Keep", color: "#4ade80", bg: "#052e16", dot: "#4ade80" },
  { label: "Pause", color: "#facc15", bg: "#1c1917", dot: "#facc15" },
  { label: "Delegate", color: "#60a5fa", bg: "#0c1a2e", dot: "#60a5fa" },
  { label: "Drop", color: "#f87171", bg: "#2d0a0a", dot: "#f87171" },
];

const EFFORTS = ["Low", "Medium", "High"];
const IMPACTS = ["Low", "Medium", "High"];

const impactScore = { Low: 1, Medium: 2, High: 3 };
const effortScore = { Low: 3, Medium: 2, High: 1 };

function priorityScore(c) {
  return impactScore[c.impact] * 2 + effortScore[c.effort];
}

const statusStyle = (label) =>
  STATUSES.find((s) => s.label === label) || STATUSES[0];

const defaultCommitment = () => ({
  id: Date.now() + Math.random(),
  name: "",
  area: AREAS[0],
  status: "Keep",
  effort: "Medium",
  impact: "Medium",
  note: "",
});

export default function App() {
  const [commitments, setCommitments] = useState([]);
  const [filter, setFilter] = useState("All");
  const [areaFilter, setAreaFilter] = useState("All");
  const [editing, setEditing] = useState(null); // id of row being edited
  const [form, setForm] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newForm, setNewForm] = useState(defaultCommitment());
  const [sort, setSort] = useState("priority");

  const sorted = [...commitments]
    .filter((c) => (filter === "All" ? true : c.status === filter))
    .filter((c) => (areaFilter === "All" ? true : c.area === areaFilter))
    .sort((a, b) => {
      if (sort === "priority") return priorityScore(b) - priorityScore(a);
      if (sort === "area") return a.area.localeCompare(b.area);
      if (sort === "name") return a.name.localeCompare(b.name);
      return 0;
    });

  const counts = STATUSES.reduce((acc, s) => {
    acc[s.label] = commitments.filter((c) => c.status === s.label).length;
    return acc;
  }, {});

  function addCommitment() {
    if (!newForm.name.trim()) return;
    setCommitments((prev) => [...prev, { ...newForm, id: Date.now() }]);
    setNewForm(defaultCommitment());
    setShowAdd(false);
  }

  function startEdit(c) {
    setEditing(c.id);
    setForm({ ...c });
  }

  function saveEdit() {
    setCommitments((prev) =>
      prev.map((c) => (c.id === editing ? { ...form } : c))
    );
    setEditing(null);
    setForm(null);
  }

  function deleteCommitment(id) {
    setCommitments((prev) => prev.filter((c) => c.id !== id));
    if (editing === id) setEditing(null);
  }

  function cycleStatus(id) {
    setCommitments((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const idx = STATUSES.findIndex((s) => s.label === c.status);
        return { ...c, status: STATUSES[(idx + 1) % STATUSES.length].label };
      })
    );
  }

  const style = {
    app: {
      minHeight: "100vh",
      background: "#0a0a0a",
      color: "#e8e0d5",
      fontFamily: "'Georgia', serif",
      padding: "0",
    },
    header: {
      borderBottom: "1px solid #1f1f1f",
      padding: "32px 40px 24px",
      background: "#0a0a0a",
    },
    title: {
      fontSize: "13px",
      letterSpacing: "0.2em",
      textTransform: "uppercase",
      color: "#6b6b6b",
      marginBottom: "6px",
      fontFamily: "'Georgia', serif",
    },
    h1: {
      fontSize: "clamp(28px, 4vw, 42px)",
      fontWeight: "400",
      color: "#e8e0d5",
      margin: "0 0 24px",
      letterSpacing: "-0.02em",
      lineHeight: 1.1,
    },
    pills: {
      display: "flex",
      gap: "8px",
      flexWrap: "wrap",
    },
    pill: (active, color) => ({
      padding: "5px 14px",
      borderRadius: "100px",
      fontSize: "12px",
      letterSpacing: "0.05em",
      border: `1px solid ${active ? color : "#2a2a2a"}`,
      background: active ? color + "22" : "transparent",
      color: active ? color : "#6b6b6b",
      cursor: "pointer",
      transition: "all 0.15s",
    }),
    main: {
      padding: "24px 40px",
    },
    toolbar: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: "20px",
      flexWrap: "wrap",
      gap: "12px",
    },
    addBtn: {
      background: "#e8e0d5",
      color: "#0a0a0a",
      border: "none",
      padding: "9px 20px",
      borderRadius: "6px",
      fontSize: "13px",
      cursor: "pointer",
      fontFamily: "'Georgia', serif",
      letterSpacing: "0.03em",
      fontWeight: "600",
    },
    select: {
      background: "#111",
      border: "1px solid #2a2a2a",
      color: "#e8e0d5",
      padding: "7px 12px",
      borderRadius: "6px",
      fontSize: "12px",
      cursor: "pointer",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
    },
    th: {
      textAlign: "left",
      padding: "10px 14px",
      fontSize: "10px",
      letterSpacing: "0.15em",
      textTransform: "uppercase",
      color: "#4a4a4a",
      borderBottom: "1px solid #1a1a1a",
    },
    tr: (i) => ({
      borderBottom: "1px solid #141414",
      background: i % 2 === 0 ? "#0a0a0a" : "#0d0d0d",
      transition: "background 0.1s",
    }),
    td: {
      padding: "12px 14px",
      fontSize: "14px",
      verticalAlign: "middle",
    },
    statusBadge: (label) => {
      const s = statusStyle(label);
      return {
        display: "inline-block",
        padding: "3px 10px",
        borderRadius: "100px",
        fontSize: "11px",
        letterSpacing: "0.06em",
        border: `1px solid ${s.color}44`,
        color: s.color,
        background: s.color + "18",
        cursor: "pointer",
        userSelect: "none",
        whiteSpace: "nowrap",
      };
    },
    input: {
      background: "#161616",
      border: "1px solid #2a2a2a",
      color: "#e8e0d5",
      padding: "6px 10px",
      borderRadius: "5px",
      fontSize: "13px",
      width: "100%",
      fontFamily: "'Georgia', serif",
    },
    smallSelect: {
      background: "#161616",
      border: "1px solid #2a2a2a",
      color: "#e8e0d5",
      padding: "5px 8px",
      borderRadius: "5px",
      fontSize: "12px",
      cursor: "pointer",
    },
    saveBtn: {
      background: "#4ade80",
      color: "#000",
      border: "none",
      padding: "5px 12px",
      borderRadius: "5px",
      fontSize: "12px",
      cursor: "pointer",
      fontWeight: "600",
    },
    cancelBtn: {
      background: "transparent",
      color: "#6b6b6b",
      border: "1px solid #2a2a2a",
      padding: "5px 10px",
      borderRadius: "5px",
      fontSize: "12px",
      cursor: "pointer",
    },
    deleteBtn: {
      background: "transparent",
      color: "#4a4a4a",
      border: "none",
      cursor: "pointer",
      fontSize: "16px",
      padding: "2px 6px",
    },
    addRow: {
      background: "#0e0e0e",
      borderTop: "1px solid #2a2a2a",
      borderBottom: "1px solid #2a2a2a",
    },
    priorityDot: (score) => {
      const color = score >= 8 ? "#f87171" : score >= 6 ? "#facc15" : "#4ade80";
      return {
        width: "8px",
        height: "8px",
        borderRadius: "50%",
        background: color,
        display: "inline-block",
        marginRight: "6px",
        verticalAlign: "middle",
      };
    },
    empty: {
      textAlign: "center",
      padding: "60px 20px",
      color: "#3a3a3a",
      fontSize: "14px",
    },
    statsRow: {
      display: "flex",
      gap: "16px",
      marginBottom: "24px",
      flexWrap: "wrap",
    },
    statCard: (color) => ({
      flex: "1",
      minWidth: "100px",
      padding: "16px",
      borderRadius: "8px",
      border: `1px solid ${color}33`,
      background: color + "0a",
    }),
    statNum: (color) => ({
      fontSize: "28px",
      fontWeight: "300",
      color: color,
      lineHeight: 1,
    }),
    statLabel: {
      fontSize: "10px",
      letterSpacing: "0.12em",
      color: "#4a4a4a",
      textTransform: "uppercase",
      marginTop: "4px",
    },
  };

  return (
    <div style={style.app}>
      <div style={style.header}>
        <div style={style.title}>Life OS</div>
        <h1 style={style.h1}>Commitment Triage</h1>
        <div style={style.pills}>
          {["All", ...STATUSES.map((s) => s.label)].map((f) => {
            const s = STATUSES.find((x) => x.label === f);
            const color = s ? s.color : "#e8e0d5";
            return (
              <button
                key={f}
                style={style.pill(filter === f, color)}
                onClick={() => setFilter(f)}
              >
                {f}{" "}
                {f !== "All" && counts[f] !== undefined
                  ? `(${counts[f]})`
                  : f === "All"
                  ? `(${commitments.length})`
                  : ""}
              </button>
            );
          })}
        </div>
      </div>

      <div style={style.main}>
        {commitments.length > 0 && (
          <div style={style.statsRow}>
            {STATUSES.map((s) => (
              <div key={s.label} style={style.statCard(s.color)}>
                <div style={style.statNum(s.color)}>{counts[s.label] || 0}</div>
                <div style={style.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        <div style={style.toolbar}>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <select
              style={style.select}
              value={areaFilter}
              onChange={(e) => setAreaFilter(e.target.value)}
            >
              <option value="All">All areas</option>
              {AREAS.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
            <select
              style={style.select}
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="priority">Sort: Priority</option>
              <option value="area">Sort: Area</option>
              <option value="name">Sort: Name</option>
            </select>
          </div>
          <button
            style={style.addBtn}
            onClick={() => {
              setShowAdd(true);
              setEditing(null);
            }}
          >
            + Add Commitment
          </button>
        </div>

        <table style={style.table}>
          <thead>
            <tr>
              <th style={style.th}>Commitment</th>
              <th style={style.th}>Area</th>
              <th style={style.th}>Status</th>
              <th style={style.th}>Effort</th>
              <th style={style.th}>Impact</th>
              <th style={style.th}>Priority</th>
              <th style={style.th}>Note</th>
              <th style={style.th}></th>
            </tr>
          </thead>
          <tbody>
            {showAdd && (
              <tr style={style.addRow}>
                <td style={style.td}>
                  <input
                    autoFocus
                    style={style.input}
                    placeholder="Commitment name..."
                    value={newForm.name}
                    onChange={(e) =>
                      setNewForm({ ...newForm, name: e.target.value })
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") addCommitment();
                      if (e.key === "Escape") setShowAdd(false);
                    }}
                  />
                </td>
                <td style={style.td}>
                  <select
                    style={style.smallSelect}
                    value={newForm.area}
                    onChange={(e) =>
                      setNewForm({ ...newForm, area: e.target.value })
                    }
                  >
                    {AREAS.map((a) => (
                      <option key={a}>{a}</option>
                    ))}
                  </select>
                </td>
                <td style={style.td}>
                  <select
                    style={style.smallSelect}
                    value={newForm.status}
                    onChange={(e) =>
                      setNewForm({ ...newForm, status: e.target.value })
                    }
                  >
                    {STATUSES.map((s) => (
                      <option key={s.label}>{s.label}</option>
                    ))}
                  </select>
                </td>
                <td style={style.td}>
                  <select
                    style={style.smallSelect}
                    value={newForm.effort}
                    onChange={(e) =>
                      setNewForm({ ...newForm, effort: e.target.value })
                    }
                  >
                    {EFFORTS.map((e) => (
                      <option key={e}>{e}</option>
                    ))}
                  </select>
                </td>
                <td style={style.td}>
                  <select
                    style={style.smallSelect}
                    value={newForm.impact}
                    onChange={(e) =>
                      setNewForm({ ...newForm, impact: e.target.value })
                    }
                  >
                    {IMPACTS.map((i) => (
                      <option key={i}>{i}</option>
                    ))}
                  </select>
                </td>
                <td style={style.td}>—</td>
                <td style={style.td}>
                  <input
                    style={style.input}
                    placeholder="Optional note..."
                    value={newForm.note}
                    onChange={(e) =>
                      setNewForm({ ...newForm, note: e.target.value })
                    }
                  />
                </td>
                <td style={style.td}>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button style={style.saveBtn} onClick={addCommitment}>
                      Add
                    </button>
                    <button
                      style={style.cancelBtn}
                      onClick={() => setShowAdd(false)}
                    >
                      ✕
                    </button>
                  </div>
                </td>
              </tr>
            )}

            {sorted.length === 0 && !showAdd && (
              <tr>
                <td colSpan={8} style={style.empty}>
                  {commitments.length === 0
                    ? "No commitments yet — add one above to get started."
                    : "No commitments match this filter."}
                </td>
              </tr>
            )}

            {sorted.map((c, i) =>
              editing === c.id ? (
                <tr
                  key={c.id}
                  style={{ ...style.tr(i), background: "#121212" }}
                >
                  <td style={style.td}>
                    <input
                      autoFocus
                      style={style.input}
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit();
                        if (e.key === "Escape") setEditing(null);
                      }}
                    />
                  </td>
                  <td style={style.td}>
                    <select
                      style={style.smallSelect}
                      value={form.area}
                      onChange={(e) =>
                        setForm({ ...form, area: e.target.value })
                      }
                    >
                      {AREAS.map((a) => (
                        <option key={a}>{a}</option>
                      ))}
                    </select>
                  </td>
                  <td style={style.td}>
                    <select
                      style={style.smallSelect}
                      value={form.status}
                      onChange={(e) =>
                        setForm({ ...form, status: e.target.value })
                      }
                    >
                      {STATUSES.map((s) => (
                        <option key={s.label}>{s.label}</option>
                      ))}
                    </select>
                  </td>
                  <td style={style.td}>
                    <select
                      style={style.smallSelect}
                      value={form.effort}
                      onChange={(e) =>
                        setForm({ ...form, effort: e.target.value })
                      }
                    >
                      {EFFORTS.map((e) => (
                        <option key={e}>{e}</option>
                      ))}
                    </select>
                  </td>
                  <td style={style.td}>
                    <select
                      style={style.smallSelect}
                      value={form.impact}
                      onChange={(e) =>
                        setForm({ ...form, impact: e.target.value })
                      }
                    >
                      {IMPACTS.map((imp) => (
                        <option key={imp}>{imp}</option>
                      ))}
                    </select>
                  </td>
                  <td style={style.td}>—</td>
                  <td style={style.td}>
                    <input
                      style={style.input}
                      placeholder="Note..."
                      value={form.note}
                      onChange={(e) =>
                        setForm({ ...form, note: e.target.value })
                      }
                    />
                  </td>
                  <td style={style.td}>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button style={style.saveBtn} onClick={saveEdit}>
                        Save
                      </button>
                      <button
                        style={style.cancelBtn}
                        onClick={() => setEditing(null)}
                      >
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr
                  key={c.id}
                  style={style.tr(i)}
                  onDoubleClick={() => startEdit(c)}
                >
                  <td
                    style={{ ...style.td, fontWeight: "500", color: "#d4ccc4" }}
                  >
                    {c.name || (
                      <span style={{ color: "#3a3a3a" }}>Unnamed</span>
                    )}
                  </td>
                  <td
                    style={{ ...style.td, fontSize: "12px", color: "#6b6b6b" }}
                  >
                    {c.area}
                  </td>
                  <td style={style.td}>
                    <span
                      style={style.statusBadge(c.status)}
                      onClick={() => cycleStatus(c.id)}
                      title="Click to cycle status"
                    >
                      {c.status}
                    </span>
                  </td>
                  <td
                    style={{ ...style.td, fontSize: "12px", color: "#6b6b6b" }}
                  >
                    {c.effort}
                  </td>
                  <td
                    style={{ ...style.td, fontSize: "12px", color: "#6b6b6b" }}
                  >
                    {c.impact}
                  </td>
                  <td style={style.td}>
                    <span style={style.priorityDot(priorityScore(c))}></span>
                    <span style={{ fontSize: "12px", color: "#6b6b6b" }}>
                      {priorityScore(c)}
                    </span>
                  </td>
                  <td
                    style={{
                      ...style.td,
                      fontSize: "12px",
                      color: "#5a5a5a",
                      maxWidth: "180px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {c.note || "—"}
                  </td>
                  <td style={style.td}>
                    <div style={{ display: "flex", gap: "4px" }}>
                      <button
                        style={{ ...style.deleteBtn, color: "#4a4a4a" }}
                        onClick={() => startEdit(c)}
                        title="Edit"
                      >
                        ✎
                      </button>
                      <button
                        style={style.deleteBtn}
                        onClick={() => deleteCommitment(c.id)}
                        title="Delete"
                      >
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      <div
        style={{
          padding: "16px 40px",
          borderTop: "1px solid #141414",
          fontSize: "11px",
          color: "#2a2a2a",
          letterSpacing: "0.05em",
        }}
      >
        Double-click any row to edit · Click a status badge to cycle it · Sort
        by priority to see what to cut first
      </div>
    </div>
  );
}
