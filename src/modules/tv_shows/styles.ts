import type { CSSProperties } from "react";

export const s = {
  app:        { fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif", minHeight: "100vh", background: "#f8f8f8", width: "100%" } as CSSProperties,
  header:     { background: "#fff", borderBottom: "1px solid #e5e5e5", padding: "20px 32px 0" } as CSSProperties,
  headerTop:  { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" } as CSSProperties,
  title:      { fontSize: "20px", fontWeight: 700, color: "#1a1a1a", letterSpacing: "-0.02em" } as CSSProperties,
  subtitle:   { fontSize: "12px", color: "#888", marginTop: "2px" } as CSSProperties,
  main:       { padding: "24px 32px" } as CSSProperties,
  list:       { background: "#fff", border: "1px solid #e5e5e5", borderRadius: "8px", overflow: "hidden" } as CSSProperties,
  footer:     { padding: "12px 32px", borderTop: "1px solid #e5e5e5", fontSize: "11px", color: "#bbb", background: "#fff" } as CSSProperties,
  input:      { border: "1px solid #d0d0d0", background: "#fff", color: "#1a1a1a", padding: "6px 10px", borderRadius: "5px", fontSize: "13px", width: "100%", minWidth: 0, boxSizing: "border-box" as const, outline: "none" } as CSSProperties,
  smallSel:   { border: "1px solid #d0d0d0", background: "#fff", color: "#1a1a1a", padding: "5px 6px", borderRadius: "5px", fontSize: "12px", cursor: "pointer", width: "100%", minWidth: 0 } as CSSProperties,
  label:      { fontSize: "10px", fontWeight: 600 as const, color: "#666", textTransform: "uppercase" as const, letterSpacing: "0.05em" } as CSSProperties,
  btn:        (color: string, bg: string, border: string): CSSProperties => ({ background: bg, color, border: `1px solid ${border}`, padding: "6px 14px", borderRadius: "6px", fontSize: "12px", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }),
  iconBtn:    { background: "transparent", border: "none", cursor: "pointer", fontSize: "14px", padding: "2px 5px", color: "#888" } as CSSProperties,
  episodeBtn: { background: "#f0f0f0", border: "1px solid #ddd", borderRadius: "4px", cursor: "pointer", fontSize: "13px", padding: "2px 8px", color: "#333", fontWeight: 700 } as CSSProperties,
};
