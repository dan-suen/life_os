export function formatDate(d: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-CA", { month: "short", day: "numeric" });
}

export function daysLabel(d: string | null): { text: string; color: string } {
  if (!d) return { text: "", color: "#888" };
  const days = Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
  if (days < 0) return { text: `${Math.abs(days)}d overdue`, color: "#c0392b" };
  if (days === 0) return { text: "Today", color: "#c0392b" };
  if (days <= 3) return { text: `${days}d`, color: "#e67e22" };
  if (days <= 7) return { text: `${days}d`, color: "#b07d00" };
  return { text: `${days}d`, color: "#888" };
}
