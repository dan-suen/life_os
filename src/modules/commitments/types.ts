export const AREAS = ["Work / Career", "Health & Fitness", "Personal Projects & Hobbies", "Finances"] as const;
export const TIERS = ["Urgent", "Daily", "Weekly", "High Priority", "Normal", "Non-Priority"] as const;
export const EFFORTS = ["Low", "Medium", "High"] as const;
export const IMPACTS = ["Low", "Medium", "High"] as const;
export const ENERGIES = ["Low", "Medium", "High"] as const;

export type Area = typeof AREAS[number];
export type AreaFilter = Area | "All" | "Today's Focus" | "Recommendations";
export type Tier = typeof TIERS[number];
export type Effort = typeof EFFORTS[number];
export type Impact = typeof IMPACTS[number];
export type Energy = typeof ENERGIES[number];

export interface Commitment {
  id: number;
  name: string;
  area: Area;
  tier: Tier;
  effort: Effort;
  impact: Impact;
  energy: Energy;
  deadline: string | null;
  completed: boolean;
  completed_at: string | null;
  original_deadline: string | null;
  note: string;
}

export interface Settings {
  topN: Record<Area, number>;
  weights: { impact: number; effort: number; urgency: number };
  currentEnergy: Energy;
}

export const defaultForm = (): Omit<Commitment, "id"> => ({
  name: "", area: AREAS[0], tier: "Normal", effort: "Medium",
  impact: "Medium", energy: "Medium", deadline: null,
  completed: false, completed_at: null, original_deadline: null, note: "",
});
