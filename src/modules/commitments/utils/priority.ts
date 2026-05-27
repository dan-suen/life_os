import type { Impact, Effort, Energy, Commitment, Settings } from "../types";

const IMPACT_SCORE: Record<Impact, number> = { Low: 2, Medium: 5, High: 10 };
const EFFORT_SCORE: Record<Effort, number> = { Low: 10, Medium: 5, High: 2 };
const ENERGY_MATCH: Record<Energy, Record<Energy, number>> = {
  Low:    { Low: 1.3, Medium: 1.0, High: 0.7 },
  Medium: { Low: 1.0, Medium: 1.3, High: 1.0 },
  High:   { Low: 0.7, Medium: 1.0, High: 1.3 },
};

export function urgencyScore(deadline: string | null): number {
  if (!deadline) return 0;
  const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
  if (days <= 0) return 10;
  if (days <= 3) return 8;
  if (days <= 7) return 6;
  if (days <= 14) return 4;
  if (days <= 30) return 2;
  return 0;
}

export function calcPriority(c: Commitment, settings: Settings): number {
  if (c.tier === "Urgent" || c.tier === "Daily" || c.tier === "Weekly" || c.tier === "Non-Priority") return 0;
  const { impact, effort, urgency } = settings.weights;
  const energyMult = ENERGY_MATCH[settings.currentEnergy][c.energy];
  const base =
    IMPACT_SCORE[c.impact] * impact +
    EFFORT_SCORE[c.effort] * effort +
    urgencyScore(c.deadline) * urgency;
  return Math.round(base * energyMult * 10) / 10;
}

export function calcRecommendationScore(c: Commitment, settings: Settings): number {
  if (c.completed) return -1;
  let score = 0;
  if (c.tier === "Urgent") score += 10000;
  else if (c.tier === "Daily") score += 5000;
  else if (c.tier === "Weekly") score += 3000;
  else if (c.tier === "Non-Priority") return -1;
  else score += calcPriority(c, settings) * 10;
  if (c.deadline) {
    const days = Math.ceil((new Date(c.deadline).getTime() - Date.now()) / 86400000);
    if (days <= 0) score += 4000 + Math.abs(days) * 50;
    else if (days <= 3) score += 2000;
    else if (days <= 7) score += 1000;
    else if (days <= 14) score += 400;
  }
  return score;
}
