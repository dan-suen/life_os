import type { Area, Commitment, Settings } from "../types";
import { AREA_COLORS } from "../constants";
import { s } from "../styles";
import { CommitmentTable } from "./CommitmentTable";

interface Props {
  area: Area;
  items: Commitment[];
  widths: string[];
  headers: string[];
  showArea: boolean;
  editingId: number | null;
  settings: Settings;
  onEdit: (c: Commitment) => void;
  onDelete: (id: number) => void;
  onToggle: (c: Commitment) => void;
}

export function AreaSection({ area, items, widths, headers, showArea, editingId, settings, onEdit, onDelete, onToggle }: Props) {
  const areaColor = AREA_COLORS[area];
  return (
    <div style={{ ...s.section, borderTop: `3px solid ${areaColor}` }}>
      {!showArea && (
        <div style={s.sectionHeader}>
          <span style={{ ...s.sectionTitle, color: areaColor }}>{area}</span>
          <span style={{ fontSize: "11px", color: "#888" }}>{items.filter(c => !c.completed).length} active · {items.filter(c => c.completed).length} complete</span>
        </div>
      )}
      <CommitmentTable items={items} widths={widths} headers={headers} showArea={showArea}
        editingId={editingId} settings={settings} onEdit={onEdit} onDelete={onDelete} onToggle={onToggle} />
    </div>
  );
}
