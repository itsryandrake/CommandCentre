import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSupabase } from "../_lib/supabase.ts";
import { dbToContact } from "../_lib/crm.ts";

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .order("full_name");

  if (error) return res.status(500).json({ error: error.message });

  const contacts = (data || []).map(dbToContact);
  const now = new Date();

  let overdueCount = 0;
  let atRiskCount = 0;
  const upcomingBirthdays: Array<{
    contactId: string;
    fullName: string;
    birthday: string;
    daysAway: number;
  }> = [];

  for (const contact of contacts) {
    const daysSince = Math.floor(
      (now.getTime() - new Date(contact.lastSeenDate).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    if (daysSince > contact.cadenceDays * 1.5) {
      atRiskCount++;
      overdueCount++;
    } else if (daysSince > contact.cadenceDays) {
      overdueCount++;
    }

    if (contact.birthday) {
      const bd = new Date(contact.birthday);
      const thisYearBd = new Date(now.getFullYear(), bd.getMonth(), bd.getDate());
      let diff = Math.floor(
        (thisYearBd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diff < 0) {
        const nextYearBd = new Date(
          now.getFullYear() + 1,
          bd.getMonth(),
          bd.getDate()
        );
        diff = Math.floor(
          (nextYearBd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
      }
      if (diff >= 0 && diff <= 30) {
        upcomingBirthdays.push({
          contactId: contact.id,
          fullName: contact.fullName,
          birthday: contact.birthday,
          daysAway: diff,
        });
      }
    }
  }

  upcomingBirthdays.sort((a, b) => a.daysAway - b.daysAway);

  return res.json({
    totalContacts: contacts.length,
    overdueCount,
    atRiskCount,
    upcomingBirthdays,
  });
}
