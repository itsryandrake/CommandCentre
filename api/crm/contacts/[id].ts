import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSupabase } from "../../_lib/supabase.js";
import { contactToDb, dbToContact, dbToInteraction } from "../../_lib/crm.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = req.query.id as string;
  if (!id) return res.status(400).json({ error: "id is required" });

  const supabase = getSupabase();

  if (req.method === "GET") {
    const { data: contact, error } = await supabase
      .from("contacts")
      .select("*")
      .eq("id", id)
      .single();

    if (error?.code === "PGRST116" || !contact) {
      return res.status(404).json({ error: "Contact not found" });
    }
    if (error) return res.status(500).json({ error: error.message });

    const { data: interactions } = await supabase
      .from("interactions")
      .select("*")
      .eq("contact_id", id)
      .order("date", { ascending: false });

    return res.json({
      ...dbToContact(contact),
      interactions: (interactions || []).map(dbToInteraction),
    });
  }

  if (req.method === "PATCH") {
    const { data: existing } = await supabase
      .from("contacts")
      .select("id")
      .eq("id", id)
      .single();

    if (!existing) return res.status(404).json({ error: "Contact not found" });

    const { data, error } = await supabase
      .from("contacts")
      .update(contactToDb(req.body || {}))
      .eq("id", id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.json(dbToContact(data));
  }

  if (req.method === "DELETE") {
    await supabase.from("interactions").delete().eq("contact_id", id);
    const { error } = await supabase.from("contacts").delete().eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
