import type { CSSProperties } from "react";

const BASE: CSSProperties = {
  fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  fontSize: "14px",
  color: "#1a1a1a",
  background: "#ffffff",
};

export const s = {
  app:           { ...BASE, minHeight: "100vh", background: "#f8f8f8" } as CSSProperties,
  header:        { background: "#ffffff", borderBottom: "1px solid #e5e5e5", padding: "20px 32px 0" } as CSSProperties,
  headerTop:     { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" } as CSSProperties,
  title:         { fontSize: "20px", fontWeight: 700, color: "#1a1a1a", letterSpacing: "-0.02em" } as CSSProperties,
  subtitle:      { fontSize: "12px", color: "#888", marginTop: "2px" } as CSSProperties,
  navRow:        { display: "flex", gap: "6px", flexWrap: "wrap" as const, marginBottom: "0" },
  tierRow:       { display: "flex", gap: "6px", flexWrap: "wrap" as const, padding: "10px 0 0" },
  main:          { padding: "24px 32px" } as CSSProperties,
  section:       { background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "8px", marginBottom: "16px", overflow: "hidden" } as CSSProperties,
  sectionHeader: { padding: "12px 16px", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fafafa" } as CSSProperties,
  sectionTitle:  { fontWeight: 600, fontSize: "13px", color: "#1a1a1a" } as CSSProperties,
  tableWrap:     { overflowX: "auto" as const, width: "100%" } as CSSProperties,
  table:         { width: "100%", minWidth: "820px", borderCollapse: "collapse" as const, tableLayout: "fixed" as const } as CSSProperties,
  th:            { textAlign: "left" as const, padding: "9px 12px", fontSize: "11px", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" as const, color: "#666", borderBottom: "1px solid #e5e5e5", background: "#fafafa", whiteSpace: "nowrap" as const, overflow: "hidden" as const } as CSSProperties,
  td:            { padding: "10px 12px", fontSize: "13px", verticalAlign: "middle" as const, borderBottom: "1px solid #f5f5f5", color: "#1a1a1a", overflow: "hidden" as const } as CSSProperties,
  input:         { border: "1px solid #d0d0d0", background: "#fff", color: "#1a1a1a", padding: "6px 10px", borderRadius: "5px", fontSize: "13px", width: "100%", minWidth: 0, boxSizing: "border-box" as const, outline: "none" } as CSSProperties,
  smallSel:      { border: "1px solid #d0d0d0", background: "#fff", color: "#1a1a1a", padding: "5px 6px", borderRadius: "5px", fontSize: "12px", cursor: "pointer", width: "100%", minWidth: 0 } as CSSProperties,
  btn:           (color: string, bg: string, border: string): CSSProperties => ({ background: bg, color, border: `1px solid ${border}`, padding: "6px 14px", borderRadius: "6px", fontSize: "12px", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }),
  iconBtn:       { background: "transparent", border: "none", cursor: "pointer", fontSize: "14px", padding: "2px 5px", color: "#888" } as CSSProperties,
  settingsOverlay: { position: "fixed" as const, inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 100, display: "flex", justifyContent: "flex-end" },
  settingsDrawer:  { background: "#fff", width: "320px", height: "100vh", overflowY: "auto" as const, padding: "24px", boxShadow: "-4px 0 20px rgba(0,0,0,0.1)" },
  label:         { fontSize: "11px", fontWeight: 600, color: "#666", textTransform: "uppercase" as const, letterSpacing: "0.05em", display: "block", marginBottom: "4px" } as CSSProperties,
  formGroup:     { marginBottom: "16px" } as CSSProperties,
};

export const COL_WIDTHS        = ["3%", "26%", "10%", "9%", "8%", "8%", "8%", "9%", "7%", "8%", "4%"];
export const COL_HEADERS       = ["", "Commitment", "Tier", "Area", "Effort", "Impact", "Energy", "Deadline", "Priority", "Note", ""];
export const COL_WIDTHS_NO_AREA  = ["3%", "30%", "11%", "10%", "9%", "9%", "10%", "8%", "9%", "1%"];
export const COL_HEADERS_NO_AREA = ["", "Commitment", "Tier", "Effort", "Impact", "Energy", "Deadline", "Priority", "Note", ""];
