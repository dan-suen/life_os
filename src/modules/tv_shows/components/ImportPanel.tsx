import { useState } from "react";
import type { TvShow } from "../types";
import { parseShowsFromCSV } from "../utils/csv";
import { searchMalByName } from "../utils/mal";
import { s } from "../styles";

interface Props {
  saving: boolean;
  onImport: (shows: Omit<TvShow, "id">[], overwrite: boolean) => void;
  onCancel: () => void;
}

export function ImportPanel({ saving, onImport, onCancel }: Props) {
  const [parsed, setParsed] = useState<Omit<TvShow, "id">[] | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [enriching, setEnriching] = useState(false);
  const [enrichProgress, setEnrichProgress] = useState(0);
  const [overwrite, setOverwrite] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setParseError(null);
    const reader = new FileReader();
    reader.onload = async ev => {
      try {
        const raw = parseShowsFromCSV(ev.target?.result as string);
        if (raw.length === 0) { setParseError("No shows found in file."); return; }

        setEnriching(true);
        setEnrichProgress(0);
        const enriched: Omit<TvShow, "id">[] = [];
        for (let i = 0; i < raw.length; i++) {
          const show = raw[i];
          const info = await searchMalByName(show.name);
          enriched.push(info
            ? { ...show, name: info.name, type: info.type, status: info.status, url: info.url, poster: info.poster }
            : show
          );
          setEnrichProgress(i + 1);
          if (i < raw.length - 1) await new Promise(r => setTimeout(r, 350));
        }
        setEnriching(false);
        setParsed(enriched);
      } catch {
        setEnriching(false);
        setParseError("Failed to parse file. Make sure it's a valid CSV.");
      }
    };
    reader.readAsText(file);
  }

  const malMatched = parsed?.filter(s => s.url).length ?? 0;

  return (
    <div style={{ background: "#f0f4ff", border: "1px solid #c6d3f5", borderRadius: "8px", padding: "16px", marginBottom: "12px" }}>
      <div style={{ fontSize: "12px", fontWeight: 600, color: "#2253c7", marginBottom: "12px" }}>Import from CSV</div>
      {!parsed && !enriching ? (
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
      ) : enriching ? (
        <div style={{ fontSize: "12px", color: "#555" }}>
          Fetching MAL info ({enrichProgress} / {enrichProgress > 0 ? "?" : "…"})…
          <div style={{ marginTop: "8px", height: "4px", background: "#e0e0e0", borderRadius: "2px" }}>
            <div style={{ height: "100%", background: "#2253c7", borderRadius: "2px", width: `${Math.min(100, enrichProgress * 5)}%`, transition: "width 0.3s" }} />
          </div>
        </div>
      ) : (
        <>
          <p style={{ fontSize: "12px", color: "#555", margin: "0 0 4px" }}>
            Found <strong>{parsed!.length}</strong> shows — <strong>{malMatched}</strong> matched on MAL.
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
            <button style={s.btn("#fff", overwrite ? "#c0392b" : "#2253c7", overwrite ? "#c0392b" : "#2253c7")} disabled={saving} onClick={() => onImport(parsed!, overwrite)}>
              {overwrite ? "Overwrite" : "Append"} {parsed!.length} shows
            </button>
            <button style={s.btn("#555", "#f5f5f5", "#e0e0e0")} onClick={() => setParsed(null)}>Back</button>
            <button style={s.btn("#555", "#f5f5f5", "#e0e0e0")} onClick={onCancel}>Cancel</button>
          </div>
        </>
      )}
    </div>
  );
}
