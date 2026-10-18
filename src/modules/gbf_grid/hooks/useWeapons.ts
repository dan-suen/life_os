import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import type { CopyProgress, Mats, Weapon } from "../data";

const COLS = "id,element,name,rank,copies,source,stages,progress";
// Group-specific materials live in a side table, embedded through the weapon_id foreign key.
const SELECT = `${COLS},gbf_weapon_extra_mats(stage,material,amount)`;

type ExtraRow = { stage: string; material: string; amount: number };
function withExtras(row: Weapon & { gbf_weapon_extra_mats?: ExtraRow[] }): Weapon {
  const { gbf_weapon_extra_mats: rows = [], ...w } = row;
  const extras: Record<string, Mats> = {};
  for (const r of rows) (extras[r.stage] ??= {})[r.material] = r.amount;
  return { ...w, extras };
}

export function useWeapons() {
  const [weapons, setWeapons] = useState<Weapon[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      let { data, error: loadError }: { data: unknown[] | null; error: { message: string } | null } =
        await supabase.from("gbf_weapons").select(SELECT).order("id");
      // Side table not created yet: load weapons without extras rather than failing.
      if (loadError?.message.includes("gbf_weapon_extra_mats")) {
        ({ data, error: loadError } = await supabase.from("gbf_weapons").select(COLS).order("id"));
      }
      if (loadError) { setError(loadError.message); setLoading(false); return; }
      setWeapons((data ?? []).map(r => withExtras(r as Weapon & { gbf_weapon_extra_mats?: ExtraRow[] })));
      setLoading(false);
    }
    load();
  }, []);

  async function add(form: Omit<Weapon, "id">): Promise<boolean> {
    setSaving(true);
    const { data, error: addError } = await supabase.from("gbf_weapons").insert([form]).select(COLS).single();
    if (addError) { setError(addError.message); setSaving(false); return false; }
    setWeapons(p => [...p, data as Weapon]);
    setSaving(false);
    return true;
  }

  async function update(form: Weapon): Promise<boolean> {
    setSaving(true);
    const { error: updateError } = await supabase.from("gbf_weapons").update({
      element: form.element, name: form.name,
      rank: form.rank, copies: form.copies, source: form.source,
      stages: form.stages, progress: form.progress,
    }).eq("id", form.id);
    if (updateError) { setError(updateError.message); setSaving(false); return false; }
    setWeapons(p => p.map(w => w.id === form.id ? form : w));
    setSaving(false);
    return true;
  }

  // Optimistic: tick boxes update instantly, rolled back if the write fails.
  async function setProgress(id: number, progress: CopyProgress[]) {
    const prev = weapons.find(w => w.id === id)?.progress ?? [];
    setWeapons(p => p.map(w => w.id === id ? { ...w, progress } : w));
    const { error: progressError } = await supabase.from("gbf_weapons").update({ progress }).eq("id", id);
    if (progressError) {
      setError(progressError.message);
      setWeapons(p => p.map(w => w.id === id ? { ...w, progress: prev } : w));
    }
  }

  async function remove(id: number) {
    setSaving(true);
    const { error: removeError } = await supabase.from("gbf_weapons").delete().eq("id", id);
    if (removeError) setError(removeError.message);
    else setWeapons(p => p.filter(w => w.id !== id));
    setSaving(false);
  }

  return { weapons, loading, saving, error, setError, add, update, setProgress, remove };
}
