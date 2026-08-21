import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import type { Weapon } from "../data";

export function useWeapons() {
  const [weapons, setWeapons] = useState<Weapon[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data, error: loadError } = await supabase.from("gbf_weapons").select("*").order("id");
      if (loadError) { setError(loadError.message); setLoading(false); return; }
      setWeapons((data ?? []) as Weapon[]);
      setLoading(false);
    }
    load();
  }, []);

  async function add(form: Omit<Weapon, "id">): Promise<boolean> {
    setSaving(true);
    const { data, error: addError } = await supabase.from("gbf_weapons").insert([form]).select().single();
    if (addError) { setError(addError.message); setSaving(false); return false; }
    setWeapons(p => [...p, data as Weapon]);
    setSaving(false);
    return true;
  }

  async function update(form: Weapon): Promise<boolean> {
    setSaving(true);
    const { error: updateError } = await supabase.from("gbf_weapons").update({
      element: form.element, category: form.category, name: form.name,
      rank: form.rank, copies: form.copies, source: form.source,
    }).eq("id", form.id);
    if (updateError) { setError(updateError.message); setSaving(false); return false; }
    setWeapons(p => p.map(w => w.id === form.id ? form : w));
    setSaving(false);
    return true;
  }

  async function remove(id: number) {
    setSaving(true);
    const { error: removeError } = await supabase.from("gbf_weapons").delete().eq("id", id);
    if (removeError) setError(removeError.message);
    else setWeapons(p => p.filter(w => w.id !== id));
    setSaving(false);
  }

  return { weapons, loading, saving, error, setError, add, update, remove };
}
