import { useState } from "react";
import type { TvShow } from "../types";
import { parseShowsFromCSV } from "../utils/csv";
import { s } from "../styles";

interface Props {
  saving: boolean;
  onImport: (shows: Omit<TvShow, "id">[], overwrite: boolean) => void;
  onCancel: () => void;
}

export function ImportPanel({ saving, onImport, onCancel }: Props) {
  const [parsed, setParsed] = useState<Omit<TvShow, "id">[] | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [overwrite, setOverwrite] = useState(false);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setParseError(null);
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const shows = parseShowsFromCSV(ev.target?.result as string);
        if (shows.length === 0) { setParseError("No shows found in file."); return; }
        setParsed(shows);
      } catch {
        setParseError("Failed to parse file. Make sure it's a valid CSV.");
      }
    };
    reader.readAsText(file);
  }

  return (
    <div style={{ background: "#f0f4ff", border: "1px solid #c6d3f5", borderRadius: "8px", padding: "16px", marginBottom: "12px" }}>
      <div style={{ fontSize: "12px", fontWeight: 600, color: "#2253c7", marginBottom: "12px" }}>Import from CSV</div>
      {!parsed ? (
        <>
          <p style={{ fontSize: "12px", color: "#555", margin: "0 0 12px" }}>
            Export your Google Sheet as CSV (File → Download → CSV). Expects columns: A=Day, B=Name, C=Caught up, D=Episode.
          </p>
          <input type="file" accept=".csv" onChange={handleFile} style={{ fontSize: "13px" }} />
          {parseError && <div style={{ color: "#c0392b", fontSize: "12px", marginTop: "8px" }}>{parseError}</div>}
          <div style={{ marginTop: "12px" }}>
            <button style={s.btn("#555", "#f5f5f5", "#e0e0e0")} onClick={onCancel}>Cancel</button>
          </div>
        </>
      ) : (
        <>
          <p style={{ fontSize: "12px", color: "#555", margin: "0 0 12px" }}>
            Found <strong>{parsed.length}</strong> shows ready to import.
          </p>
          <div style={{ display: "flex", gap: "16px", marginBottom: "12px" }}>
            <label style={{ fontSize: "12px", color: "#555", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
              <input type="radio" checked={!overwrite} onChange={() => setOverwrite(false)} /> Append to existing
            </label>
            <label style={{ fontSize: "12px", color: overwrite ? "#c0392b" : "#555", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
              <input type="radio" checked={overwrite} onChange={() => setOverwrite(true)} /> Overwrite all
            </label>
          </div>
          {overwrite && (
            <div style={{ fontSize: "12px", color: "#c0392b", background: "#fff0f0", border: "1px solid #f5c6c6", borderRadius: "4px", padding: "8px 10px", marginBottom: "12px" }}>
              ⚠ This will delete all existing shows before importing.
            </div>
          )}
          <div style={{ display: "flex", gap: "8px" }}>
            <button style={s.btn("#fff", overwrite ? "#c0392b" : "#2253c7", overwrite ? "#c0392b" : "#2253c7")} disabled={saving} onClick={() => onImport(parsed, overwrite)}>
              {overwrite ? "Overwrite" : "Append"} {parsed.length} shows
            </button>
            <button style={s.btn("#555", "#f5f5f5", "#e0e0e0")} onClick={() => setParsed(null)}>Back</button>
            <button style={s.btn("#555", "#f5f5f5", "#e0e0e0")} onClick={onCancel}>Cancel</button>
          </div>
        </>
      )}
    </div>
  );
}
