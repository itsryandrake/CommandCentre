import { getSupabase } from "./supabase.ts";
import type { LifeScript, LifeScriptVersion, UpdateLifeScriptInput } from "../../shared/types/lifeScript.ts";

function dbToScript(row: any): LifeScript {
  return {
    id: row.id,
    owner: row.owner,
    title: row.title,
    content: row.content,
    updatedAt: row.updated_at,
    createdAt: row.created_at,
  };
}

function dbToVersion(row: any): LifeScriptVersion {
  return {
    id: row.id,
    scriptId: row.script_id,
    content: row.content,
    savedAt: row.saved_at,
  };
}

export async function getScript(owner: string): Promise<LifeScript | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("life_scripts")
    .select("*")
    .eq("owner", owner)
    .single();

  if (error || !data) return null;
  return dbToScript(data);
}

export async function upsertScript(owner: string, input: UpdateLifeScriptInput): Promise<LifeScript> {
  const supabase = getSupabase();

  // Check if script exists
  const existing = await getScript(owner);

  if (existing) {
    // Save current version to history before updating
    await supabase.from("life_script_versions").insert({
      script_id: existing.id,
      content: existing.content,
    });

    // Update
    const updates: any = { updated_at: new Date().toISOString() };
    if (input.title !== undefined) updates.title = input.title;
    if (input.content !== undefined) updates.content = input.content;

    const { data, error } = await supabase
      .from("life_scripts")
      .update(updates)
      .eq("id", existing.id)
      .select()
      .single();

    if (error) throw error;
    return dbToScript(data);
  } else {
    // Create new
    const { data, error } = await supabase
      .from("life_scripts")
      .insert({
        owner,
        title: input.title || "Life Script",
        content: input.content || "",
      })
      .select()
      .single();

    if (error) throw error;
    return dbToScript(data);
  }
}

export async function listVersions(scriptId: string): Promise<LifeScriptVersion[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("life_script_versions")
    .select("*")
    .eq("script_id", scriptId)
    .order("saved_at", { ascending: false })
    .limit(50);

  if (error) throw error;
  return (data || []).map(dbToVersion);
}

export async function restoreVersion(scriptId: string, versionId: string): Promise<LifeScript | null> {
  const supabase = getSupabase();

  // Get the version content
  const { data: version, error: vErr } = await supabase
    .from("life_script_versions")
    .select("*")
    .eq("id", versionId)
    .single();

  if (vErr || !version) return null;

  // Get current script to save as version first
  const { data: current } = await supabase
    .from("life_scripts")
    .select("*")
    .eq("id", scriptId)
    .single();

  if (current) {
    await supabase.from("life_script_versions").insert({
      script_id: scriptId,
      content: current.content,
    });
  }

  // Update script with version content
  const { data, error } = await supabase
    .from("life_scripts")
    .update({ content: version.content, updated_at: new Date().toISOString() })
    .eq("id", scriptId)
    .select()
    .single();

  if (error || !data) return null;
  return dbToScript(data);
}
