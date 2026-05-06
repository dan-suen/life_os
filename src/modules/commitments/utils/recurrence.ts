import type { Commitment } from "../types";

export function shouldRecreateWeekly(c: Commitment): boolean {
  if (c.tier !== "Weekly" || !c.completed || !c.original_deadline) return false;
  const orig = new Date(c.original_deadline);
  const now = new Date();
  const dayDiff = (orig.getDay() - now.getDay() + 7) % 7;
  const next = new Date(now);
  next.setDate(now.getDate() + (dayDiff === 0 ? 7 : dayDiff));
  return now >= next;
}

export function shouldRecreateDaily(c: Commitment): boolean {
  if (c.tier !== "Daily" || !c.completed || !c.completed_at) return false;
  return new Date(c.completed_at).toDateString() !== new Date().toDateString();
}

export function nextWeeklyDate(original: string): string {
  const orig = new Date(original);
  const now = new Date();
  const dayDiff = (orig.getDay() - now.getDay() + 7) % 7;
  const next = new Date(now);
  next.setDate(now.getDate() + (dayDiff === 0 ? 7 : dayDiff));
  return next.toISOString().split("T")[0];
}
