import type { Mats } from "../data";
import { fmt, sortedMats } from "../materials";

/** Compact "200 Katana Stone · 10 Horus Omega Anima" list; "done" when nothing is left. */
export function MatList({ mats, empty = "✓ done" }: { mats: Mats; empty?: string }) {
  const rows = sortedMats(mats);
  if (!rows.length) return <span style={{ color: "#1a9e5c", fontSize: "12px" }}>{empty}</span>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2px", fontSize: "12px" }}>
      {rows.map(([name, n]) => (
        <span key={name}><b style={{ fontVariantNumeric: "tabular-nums" }}>{fmt(n)}</b> <span style={{ color: "#555" }}>{name}</span></span>
      ))}
    </div>
  );
}
