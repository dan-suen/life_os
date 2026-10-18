import { useState } from "react";
import type { Mats } from "../data";
import { fmt, sortedMats } from "../materials";

const line = (name: string, n: number, muted = false) => (
  <span key={name} style={muted ? { color: "#888" } : undefined}>
    <b style={{ fontVariantNumeric: "tabular-nums" }}>{fmt(n)}</b> <span style={{ color: muted ? "#999" : "#555" }}>{name}</span>
  </span>
);

/**
 * Compact material list; group-specific extras follow under a divider. "done" when nothing is left.
 * With `limit`, only that many lines show until "+N more" is clicked.
 */
export function MatList({ mats, extras = {}, empty = "✓ done", limit }: { mats: Mats; extras?: Mats; empty?: string; limit?: number }) {
  const [open, setOpen] = useState(false);
  const rows = sortedMats(mats);
  const extraRows = sortedMats(extras);
  if (!rows.length && !extraRows.length) return <span style={{ color: "#1a9e5c", fontSize: "12px" }}>{empty}</span>;
  const total = rows.length + extraRows.length;
  const cut = limit && !open && total > limit ? limit : Infinity;
  const shownRows = rows.slice(0, cut);
  const shownExtra = extraRows.slice(0, Math.max(0, cut - rows.length));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2px", fontSize: "12px" }}>
      {shownRows.map(([name, n]) => line(name, n))}
      {shownExtra.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "2px", borderTop: shownRows.length ? "1px dashed #e5e5e5" : "none", paddingTop: shownRows.length ? "3px" : 0, marginTop: shownRows.length ? "2px" : 0 }}>
          {shownExtra.map(([name, n]) => line(name, n, true))}
        </div>
      )}
      {limit && total > limit && (
        <span onClick={() => setOpen(o => !o)} style={{ fontSize: "11px", color: "#2253c7", cursor: "pointer", userSelect: "none" }}>
          {open ? "show less" : `+${total - limit} more`}
        </span>
      )}
    </div>
  );
}
