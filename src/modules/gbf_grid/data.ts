export type Element = "Fire" | "Wind" | "Water" | "Earth" | "Light" | "Dark" | "Any";

export interface Weapon {
  id: number;
  element: Element;
  name: string;
  rank: string;
  copies: string;
  source: string;
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
  element: "Fire", name: "", rank: "", copies: "", source,
});
