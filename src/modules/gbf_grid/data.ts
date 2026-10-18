export type Element = "Fire" | "Wind" | "Water" | "Earth" | "Light" | "Dark" | "Any";

export type AwakenType = "Atk" | "Def" | "Sp" | "C.A." | "Skill DMG" | "";
export const AWAKEN_TYPES: AwakenType[] = ["", "Atk", "Def", "Sp", "C.A.", "Skill DMG"];

/** Material name -> amount, e.g. { "Katana Stone": 200, "Light Quartz": 200 }. */
export type Mats = Record<string, number>;

/** One upgrade step every copy goes through. Stages whose key starts with "Awaken" are awakening. */
export interface Stage {
  key: string;
  mats: Mats;
}

/** Progress of a single copy: which stage keys are done, its awakening type, and stages it doesn't need. */
export interface CopyProgress {
  done: string[];
  awaken: AwakenType;
  /** Stage keys this copy skips, e.g. "Forge" on an unforged Revans copy. */
  skip?: string[];
}

/** Befoulment types (gbf.wiki Befoulments). */
export type BefoulmentType = "ATK" | "DSR" | "Skill" | "DEF" | "HP" | "C.A." | "M.A." | "Turn";
export const BEFOULMENTS: BefoulmentType[] = ["DSR", "ATK", "Skill", "DEF", "HP", "C.A.", "M.A.", "Turn"];
/**
 * Befoulment budget for any deployed grid (C.A.-preferring setup). Values are gbf.wiki Lvl-1 ranges
 * (Prm 1 → Prm 6), linearly interpolated, minus the average Lvl-5 exorcision reduction.
 * maxPrm: worst permeation worth keeping on a piece; maxInGrid: how many the grid can carry.
 * Types not listed here (C.A., M.A., Turn) are never taken.
 */
export const BF_BUDGET: Partial<Record<BefoulmentType, { maxPrm: number; maxInGrid: number; note?: string }>> = {
  DSR:   { maxPrm: 3, maxInGrid: 3 },
  ATK:   { maxPrm: 2, maxInGrid: 2 },
  Skill: { maxPrm: 3, maxInGrid: 2, note: "2 only if both Prm 1, otherwise 1" },
  DEF:   { maxPrm: 2, maxInGrid: 1 },
  HP:    { maxPrm: 1, maxInGrid: 1 },
};
const BF_RANGE: Record<BefoulmentType, [number, number]> = {
  ATK: [6, 16], DSR: [6, 16], Turn: [6, 16], DEF: [13, 33], "M.A.": [10, 25], Skill: [22, 50], "C.A.": [22, 50], HP: [22, 50],
};
const BF_EXO_AVG: Record<BefoulmentType, number> = {
  ATK: 0.6, DSR: 0.6, Turn: 0.6, DEF: 1.2, "M.A.": 1.0, Skill: 2.0, "C.A.": 2.0, HP: 2.0,
};
/** Estimated befoulment % at a permeation, after exorcising to `exo` (1–5). */
export function bfValue(t: BefoulmentType, prm: number, exo = 5): number {
  const [lo, hi] = BF_RANGE[t];
  return Math.max(0, lo + (hi - lo) * (prm - 1) / 5 - BF_EXO_AVG[t] * (exo - 1));
}

/** Weapon-level befoulment notes: BF types that undercut this weapon's own skills. */
export interface BefoulmentInfo {
  avoid?: BefoulmentType[];
}

export interface Weapon {
  id: number;
  element: Element;
  name: string;
  rank: string;
  copies: string;
  source: string;
  stages: Stage[];
  progress: CopyProgress[];
  /** Group-specific materials per stage key, joined from gbf_weapon_extra_mats (read-only here). */
  extras?: Record<string, Mats>;
  befoulment?: BefoulmentInfo;
}

export const ELEMENT_META: Record<Element, { boss: string; color: string; bg: string }> = {
  Fire:  { boss: "Colossus",  color: "#c0392b", bg: "#fff0ee" },
  Wind:  { boss: "Tiamat",    color: "#27ae60", bg: "#f0fdf4" },
  Water: { boss: "Leviathan", color: "#2980b9", bg: "#eff6ff" },
  Earth: { boss: "Yggdrasil", color: "#8b5e3c", bg: "#fdf6ee" },
  Light: { boss: "Luminiera", color: "#b8860b", bg: "#fffbe6" },
  Dark:  { boss: "Celeste",   color: "#6b21a8", bg: "#faf5ff" },
  Any:   { boss: "",          color: "#555",    bg: "#f4f4f4" },
};

export const ELEMENTS: Element[] = ["Fire", "Wind", "Water", "Earth", "Light", "Dark", "Any"];

/** Weapon groups, ordered roughly by where/how they're obtained. */
export const GROUPS: string[] = [
  "Omega Rebirth",
  "Dark Opus",
  "Destroyer",
  "Ultima",
  "Bahamut",
  "World",
  "Celestial",
  "Draconic",
  "Odious",
  "Revans",
  "Regalia",
  "Ennead",
  "Ancestral",
  "Menace",
  "Primal",
  "Omega",
  "Exo",
  "Militis",
  "New World Foundation",
  "Proven",
  "Beast",
  "Astral",
  "Premium",
];

export const defaultWeaponForm = (source: string): Omit<Weapon, "id"> => ({
  element: "Fire", name: "", rank: "", copies: "", source, stages: [], progress: [],
});
