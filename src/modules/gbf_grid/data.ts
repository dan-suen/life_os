export type Category = "Core" | "Additional" | "Niche";

export interface Weapon {
  name: string;
  rank: string;
  copies: string;
  source: string;
  category: Category;
}

export const WEAPONS: Weapon[] = [
  // Core
  { category: "Core", name: "Colossus Cane Ira",      rank: "151", copies: "3–4",  source: "Omega Rebirth" },
  { category: "Core", name: "Colossus Bomber Ira",    rank: "151", copies: "2",    source: "Omega Rebirth" },
  { category: "Core", name: "Nilakantha",             rank: "120", copies: "1–2",  source: "Regalia" },
  { category: "Core", name: "Exo Maitrah Karuna",     rank: "—",   copies: "0–1",  source: "" },
  { category: "Core", name: "Scythe of Renunciation", rank: "120", copies: "1",    source: "" },
  { category: "Core", name: "Doombringer Sword",      rank: "300", copies: "1",    source: "" },

  // Additional
  { category: "Additional", name: "Sol Remnant",                        rank: "—",   copies: "1",    source: "" },
  { category: "Additional", name: "Demonspear of Prosperity Verboten",  rank: "151", copies: "2–3",  source: "Odious" },
  { category: "Additional", name: "Blazefist of Prosperity Verboten",   rank: "151", copies: "1–2",  source: "Odious" },
  { category: "Additional", name: "Sword of Pallas Militis",            rank: "—",   copies: "1",    source: "" },
  { category: "Additional", name: "Mortality Bow",                      rank: "200", copies: "1",    source: "" },
  { category: "Additional", name: "Refrain of Blazing Vigor",           rank: "200", copies: "1",    source: "" },

  // Niche
  { category: "Niche", name: "Deathcannon of Prosperity Verboten", rank: "151", copies: "1–2",  source: "Odious" },
  { category: "Niche", name: "Extinction Blade",                   rank: "200", copies: "1–2",  source: "" },
  { category: "Niche", name: "Benbenet",                           rank: "120", copies: "1–2",  source: "Ennead" },
  { category: "Niche", name: "Al-Abad",                            rank: "120", copies: "0–1",  source: "Ennead" },
  { category: "Niche", name: "Colossus Buster Ira",                rank: "151", copies: "1–2",  source: "Omega Rebirth" },
  { category: "Niche", name: "Exo Krodha",                         rank: "—",   copies: "0–1",  source: "" },
  { category: "Niche", name: "Heat of The Sun",                    rank: "—",   copies: "—",    source: "" },
  { category: "Niche", name: "Kiss of The Devil",                  rank: "—",   copies: "—",    source: "" },
  { category: "Niche", name: "Wrathfire Militis",                  rank: "—",   copies: "1",    source: "" },
  { category: "Niche", name: "Garnet Broadaxe",                    rank: "—",   copies: "—",    source: "" },
  { category: "Niche", name: "Draconic Harp",                      rank: "151", copies: "1",    source: "" },
  { category: "Niche", name: "Bahamut Weapons",                    rank: "130", copies: "1",    source: "" },
];
