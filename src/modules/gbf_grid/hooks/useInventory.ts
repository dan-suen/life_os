import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";

/** In-game stock per material, plus a manual "complete" flag. */
export interface InventoryItem {
  owned: number;
  complete: boolean;
}

export function useInventory() {
  const [inventory, setInventory] = useState<Record<string, InventoryItem>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data, error: loadError } = await supabase.from("gbf_inventory").select("material,owned,complete");
      if (loadError) { setError(loadError.message); return; }
      setInventory(Object.fromEntries((data ?? []).map(r => [r.material, { owned: r.owned, complete: r.complete }])));
    }
    load();
  }, []);

  // Optimistic upsert; rolled back if the write fails.
  async function save(material: string, patch: Partial<InventoryItem>) {
    const prev = inventory[material];
    const next: InventoryItem = { owned: patch.owned ?? prev?.owned ?? 0, complete: patch.complete ?? prev?.complete ?? false };
    setInventory(p => ({ ...p, [material]: next }));
    const { error: saveError } = await supabase.from("gbf_inventory")
      .upsert({ material, ...next, updated_at: new Date().toISOString() }, { onConflict: "material" });
    if (saveError) {
      setError(saveError.message);
      setInventory(p => { const n = { ...p }; if (prev) n[material] = prev; else delete n[material]; return n; });
    }
  }

  return { inventory, error, setError, save };
}
