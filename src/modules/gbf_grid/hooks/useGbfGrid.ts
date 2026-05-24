import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";

export function useGbfGrid() {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data, error: loadError } = await supabase
        .from("gbf_grid_checked")
        .select("weapon_name");
      if (loadError) { setError(loadError.message); setLoading(false); return; }
      setChecked(new Set((data ?? []).map((r: { weapon_name: string }) => r.weapon_name)));
      setLoading(false);
    }
    load();
  }, []);

  async function toggle(name: string) {
    const isChecked = checked.has(name);
    // Optimistic update
    setChecked(prev => {
      const next = new Set(prev);
      isChecked ? next.delete(name) : next.add(name);
      return next;
    });

    if (isChecked) {
      const { error: err } = await supabase
        .from("gbf_grid_checked")
        .delete()
        .eq("weapon_name", name);
      if (err) {
        setError(err.message);
        setChecked(prev => { const next = new Set(prev); next.add(name); return next; });
      }
    } else {
      const { error: err } = await supabase
        .from("gbf_grid_checked")
        .insert({ weapon_name: name });
      if (err) {
        setError(err.message);
        setChecked(prev => { const next = new Set(prev); next.delete(name); return next; });
      }
    }
  }

  return { checked, loading, error, setError, toggle };
}
