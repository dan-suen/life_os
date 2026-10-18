import type { Mats } from "../data";
import { fmt, sortedMats } from "../materials";

const line = (name: string, n: number, muted = false) => (
  <span key={name} style={muted ? { color: "#888" } : undefined}>
    <b style={{ fontVariantNumeric: "tabular-nums" }}>{fmt(n)}</b> <span style={{ color: muted ? "#999" : "#555" }}>{name}</span>
  </span>
);

/** Compact material list; group-specific extras follow under a divider. "done" when nothing is left. */
export function MatList({ mats, extras = {}, empty = "✓ done" }: { mats: Mats; extras?: Mats; empty?: string }) {
  const rows = sortedMats(mats);
  const extraRows = sortedMats(extras);
  if (!rows.length && !extraRows.length) return <span style={{ color: "#1a9e5c", fontSize: "12px" }}>{empty}</span>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2px", fontSize: "12px" }}>
      {rows.map(([name, n]) => line(name, n))}
      {extraRows.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "2px", borderTop: rows.length ? "1px dashed #e5e5e5" : "none", paddingTop: rows.length ? "3px" : 0, marginTop: rows.length ? "2px" : 0 }}>
          {extraRows.map(([name, n]) => line(name, n, true))}
        </div>
      )}
    </div>
  );
}
