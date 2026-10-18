import type { AwakenType, CopyProgress, Mats, Stage, Weapon } from "./data";

export type MatCategory = "Stone" | "Quartz" | "Anima" | "Skill Points";
export const MAT_CATEGORIES: MatCategory[] = ["Stone", "Quartz", "Anima", "Skill Points"];

export function matCategory(name: string): MatCategory | null {
  if (name === "Skill Points") return "Skill Points";
  if (/Anima$/.test(name)) return "Anima";
  if (/Quartz$/.test(name)) return "Quartz";
  if (/Stone$/.test(name)) return "Stone";
  return null;
}

export const isAwakenStage = (key: string) => key.startsWith("Awaken");

/**
 * Copies to track, planned from the copies text: "Atk 2, Def 1" -> [Atk, Atk, Def],
 * "Mk II: Atk 1, Sp 1 || Unforged: Def 1" -> [Atk, Sp, Def], "3" -> 3 untyped copies.
 */
export function planCopies(copies: string): AwakenType[] {
  const typed = [...copies.matchAll(/\b(Atk|Def|Sp)\s+(\d+)/g)];
  if (typed.length) return typed.flatMap(m => Array<AwakenType>(Number(m[2])).fill(m[1] as AwakenType));
  const n = /^\s*(\d+)\s*$/.exec(copies);
  return Array<AwakenType>(n ? Number(n[1]) : 1).fill("");
}

/** Saved progress, or a fresh plan from the copies text if nothing is saved yet. */
export function copiesOf(w: Weapon): CopyProgress[] {
  if (w.progress?.length) return w.progress;
  return planCopies(w.copies).map(awaken => ({ done: [], awaken }));
}

export function addMats(into: Mats, mats: Mats) {
  for (const [k, v] of Object.entries(mats)) into[k] = (into[k] ?? 0) + v;
}

/** Materials still needed: every stage not ticked on every copy. */
export function remainingMats(w: Weapon): Mats {
  const out: Mats = {};
  for (const c of copiesOf(w)) {
    for (const st of w.stages ?? []) if (!c.done.includes(st.key)) addMats(out, st.mats);
  }
  return out;
}

/** Sorted by category (stone, quartz, anima, skill points), then name. */
export function sortedMats(mats: Mats): [string, number][] {
  const rank = (n: string) => { const c = matCategory(n); return c ? MAT_CATEGORIES.indexOf(c) : 99; };
  return Object.entries(mats).filter(([, v]) => v > 0).sort(([a], [b]) => rank(a) - rank(b) || a.localeCompare(b));
}

export const fmt = (n: number) => n.toLocaleString("en-US");

/** Stages as editable text, one per line: "4★: 200 Katana Stone, 10 Horus Omega Anima". */
export function stagesToText(stages: Stage[]): string {
  return (stages ?? []).map(s => `${s.key}: ${Object.entries(s.mats).map(([k, v]) => `${v} ${k}`).join(", ")}`).join("\n");
}

export function textToStages(text: string): Stage[] {
  return text.split("\n").map(l => l.trim()).filter(Boolean).map(line => {
    const i = line.indexOf(":");
    const key = (i < 0 ? line : line.slice(0, i)).trim();
    const mats: Mats = {};
    for (const part of (i < 0 ? "" : line.slice(i + 1)).split(",")) {
      const m = /^\s*([\d,]+)\s+(.+?)\s*$/.exec(part);
      if (m) mats[m[2]] = Number(m[1].replace(/,/g, ""));
    }
    return { key, mats };
  });
}
