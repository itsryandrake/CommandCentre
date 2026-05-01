import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSupabase } from "../_lib/supabase.ts";
import { dbToInteraction } from "../_lib/crm.ts";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const supabase = getSupabase();

  if (req.method === "GET") {
    const contactId = req.query.contactId as string | undefined;
    let query = supabase
      .from("interactions")
      .select("*")
      .order("date", { ascending: false });

    if (contactId) query = query.eq("contact_id", contactId);

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    return res.json((data || []).map(dbToInteraction));
  }

  if (req.method === "POST") {
    const input = req.body || {};
    if (!input.contactId) {
      return res.status(400).json({ error: "Contact ID is required" });
    }
    if (!input.type) {
      return res.status(400).json({ error: "Interaction type is required" });
    }

    const date = input.date || new Date().toISOString();

    const { data, error } = await supabase
      .from("interactions")
      .insert({
        contact_id: input.contactId,
        date,
        type: input.type,
        location: input.location,
        notes: input.notes || "",
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    // Bump the contact's last_seen_date if this interaction is newer
    const { data: contact } = await supabase
      .from("contacts")
      .select("last_seen_date")
      .eq("id", input.contactId)
      .single();

    if (contact) {
      const interactionDate = new Date(date);
      const lastSeen = new Date(contact.last_seen_date);
      if (interactionDate >= lastSeen) {
        await supabase
          .from("contacts")
          .update({ last_seen_date: date })
          .eq("id", input.contactId);
      }
    }

    return res.status(201).json(dbToInteraction(data));
  }

  return res.status(405).json({ error: "Method not allowed" });
}
