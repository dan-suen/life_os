import type { TvShow, Day } from "../types";
import { DAY_MAP } from "../types";

function parseCSVLine(line: string): string[] {
  const cells: string[] = [];
  let i = 0;
  while (i < line.length) {
    if (line[i] === '"') {
      const end = line.indexOf('"', i + 1);
      cells.push(end === -1 ? line.slice(i + 1) : line.slice(i + 1, end));
      i = end === -1 ? line.length : end + 2;
    } else {
      const end = line.indexOf(',', i);
      if (end === -1) { cells.push(line.slice(i).trim()); break; }
      cells.push(line.slice(i, end).trim());
      i = end + 1;
    }
  }
  return cells;
}

export function parseShowsFromCSV(text: string): Omit<TvShow, "id">[] {
  const lines = text.replace(/\r/g, "").split("\n").filter(l => l.trim());
  const shows: Omit<TvShow, "id">[] = [];
  let currentDay: Day = "Other";

  for (const line of lines) {
    const [col_a, col_b, col_c, col_d] = parseCSVLine(line);
    const name = col_b?.trim();
    if (!name) continue;
    const dayRaw = col_a?.trim();
    if (dayRaw) currentDay = DAY_MAP[dayRaw] ?? "Other";
    shows.push({
      name,
      air_day: currentDay,
      episode: parseInt(col_d) || 0,
      caught_up: col_c?.toUpperCase() === "TRUE",
      status: "Watching",
      type: "Series",
      url: null,
      poster: null,
    });
  }

  return shows;
}
