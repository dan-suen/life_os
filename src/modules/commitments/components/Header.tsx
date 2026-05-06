import type { Area, Tier } from "../types";
import { AREAS, TIERS } from "../types";
import { AREA_COLORS, TIER_COLORS } from "../constants";
import { s } from "../styles";

interface Props {
  activeCount: number;
  areaFilter: Area | "All" | "Today's Focus";
  tierFilter: Tier | "All";
  hasComplete: boolean;
  onAreaChange: (area: Area | "All" | "Today's Focus") => void;
  onTierChange: (tier: Tier | "All") => void;
  onAddClick: () => void;
  onSettingsClick: () => void;
  onRemoveComplete: () => void;
}

function AreaBtn({ area, active, onAreaChange }: { area: Area | "All" | "Today's Focus"; active: boolean; onAreaChange: (a: Area | "All" | "Today's Focus") => void }) {
  const color = area === "All" ? "#1a1a1a" : area === "Today's Focus" ? "#7c3aed" : AREA_COLORS[area];
  return (
    <button onClick={() => onAreaChange(area)} style={{
      padding: "8px 16px", borderRadius: "6px 6px 0 0", fontSize: "13px", fontWeight: active ? 700 : 500,
      cursor: "pointer", border: "1px solid #e5e5e5", borderBottom: active ? `2px solid ${color}` : "1px solid #e5e5e5",
      background: active ? "#fff" : "#f5f5f5", color: active ? color : "#666",
      transition: "all 0.1s", whiteSpace: "nowrap",
    }}>{area}</button>
  );
}

function TierBtn({ tier, active, onTierChange }: { tier: Tier | "All"; active: boolean; onTierChange: (t: Tier | "All") => void }) {
  const tc = tier === "All" ? null : TIER_COLORS[tier];
  return (
    <button onClick={() => onTierChange(tier)} style={{
      padding: "5px 14px", borderRadius: "100px", fontSize: "12px", fontWeight: active ? 600 : 400,
      cursor: "pointer", border: `1px solid ${active && tc ? tc.border : "#e0e0e0"}`,
      background: active && tc ? tc.bg : active ? "#f0f0f0" : "#fff",
      color: active && tc ? tc.text : active ? "#1a1a1a" : "#666",
      transition: "all 0.1s",
    }}>{tier}</button>
  );
}

export function Header({ activeCount, areaFilter, tierFilter, hasComplete, onAreaChange, onTierChange, onAddClick, onSettingsClick, onRemoveComplete }: Props) {
  return (
    <div style={s.header}>
      <div style={s.headerTop}>
        <div>
          <div style={s.title}>Commitment Triage</div>
          <div style={s.subtitle}>Life OS · {activeCount} active</div>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {hasComplete && <button style={s.btn("#c0392b", "#fff0f0", "#f5c6c6")} onClick={onRemoveComplete}>Remove completed</button>}
          <button style={s.btn("#1a1a1a", "#f5f5f5", "#e0e0e0")} onClick={onAddClick}>+ Add</button>
          <button style={s.btn("#555", "#fff", "#e0e0e0")} onClick={onSettingsClick}>⚙ Settings</button>
        </div>
      </div>
      <div style={s.navRow}>
        <AreaBtn area="All" active={areaFilter === "All"} onAreaChange={onAreaChange} />
        <AreaBtn area="Today's Focus" active={areaFilter === "Today's Focus"} onAreaChange={onAreaChange} />
        {AREAS.map(a => <AreaBtn key={a} area={a} active={areaFilter === a} onAreaChange={onAreaChange} />)}
      </div>
      <div style={s.tierRow}>
        <TierBtn tier="All" active={tierFilter === "All"} onTierChange={onTierChange} />
        {TIERS.map(t => <TierBtn key={t} tier={t} active={tierFilter === t} onTierChange={onTierChange} />)}
      </div>
    </div>
  );
}
