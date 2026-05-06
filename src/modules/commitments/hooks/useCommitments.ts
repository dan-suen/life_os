import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import type { Commitment } from "../types";
import { shouldRecreateWeekly, shouldRecreateDaily, nextWeeklyDate } from "../utils/recurrence";

export function useCommitments() {
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data, error: loadError } = await supabase.from("commitments").select("*").order("id");
      if (loadError) { setError(loadError.message); setLoading(false); return; }
      const items = (data ?? []) as Commitment[];
      for (const c of items) {
        if (shouldRecreateWeekly(c)) {
          const next = nextWeeklyDate(c.original_deadline!);
          const { data: exists } = await supabase.from("commitments").select("id")
            .eq("name", c.name).eq("area", c.area).eq("tier", "Weekly").eq("completed", false);
          if (!exists || exists.length === 0) {
            await supabase.from("commitments").insert([{
              name: c.name, area: c.area, tier: "Weekly",
              effort: c.effort, impact: c.impact, energy: c.energy,
              deadline: next, completed: false, completed_at: null,
              original_deadline: c.original_deadline, note: c.note,
            }]);
          }
        }
        if (shouldRecreateDaily(c)) {
          const { data: exists } = await supabase.from("commitments").select("id")
            .eq("name", c.name).eq("area", c.area).eq("tier", "Daily").eq("completed", false);
          if (!exists || exists.length === 0) {
            await supabase.from("commitments").insert([{
              name: c.name, area: c.area, tier: "Daily",
              effort: c.effort, impact: c.impact, energy: c.energy,
              deadline: null, completed: false, completed_at: null,
              original_deadline: null, note: c.note,
            }]);
          }
        }
      }
      const { data: fresh } = await supabase.from("commitments").select("*").order("id");
      setCommitments((fresh ?? []) as Commitment[]);
      setLoading(false);
    }
    load();
  }, []);

  async function add(form: Omit<Commitment, "id">): Promise<boolean> {
    setSaving(true);
    const payload = { ...form, original_deadline: form.tier === "Weekly" ? form.deadline : null };
    const { data, error: addError } = await supabase.from("commitments").insert([payload]).select().single();
    if (addError) { setError(addError.message); setSaving(false); return false; }
    setCommitments(p => [...p, data as Commitment]);
    setSaving(false);
    return true;
  }

  async function update(form: Commitment): Promise<boolean> {
    setSaving(true);
    const { error: updateError } = await supabase.from("commitments").update({
      name: form.name, area: form.area, tier: form.tier,
      effort: form.effort, impact: form.impact, energy: form.energy,
      deadline: form.deadline, note: form.note,
      original_deadline: form.tier === "Weekly" ? (form.original_deadline || form.deadline) : null,
    }).eq("id", form.id);
    if (updateError) { setError(updateError.message); setSaving(false); return false; }
    setCommitments(p => p.map(c => c.id === form.id ? form : c));
    setSaving(false);
    return true;
  }

  async function remove(id: number) {
    setSaving(true);
    const { error: removeError } = await supabase.from("commitments").delete().eq("id", id);
    if (removeError) setError(removeError.message);
    else setCommitments(p => p.filter(c => c.id !== id));
    setSaving(false);
  }

  async function toggleComplete(c: Commitment) {
    const now = new Date().toISOString();
    const completed = !c.completed;
    const { error: toggleError } = await supabase.from("commitments").update({
      completed, completed_at: completed ? now : null,
    }).eq("id", c.id);
    if (toggleError) setError(toggleError.message);
    else setCommitments(p => p.map(x => x.id === c.id ? { ...x, completed, completed_at: completed ? now : null } : x));
  }

  async function removeAllComplete() {
    const ids = commitments.filter(c => c.completed && c.tier !== "Weekly" && c.tier !== "Daily").map(c => c.id);
    if (ids.length === 0) return;
    setSaving(true);
    const { error: removeError } = await supabase.from("commitments").delete().in("id", ids);
    if (removeError) setError(removeError.message);
    else setCommitments(p => p.filter(c => !ids.includes(c.id)));
    setSaving(false);
  }

  return { commitments, loading, saving, error, setError, add, update, remove, toggleComplete, removeAllComplete };
}
