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

  // key format: "{element}:{weaponName}" to disambiguate shared names like "Bahamut Weapons"
  async function toggle(element: string, name: string) {
    const key = `${element}:${name}`;
    const isChecked = checked.has(key);

    setChecked(prev => {
      const next = new Set(prev);
      isChecked ? next.delete(key) : next.add(key);
      return next;
    });

    if (isChecked) {
      const { error: err } = await supabase
        .from("gbf_grid_checked")
        .delete()
        .eq("weapon_name", key);
      if (err) {
        setError(err.message);
        setChecked(prev => { const next = new Set(prev); next.add(key); return next; });
      }
    } else {
      const { error: err } = await supabase
        .from("gbf_grid_checked")
        .insert({ weapon_name: key });
      if (err) {
        setError(err.message);
        setChecked(prev => { const next = new Set(prev); next.delete(key); return next; });
      }
    }
  }

  function isChecked(element: string, name: string) {
    return checked.has(`${element}:${name}`);
  }

  return { isChecked, loading, error, setError, toggle };
}
