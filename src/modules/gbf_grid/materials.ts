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
export function copiesOf(w: Pick<Weapon, "copies" | "progress">): CopyProgress[] {
  if (w.progress?.length) return w.progress;
  return planCopies(w.copies).map(awaken => ({ done: [], awaken }));
}

export function addMats(into: Mats, mats: Mats) {
  for (const [k, v] of Object.entries(mats)) into[k] = (into[k] ?? 0) + v;
}

/** Materials still needed: every stage not ticked on every copy. */
export function remainingMats(w: Weapon): Mats {
  const out: Mats = {};
  for (const c of copiesOf(w)) addMats(out, copyRemaining(w, c));
  return out;
}

/** Sorted by category (stone, quartz, anima, skill points), then name. */
export function sortedMats(mats: Mats): [string, number][] {
  const rank = (n: string) => { const c = matCategory(n); return c ? MAT_CATEGORIES.indexOf(c) : 99; };
  return Object.entries(mats).filter(([, v]) => v > 0).sort(([a], [b]) => rank(a) - rank(b) || a.localeCompare(b));
}

export const fmt = (n: number) => n.toLocaleString("en-US");

/** Stage order within a copy. SL caps: 0–3★ = 10, 4★ = 15, 5★ = 20, 6★ = 25. */
export const STAGE_KEYS = ["SL10", "4★", "SL15", "5★", "SL20", "6★", "SL25", "Awaken"] as const;
export const isSkillStage = (key: string) => key.startsWith("SL");
export const sortStages = (stages: Stage[]) =>
  [...stages].sort((a, b) => STAGE_KEYS.indexOf(a.key as never) - STAGE_KEYS.indexOf(b.key as never));

export const STONES = ["Sabre", "Dagger", "Spear", "Axe", "Staff", "Gun", "Melee", "Bow", "Harp", "Katana"].map(t => `${t} Stone`);
export const QUARTZ = ["Fire", "Water", "Earth", "Wind", "Light", "Dark"].map(e => `${e} Quartz`);
/** Anima options; extended as each group's data is entered (current gbf.wiki names). */
export const ANIMA = ["Horus Anima", "Horus Omega Anima"];

/**
 * Skill points per level-up, from gbf.wiki "Upgrading Weapon Skills" (points for a 100% skill up).
 * "special" = Bahamut / Seraphic / Ultima / Dark Opus / Draconic.
 */
export type SkillTable = "standard" | "special";
function levelCost(table: SkillTable, lv: number): number {
  if (table === "standard") return lv < 15 ? 200 * lv : 1000 * lv;
  return lv < 15 ? 1000 * lv : Math.floor(25000 + (lv - 15) * 5000 / 3);
}
const SL_RANGE: Record<string, [number, number]> = { SL10: [1, 10], SL15: [10, 15], SL20: [15, 20], SL25: [20, 25] };
export function skillPoints(table: SkillTable, key: string): number {
  const [from, to] = SL_RANGE[key] ?? [0, 0];
  let total = 0;
  for (let lv = from; lv < to; lv++) total += levelCost(table, lv);
  return total;
}
export function inferSkillTable(stages: Stage[]): SkillTable {
  const st = stages.find(s => isSkillStage(s.key));
  return st && st.mats["Skill Points"] === skillPoints("special", st.key) ? "special" : "standard";
}

/** Materials still needed for one copy. */
export function copyRemaining(w: Weapon, c: CopyProgress): Mats {
  const out: Mats = {};
  for (const st of w.stages ?? []) if (!c.done.includes(st.key)) addMats(out, st.mats);
  return out;
}

/** Copies text that isn't a copy plan (e.g. Proven shop prices) is shown as a note. */
export const copiesNote = (copies: string) =>
  /\b(Atk|Def|Sp)\s+\d/.test(copies) || /^\s*\d*\s*$/.test(copies) ? "" : copies;
