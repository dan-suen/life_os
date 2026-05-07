import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import type { TvShow } from "../types";

export function useTvShows() {
  const [shows, setShows] = useState<TvShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data, error: loadError } = await supabase.from("tv_shows").select("*").order("name");
      if (loadError) { setError(loadError.message); setLoading(false); return; }
      setShows((data ?? []) as TvShow[]);
      setLoading(false);
    }
    load();
  }, []);

  async function add(form: Omit<TvShow, "id">): Promise<boolean> {
    setSaving(true);
    const { data, error: addError } = await supabase.from("tv_shows").insert([form]).select().single();
    if (addError) { setError(addError.message); setSaving(false); return false; }
    setShows(p => [...p, data as TvShow].sort((a, b) => a.name.localeCompare(b.name)));
    setSaving(false);
    return true;
  }

  async function update(show: TvShow): Promise<boolean> {
    setSaving(true);
    const { error: updateError } = await supabase.from("tv_shows").update({
      name: show.name, air_day: show.air_day, episode: show.episode,
      caught_up: show.caught_up, status: show.status, type: show.type, url: show.url,
    }).eq("id", show.id);
    if (updateError) { setError(updateError.message); setSaving(false); return false; }
    setShows(p => p.map(s => s.id === show.id ? show : s));
    setSaving(false);
    return true;
  }

  async function remove(id: number) {
    setSaving(true);
    const { error: removeError } = await supabase.from("tv_shows").delete().eq("id", id);
    if (removeError) setError(removeError.message);
    else setShows(p => p.filter(s => s.id !== id));
    setSaving(false);
  }

  async function toggleCaughtUp(show: TvShow) {
    const caught_up = !show.caught_up;
    const { error: toggleError } = await supabase.from("tv_shows").update({ caught_up }).eq("id", show.id);
    if (toggleError) setError(toggleError.message);
    else setShows(p => p.map(s => s.id === show.id ? { ...s, caught_up } : s));
  }

  async function adjustEpisode(show: TvShow, delta: number) {
    const episode = Math.max(0, show.episode + delta);
    setShows(p => p.map(s => s.id === show.id ? { ...s, episode } : s));
    const { error: adjustError } = await supabase.from("tv_shows").update({ episode }).eq("id", show.id);
    if (adjustError) {
      setError(adjustError.message);
      setShows(p => p.map(s => s.id === show.id ? show : s));
    }
  }

  async function importShows(newShows: Omit<TvShow, "id">[]): Promise<boolean> {
    setSaving(true);
    const { data, error: importError } = await supabase.from("tv_shows").insert(newShows).select();
    if (importError) { setError(importError.message); setSaving(false); return false; }
    setShows(p => [...p, ...(data as TvShow[])].sort((a, b) => a.name.localeCompare(b.name)));
    setSaving(false);
    return true;
  }

  return { shows, loading, saving, error, setError, add, update, remove, toggleCaughtUp, adjustEpisode, importShows };
}
