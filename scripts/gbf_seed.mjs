// One-off: rebuild the gbf_weapons table from a verified dataset.
// Reads Supabase creds from .env.local itself (never printed).
// Usage:
//   node scripts/gbf_seed.mjs count
//   node scripts/gbf_seed.mjs purge
//   node scripts/gbf_seed.mjs insert <group.json>
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.trimStart().startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")];
    })
);

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);
const [cmd, arg] = process.argv.slice(2);

if (cmd === "count") {
  const { count, error } = await supabase
    .from("gbf_weapons")
    .select("*", { count: "exact", head: true });
  if (error) throw error;
  console.log("gbf_weapons rows:", count);
} else if (cmd === "list") {
  const { data, error } = await supabase
    .from("gbf_weapons")
    .select("element,category,name,rank,copies,source")
    .order("id");
  if (error) throw error;
  console.log(JSON.stringify(data, null, 1));
} else if (cmd === "purge") {
  const { error } = await supabase.from("gbf_weapons").delete().gte("id", 0);
  if (error) throw error;
  console.log("purged.");
} else if (cmd === "insert") {
  const rows = JSON.parse(readFileSync(arg, "utf8"));
  const { data, error } = await supabase.from("gbf_weapons").insert(rows).select();
  if (error) throw error;
  console.log(`inserted ${data.length} rows.`);
} else {
  console.log("commands: count | list | purge | insert <file.json>");
}
