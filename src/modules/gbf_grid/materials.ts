import type { AwakenType, CopyProgress, Mats, Stage, Weapon } from "./data";

export type MatCategory = "Weapon Copy" | "Stone" | "Quartz" | "Anima" | "Pendant" | "Luster" | "Star Fragment" | "New World Quartz" | "Gold Brick" | "Eternity Sand";
export const MAT_CATEGORIES: MatCategory[] = ["Weapon Copy", "Stone", "Quartz", "Anima", "Pendant", "Luster", "Star Fragment", "New World Quartz", "Gold Brick", "Eternity Sand"];
/** Single-item categories: the category name is the material name. "Weapon Copy" = a duplicate fed in for a 1★–3★ uncap. */
const SINGLE: MatCategory[] = ["Weapon Copy", "New World Quartz", "Gold Brick", "Eternity Sand"];

export function matCategory(name: string): MatCategory | null {
  if (SINGLE.includes(name as MatCategory)) return name as MatCategory;
  if (/Anima$/.test(name)) return "Anima";
  if (/Luster$/.test(name)) return "Luster";
  if (STAR_FRAGMENTS.includes(name)) return "Star Fragment";
  if (/Pendants?$/.test(name)) return "Pendant";
  if (QUARTZ.includes(name)) return "Quartz";  // element quartz only, not e.g. New World Quartz
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

/** Sorted by category (MAT_CATEGORIES order), then name; uncategorised (group-specific) keep their order. */
export function sortedMats(mats: Mats): [string, number][] {
  const rank = (n: string) => { const c = matCategory(n); return c ? MAT_CATEGORIES.indexOf(c) : 99; };
  return Object.entries(mats).filter(([, v]) => v > 0).sort(([a], [b]) => rank(a) - rank(b) || (rank(a) < 99 ? a.localeCompare(b) : 0));
}

export const fmt = (n: number) => n.toLocaleString("en-US");

/** Stage order within a copy. 0★ = obtaining the copy itself; Craft = forging from a base weapon (e.g. Atma → Ultima); T1–T5 = transcendence stages. "Skill" = skill fully levelled (a toggle, no materials tracked). */
export const STAGE_KEYS = ["0★", "Craft", "1★", "2★", "3★", "4★", "5★", "6★", "T1", "T2", "T3", "T4", "T5", "Skill", "Awaken"] as const;
export const isSkillStage = (key: string) => key === "Skill";
export const sortStages = (stages: Stage[]) =>
  [...stages].sort((a, b) => STAGE_KEYS.indexOf(a.key as never) - STAGE_KEYS.indexOf(b.key as never));

export const STONES = ["Sword", "Dagger", "Spear", "Axe", "Staff", "Pistol", "Melee", "Bow", "Harp", "Katana"].map(t => `${t} Stone`);
export const QUARTZ = ["Fire", "Water", "Earth", "Wind", "Light", "Dark"].map(e => `${e} Quartz`);
/** Anima options; extended as each group's data is entered (current gbf.wiki names). */
export const STAR_FRAGMENTS = ["One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"].map(n => `${n}-Star Fragment`);
export const LUSTERS = ["Ignis", "Aqua", "Terra", "Ventus"].map(e => `${e} Luster`);
/** Pendant costs, e.g. awakening hammers bought at 50 pendants each. */
export const PENDANTS = ["Pendants"];
export const ANIMA = [
  "Horus Anima", "Horus Omega Anima",
  "Metatron Omega Anima", "Michael Anima", "Raphael Anima",
  "Credo Omega Anima", "Luminiera Omega Anima",
  "Qilin Omega Anima", "Huanglong Omega Anima",
  "Uriel Anima", "Gabriel Anima",
  "Shiva Omega Anima", "Grimnir Omega Anima", "Europa Omega Anima", "Alexiel Omega Anima", "Avatar Omega Anima",
  "Astaroth Anima",
];

/** Uncaps are sequential: ticking 5★ also ticks lower uncaps, unticking 4★ also unticks 5★/6★. Skill/Awaken are independent. */
const UNCAPS = ["0★", "Craft", "1★", "2★", "3★", "4★", "5★", "6★", "T1", "T2", "T3", "T4", "T5"];
export function toggleStage(done: string[], key: string): string[] {
  const tier = UNCAPS.indexOf(key);
  if (done.includes(key)) {
    const drop = tier < 0 ? [key] : UNCAPS.slice(tier);
    return done.filter(k => !drop.includes(k));
  }
  const add = tier < 0 ? [key] : UNCAPS.slice(0, tier + 1);
  return [...done, ...add.filter(k => !done.includes(k))];
}

/** Group-specific materials still needed for one copy (from gbf_weapon_extra_mats). */
export function copyRemainingExtra(w: Weapon, c: CopyProgress): Mats {
  const out: Mats = {};
  for (const st of w.stages ?? []) if (!c.done.includes(st.key)) addMats(out, w.extras?.[st.key] ?? {});
  return out;
}

export function remainingExtra(w: Weapon): Mats {
  const out: Mats = {};
  for (const c of copiesOf(w)) addMats(out, copyRemainingExtra(w, c));
  return out;
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
