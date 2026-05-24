import { useState } from "react";
import { WEAPONS, type Category } from "./data";
import { useGbfGrid } from "./hooks/useGbfGrid";

const CATEGORIES: Category[] = ["Core", "Additional", "Niche"];

const SOURCE_COLORS: Record<string, { bg: string; color: string }> = {
  "Omega Rebirth": { bg: "#fff0e0", color: "#b85c00" },
  "Regalia":       { bg: "#f0e8ff", color: "#6b21a8" },
  "Odious":        { bg: "#ffe8e8", color: "#b91c1c" },
  "Ennead":        { bg: "#e8f5e9", color: "#166534" },
};

export default function GbfGridModule() {
  const [activeCategory, setActiveCategory] = useState<Category>("Core");
  const { checked, loading, error, setError, toggle } = useGbfGrid();

  const weapons = WEAPONS.filter(w => w.category === activeCategory);
  const doneCount = weapons.filter(w => checked.has(w.name)).length;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f9f9f9" }}>
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e5e5", padding: "20px 32px 0" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginBottom: "16px" }}>
          <span style={{ fontSize: "18px", fontWeight: 700, letterSpacing: "-0.02em" }}>Fire Grid · Colossus</span>
          <span style={{ fontSize: "13px", color: "#888" }}>{doneCount}/{weapons.length} in {activeCategory}</span>
        </div>
        <div style={{ display: "flex", gap: "4px" }}>
          {CATEGORIES.map(cat => {
            const total = WEAPONS.filter(w => w.category === cat).length;
            const done = WEAPONS.filter(w => w.category === cat && checked.has(w.name)).length;
            const isActive = cat === activeCategory;
            return (
              <button key={cat} onClick={() => setActiveCategory(cat)} style={{
                padding: "8px 16px", border: "1px solid #e5e5e5",
                borderBottom: isActive ? "2px solid #1a1a1a" : "1px solid #e5e5e5",
                borderRadius: "6px 6px 0 0", background: isActive ? "#fff" : "#f5f5f5",
                color: isActive ? "#1a1a1a" : "#666", fontWeight: isActive ? 700 : 400,
                fontSize: "13px", cursor: "pointer", transition: "all 0.1s",
              }}>
                {cat} <span style={{ fontSize: "11px", color: isActive ? "#555" : "#aaa" }}>({done}/{total})</span>
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

      <div style={{ flex: 1, padding: "24px 32px" }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "40vh", color: "#aaa" }}>Loading…</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: "8px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
            <thead>
              <tr style={{ background: "#1a1a1a", color: "#fff" }}>
                <th style={thStyle("40px")}>✓</th>
                <th style={thStyle()}>Weapon</th>
                <th style={thStyle("80px")}>Rank</th>
                <th style={thStyle("90px")}>Copies</th>
                <th style={thStyle("150px")}>Source</th>
              </tr>
            </thead>
            <tbody>
              {weapons.map((w, i) => {
                const done = checked.has(w.name);
                const srcStyle = SOURCE_COLORS[w.source];
                return (
                  <tr
                    key={w.name}
                    onClick={() => toggle(w.name)}
                    style={{
                      background: done ? "#f8f8f8" : i % 2 === 0 ? "#fff" : "#fafafa",
                      cursor: "pointer",
                      transition: "background 0.1s",
                      opacity: done ? 0.5 : 1,
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
                    <td style={tdStyle("center")}>{w.rank}</td>
                    <td style={tdStyle("center")}>{w.copies}</td>
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
                  </tr>
                );
              })}
            </tbody>
          </table>
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
