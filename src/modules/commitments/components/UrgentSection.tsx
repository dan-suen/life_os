import type { Commitment, Settings } from "../types";
import { s } from "../styles";
import { CommitmentTable } from "./CommitmentTable";

interface Props {
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

export function UrgentSection({ items, widths, headers, showArea, editingId, settings, onEdit, onDelete, onToggle }: Props) {
  return (
    <div style={{ ...s.section, borderColor: "#f5c6c6" }}>
      <div style={{ ...s.sectionHeader, background: "#fff8f8" }}>
        <span style={{ ...s.sectionTitle, color: "#c0392b" }}>🔴 Urgent</span>
        <span style={{ fontSize: "11px", color: "#c0392b" }}>{items.filter(c => !c.completed).length} active</span>
      </div>
      <CommitmentTable items={items} widths={widths} headers={headers} showArea={showArea}
        editingId={editingId} settings={settings} onEdit={onEdit} onDelete={onDelete} onToggle={onToggle} />
    </div>
  );
}
