import type { MediaType, Status } from "../types";

function typeFromMal(malType: string): MediaType {
  if (malType === "Movie") return "Movie";
  if (malType === "OVA" || malType === "ONA" || malType === "Special") return "OVA";
  return "Series";
}

function statusFromMal(malStatus: string): Status {
  if (malStatus === "Currently Airing") return "Watching";
  if (malStatus === "Not yet aired") return "Unstarted";
  return "Carryover";
}

function formatName(english: string | null, romaji: string): string {
  if (!english || english === romaji) return romaji;
  return `${english} / ${romaji}`;
}

export interface MalInfo {
  name: string;
  type: MediaType;
  status: Status;
  url: string;
}

export async function fetchMalByUrl(url: string): Promise<MalInfo | null> {
  const match = url.match(/myanimelist\.net\/anime\/(\d+)/);
  if (!match) return null;
  try {
    const res = await fetch(`https://api.jikan.moe/v4/anime/${match[1]}`);
    if (!res.ok) return null;
    const { data } = await res.json();
    return {
      name: formatName(data.title_english, data.title),
      type: typeFromMal(data.type),
      status: statusFromMal(data.status),
      url,
    };
  } catch { return null; }
}

export async function searchMalByName(query: string): Promise<MalInfo | null> {
  try {
    const res = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=1`);
    if (!res.ok) return null;
    const { data } = await res.json();
    if (!data?.length) return null;
    const item = data[0];
    return {
      name: formatName(item.title_english, item.title),
      type: typeFromMal(item.type),
      status: statusFromMal(item.status),
      url: item.url,
    };
  } catch { return null; }
}
