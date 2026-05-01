import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSupabase } from "../../_lib/supabase.ts";
import { contactToDb, dbToContact } from "../../_lib/crm.ts";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const supabase = getSupabase();

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("contacts")
      .select("*")
      .order("full_name");

    if (error) return res.status(500).json({ error: error.message });
    return res.json((data || []).map(dbToContact));
  }

  if (req.method === "POST") {
    const input = req.body || {};
    if (!input.fullName?.trim()) {
      return res.status(400).json({ error: "Full name is required" });
    }

    const contactData = {
      ...input,
      fullName: input.fullName.trim(),
      relationshipType: input.relationshipType || "Friend",
      relationshipStrength: input.relationshipStrength ?? 5,
      cadenceDays: input.cadenceDays ?? 30,
      lastSeenDate: input.lastSeenDate || new Date().toISOString(),
      isPinned: input.isPinned ?? false,
      dietary: input.dietary || [],
      loveLanguages: input.loveLanguages || [],
      languages: input.languages || [],
      children: input.children || [],
      pets: input.pets || [],
      friendIds: input.friendIds || [],
      siblingIds: input.siblingIds || [],
      groups: input.groups || [],
      socials: input.socials || {},
    };

    const { data, error } = await supabase
      .from("contacts")
      .insert(contactToDb(contactData))
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(dbToContact(data));
  }

  return res.status(405).json({ error: "Method not allowed" });
}
