import type { TvShow } from "../types";
import { STATUS_COLORS } from "../constants";
import { s } from "../styles";

interface Props {
  show: TvShow;
  onToggleCaughtUp: (show: TvShow) => void;
  onAdjustEpisode: (show: TvShow, delta: number) => void;
  onEdit: (show: TvShow) => void;
  onDelete: (id: number) => void;
}

export function ShowRow({ show, onToggleCaughtUp, onAdjustEpisode, onEdit, onDelete }: Props) {
  const colors = STATUS_COLORS[show.status];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 16px", background: colors.bg, borderBottom: `1px solid ${colors.border}` }}>
      <input type="checkbox" checked={show.caught_up} onChange={() => onToggleCaughtUp(show)} title="Caught up" style={{ flexShrink: 0 }} />
      {show.url
        ? <a href={show.url} target="_blank" rel="noreferrer" style={{ flex: 1, fontWeight: 500, color: colors.text, fontSize: "13px" }}>{show.name}</a>
        : <span style={{ flex: 1, fontWeight: 500, color: colors.text, fontSize: "13px" }}>{show.name}</span>}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
        <button style={s.episodeBtn} onClick={() => onAdjustEpisode(show, -1)}>−</button>
        <span style={{ fontSize: "12px", color: "#555", minWidth: "28px", textAlign: "center" }}>
          {show.episode > 0 ? show.episode : "—"}
        </span>
        <button style={s.episodeBtn} onClick={() => onAdjustEpisode(show, 1)}>+</button>
      </div>
      <div style={{ display: "flex", gap: "2px", flexShrink: 0 }}>
        <button style={s.iconBtn} title="Edit" onClick={() => onEdit(show)}>✎</button>
        <button style={{ ...s.iconBtn, color: "#e74c3c" }} title="Delete" onClick={() => onDelete(show.id)}>✕</button>
      </div>
    </div>
  );
}
