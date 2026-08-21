export type Category = "Core" | "Universal" | "Additional" | "Niche" | "Premium";
export type Element = "Fire" | "Wind" | "Water" | "Earth" | "Light" | "Dark";

export interface Weapon {
  id: number;
  element: Element;
  category: Category;
  name: string;
  rank: string;
  copies: string;
  source: string;
}

export const ELEMENT_META: Record<Element, { boss: string; color: string; bg: string }> = {
  Fire:  { boss: "Colossus",  color: "#c0392b", bg: "#fff0ee" },
  Wind:  { boss: "Tiamat",   color: "#27ae60", bg: "#f0fdf4" },
  Water: { boss: "Leviathan",color: "#2980b9", bg: "#eff6ff" },
  Earth: { boss: "Yggdrasil",color: "#8b5e3c", bg: "#fdf6ee" },
  Light: { boss: "Luminiera",color: "#b8860b", bg: "#fffbe6" },
  Dark:  { boss: "Celeste",  color: "#6b21a8", bg: "#faf5ff" },
};

export const ELEMENTS: Element[] = ["Fire", "Wind", "Water", "Earth", "Light", "Dark"];
export const CATEGORIES: Category[] = ["Core", "Universal", "Additional", "Niche", "Premium"];

export const defaultWeaponForm = (element: Element, category: Category): Omit<Weapon, "id"> => ({
  element, category, name: "", rank: "", copies: "", source: "",
});
