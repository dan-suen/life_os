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
  /** The befoulment this copy rolled (Odious). */
  bf?: CopyBf;
}

/** A rolled befoulment: type, permeation (1–6), exorcision level (1–5), and whether the copy is in the grid. */
export interface CopyBf {
  type: BefoulmentType;
  prm: number;
  exo: number;
  /** Counted against the element's budget; defaults to true. */
  grid?: boolean;
}

/** Befoulment types (gbf.wiki Befoulments). */
export type BefoulmentType = "ATK" | "DSR" | "Skill" | "DEF" | "HP" | "C.A." | "M.A." | "Turn";
export const BEFOULMENTS: BefoulmentType[] = ["DSR", "ATK", "Skill", "DEF", "HP", "C.A.", "M.A.", "Turn"];
/**
 * Per-element grid budget: the most total % of each befoulment one grid should carry
 * (C.A.-preferring setup). Types not listed (C.A., M.A., Turn) are never taken.
 * ≈ 3 DSR at Prm 3, 2 ATK at Prm 2, 2 Skill at Prm 1 / 1 at Prm 3, 1 DEF at Prm 2, 1 HP at Prm 1 (all exorcised to Lvl 5).
 */
export const BF_CAP: Partial<Record<BefoulmentType, number>> = { DSR: 24, ATK: 12, Skill: 28, DEF: 13, HP: 14 };
/** Worst permeation worth keeping on any single piece, so one bad roll can't eat a whole budget. */
export const BF_PIECE_MAX_PRM: Partial<Record<BefoulmentType, number>> = { DSR: 4, ATK: 3, Skill: 3, DEF: 2, HP: 1 };
const BF_RANGE: Record<BefoulmentType, [number, number]> = {
  ATK: [6, 16], DSR: [6, 16], Turn: [6, 16], DEF: [13, 33], "M.A.": [10, 25], Skill: [22, 50], "C.A.": [22, 50], HP: [22, 50],
};
const BF_EXO_AVG: Record<BefoulmentType, number> = {
  ATK: 0.6, DSR: 0.6, Turn: 0.6, DEF: 1.2, "M.A.": 1.0, Skill: 2.0, "C.A.": 2.0, HP: 2.0,
};
/**
 * Estimated befoulment % at a permeation, after exorcising to `exo` (1–5). gbf.wiki gives the Prm 1 and
 * Prm 6 Lvl-1 values; steps between are interpolated, and exorcision uses the average reduction roll.
 */
export function bfValue(t: BefoulmentType, prm: number, exo = 5): number {
  const [lo, hi] = BF_RANGE[t];
  return Math.max(0, lo + (hi - lo) * (prm - 1) / 5 - BF_EXO_AVG[t] * (exo - 1));
}

/** Worst permeation (up to the per-piece cap) whose value at `exo` still fits in `room` %, or 0 if none does. */
export function maxPrmFitting(t: BefoulmentType, room: number, exo = 5): number {
  let best = 0;
  for (let p = 1; p <= (BF_PIECE_MAX_PRM[t] ?? 0); p++) if (bfValue(t, p, exo) <= room + 1e-9) best = p;
  return best;
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
  "Evokers",
  "Eternals",
  "Origin Classes",
];

/** Character/class groups: element, rank and copies are kept in the data but not shown. */
export const CHARACTER_GROUPS: string[] = ["Evokers", "Eternals", "Origin Classes"];

export const defaultWeaponForm = (source: string): Omit<Weapon, "id"> => ({
  element: "Fire", name: "", rank: "", copies: "", source, stages: [], progress: [],
});
