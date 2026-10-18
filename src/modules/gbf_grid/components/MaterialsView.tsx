import { useState } from "react";
import { ELEMENT_META, type Element, type Weapon } from "../data";
import { MAT_CATEGORIES, SHARD_TRIALS, type MatCategory, fmt, matCategory, remainingExtra, remainingMats, sortedMats } from "../materials";

interface Props {
  weapons: Weapon[];
  groups: string[];
  elementFilter: Element | "All";
}

const chip = (on: boolean): React.CSSProperties => ({
  padding: "3px 10px", borderRadius: "12px", fontSize: "12px", cursor: "pointer", userSelect: "none",
  border: `1px solid ${on ? "#1a1a1a" : "#d5d5d5"}`, background: on ? "#1a1a1a" : "#fff", color: on ? "#fff" : "#666",
});

/** Remaining materials summed across every weapon, filterable by group, element and category. */
export function MaterialsView({ weapons, groups, elementFilter }: Props) {
  const [hiddenGroups, setHiddenGroups] = useState<Set<string>>(new Set());
  const [cats, setCats] = useState<Set<MatCategory>>(new Set(MAT_CATEGORIES));
  const [showExtra, setShowExtra] = useState(true);
  const hasExtras = weapons.some(w => Object.keys(w.extras ?? {}).length);
  const [open, setOpen] = useState<string | null>(null);

  const inScope = weapons.filter(w =>
    !hiddenGroups.has(w.source) &&
    (elementFilter === "All" || w.element === elementFilter || w.element === "Any"));
  const tracked = inScope.filter(w => w.stages?.length);

  // material -> weapons contributing to it
  const byMat = new Map<string, { w: Weapon; n: number }[]>();
  for (const w of tracked) {
    for (const [name, n] of sortedMats(remainingMats(w))) {
      const c = matCategory(name);
      if (!c || !cats.has(c)) continue;
      byMat.set(name, [...(byMat.get(name) ?? []), { w, n }]);
    }
    if (showExtra) {
      for (const [name, n] of sortedMats(remainingExtra(w))) byMat.set(name, [...(byMat.get(name) ?? []), { w, n }]);
    }
  }
  const totals = Object.fromEntries([...byMat].map(([name, list]) => [name, list.reduce((a, x) => a + x.n, 0)]));
  const rows = sortedMats(totals);

  const toggleGroup = (g: string) => setHiddenGroups(p => { const n = new Set(p); n.has(g) ? n.delete(g) : n.add(g); return n; });
  const toggleCat = (c: MatCategory) => setCats(p => { const n = new Set(p); n.has(c) ? n.delete(c) : n.add(c); return n; });

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: "11px", color: "#888", width: "70px" }}>MATERIAL</span>
          {MAT_CATEGORIES.map(c => <span key={c} style={chip(cats.has(c))} onClick={() => toggleCat(c)}>{c}</span>)}
          {hasExtras && <span style={chip(showExtra)} onClick={() => setShowExtra(v => !v)}>Group-specific</span>}
        </div>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: "11px", color: "#888", width: "70px" }}>GROUPS</span>
          {groups.map(g => <span key={g} style={chip(!hiddenGroups.has(g))} onClick={() => toggleGroup(g)}>{g}</span>)}
          <span style={{ fontSize: "11px", color: "#2253c7", cursor: "pointer", marginLeft: "4px" }} onClick={() => setHiddenGroups(new Set())}>all</span>
          <span style={{ fontSize: "11px", color: "#2253c7", cursor: "pointer" }} onClick={() => setHiddenGroups(new Set(groups))}>none</span>
        </div>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: "8px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
        <thead>
          <tr style={{ background: "#1a1a1a", color: "#fff", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            <th style={{ padding: "10px 16px", textAlign: "left" }}>Material</th>
            <th style={{ padding: "10px 16px", textAlign: "left", width: "120px" }}>Type</th>
            <th style={{ padding: "10px 16px", textAlign: "right", width: "120px" }}>Remaining</th>
            <th style={{ padding: "10px 16px", textAlign: "right", width: "90px" }}>Weapons</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([name, total]) => {
            const list = byMat.get(name)!;
            const isOpen = open === name;
            return [
              <tr key={name} onClick={() => setOpen(isOpen ? null : name)} style={{ cursor: "pointer", borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: "10px 16px", fontSize: "13px", fontWeight: 500 }}>{isOpen ? "▾" : "▸"} {name}
                  {SHARD_TRIALS[name] && (SHARD_TRIALS[name].length
                    ? <span style={{ marginLeft: "8px", fontSize: "11px", color: "#888" }}>{SHARD_TRIALS[name].join(" / ")} Mastery Trial</span>
                    : <span style={{ marginLeft: "8px", fontSize: "11px", fontWeight: 600, padding: "1px 6px", borderRadius: "4px", background: "#fdecea", color: "#b03a2e" }}>not from Mastery Trials</span>)}
                </td>
                <td style={{ padding: "10px 16px", fontSize: "12px", color: "#888" }}>{matCategory(name) ?? `${list[0].w.source} (group)`}</td>
                <td style={{ padding: "10px 16px", fontSize: "13px", fontWeight: 700, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{fmt(total)}</td>
                <td style={{ padding: "10px 16px", fontSize: "12px", color: "#888", textAlign: "right" }}>{list.length}</td>
              </tr>,
              isOpen && list.map(({ w, n }) => (
                <tr key={`${name}:${w.id}`} style={{ background: "#fafafa", borderBottom: "1px solid #f0f0f0" }}>
                  <td style={{ padding: "6px 16px 6px 36px", fontSize: "12px" }}>
                    {w.name} <span style={{ color: ELEMENT_META[w.element].color, fontSize: "11px" }}>{w.element}</span>
                  </td>
                  <td style={{ padding: "6px 16px", fontSize: "11px", color: "#999" }}>{w.source}</td>
                  <td style={{ padding: "6px 16px", fontSize: "12px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{fmt(n)}</td>
                  <td />
                </tr>
              )),
            ];
          })}
          {rows.length === 0 && (
            <tr><td colSpan={4} style={{ textAlign: "center", padding: "48px", color: "#aaa", fontSize: "13px" }}>Nothing remaining</td></tr>
          )}
        </tbody>
      </table>
      <div style={{ marginTop: "12px", fontSize: "12px", color: "#aaa" }}>
        {tracked.length}/{inScope.length} weapons in scope have stage data
      </div>
    </div>
  );
}
