import type { Commitment, Settings } from "../types";
import { s } from "../styles";
import { CommitmentRow } from "./CommitmentRow";

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

export function CommitmentTable({ items, widths, headers, showArea, editingId, settings, onEdit, onDelete, onToggle }: Props) {
  return (
    <div style={s.tableWrap}>
      <table style={s.table}>
        <colgroup>{widths.map((w, i) => <col key={i} style={{ width: w }} />)}</colgroup>
        <thead>
          <tr>{headers.map((h, i) => <th key={i} style={{ ...s.th, width: widths[i] }}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {items.map((c, i) => (
            <CommitmentRow
              key={c.id}
              commitment={c}
              index={i}
              showArea={showArea}
              isEditing={editingId === c.id}
              settings={settings}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggle={onToggle}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
