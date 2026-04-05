import { getSupabase } from "./supabase.ts";
import type { Contact, Interaction } from "../../shared/types/crm.ts";

// Snake_case DB row → camelCase app type
function dbToContact(row: any): Contact {
  return {
    id: row.id,
    fullName: row.full_name,
    avatarUrl: row.avatar_url,
    relationshipType: row.relationship_type,
    relationshipStrength: row.relationship_strength,
    cadenceDays: row.cadence_days,
    lastSeenDate: row.last_seen_date,
    howWeMet: row.how_we_met,
    occupation: row.occupation,
    location: row.location,
    notes: row.notes,
    birthday: row.birthday,
    dietary: row.dietary || [],
    loveLanguages: row.love_languages || [],
    languages: row.languages || [],
    myersBriggs: row.myers_briggs,
    humanDesign: row.human_design,
    religion: row.religion,
    ethnicity: row.ethnicity,
    politicalLeaning: row.political_leaning,
    relationshipStatus: row.relationship_status,
    spouseName: row.spouse_name,
    spouseId: row.spouse_id,
    weddingAnniversary: row.wedding_anniversary,
    children: row.children || [],
    pets: row.pets || [],
    friendIds: row.friend_ids || [],
    siblingIds: row.sibling_ids || [],
    groups: row.groups || [],
    email: row.email,
    phone: row.phone,
    socials: row.socials || {},
    isPinned: row.is_pinned,
  };
}

// camelCase app type → snake_case DB row
function contactToDb(contact: Partial<Contact>): any {
  const db: any = {};
  if (contact.fullName !== undefined) db.full_name = contact.fullName;
  if (contact.avatarUrl !== undefined) db.avatar_url = contact.avatarUrl;
  if (contact.relationshipType !== undefined) db.relationship_type = contact.relationshipType;
  if (contact.relationshipStrength !== undefined) db.relationship_strength = contact.relationshipStrength;
  if (contact.cadenceDays !== undefined) db.cadence_days = contact.cadenceDays;
  if (contact.lastSeenDate !== undefined) db.last_seen_date = contact.lastSeenDate;
  if (contact.howWeMet !== undefined) db.how_we_met = contact.howWeMet;
  if (contact.occupation !== undefined) db.occupation = contact.occupation;
  if (contact.location !== undefined) db.location = contact.location;
  if (contact.notes !== undefined) db.notes = contact.notes;
  if (contact.birthday !== undefined) db.birthday = contact.birthday;
  if (contact.dietary !== undefined) db.dietary = contact.dietary;
  if (contact.loveLanguages !== undefined) db.love_languages = contact.loveLanguages;
  if (contact.languages !== undefined) db.languages = contact.languages;
  if (contact.myersBriggs !== undefined) db.myers_briggs = contact.myersBriggs;
  if (contact.humanDesign !== undefined) db.human_design = contact.humanDesign;
  if (contact.religion !== undefined) db.religion = contact.religion;
  if (contact.ethnicity !== undefined) db.ethnicity = contact.ethnicity;
  if (contact.politicalLeaning !== undefined) db.political_leaning = contact.politicalLeaning;
  if (contact.relationshipStatus !== undefined) db.relationship_status = contact.relationshipStatus;
  if (contact.spouseName !== undefined) db.spouse_name = contact.spouseName;
  if (contact.spouseId !== undefined) db.spouse_id = contact.spouseId;
  if (contact.weddingAnniversary !== undefined) db.wedding_anniversary = contact.weddingAnniversary;
  if (contact.children !== undefined) db.children = contact.children;
  if (contact.pets !== undefined) db.pets = contact.pets;
  if (contact.friendIds !== undefined) db.friend_ids = contact.friendIds;
  if (contact.siblingIds !== undefined) db.sibling_ids = contact.siblingIds;
  if (contact.groups !== undefined) db.groups = contact.groups;
  if (contact.email !== undefined) db.email = contact.email;
  if (contact.phone !== undefined) db.phone = contact.phone;
  if (contact.socials !== undefined) db.socials = contact.socials;
  if (contact.isPinned !== undefined) db.is_pinned = contact.isPinned;
  return db;
}

function dbToInteraction(row: any): Interaction {
  return {
    id: row.id,
    contactId: row.contact_id,
    date: row.date,
    type: row.type,
    location: row.location,
    notes: row.notes,
  };
}

function interactionToDb(interaction: Partial<Interaction>): any {
  const db: any = {};
  if (interaction.contactId !== undefined) db.contact_id = interaction.contactId;
  if (interaction.date !== undefined) db.date = interaction.date;
  if (interaction.type !== undefined) db.type = interaction.type;
  if (interaction.location !== undefined) db.location = interaction.location;
  if (interaction.notes !== undefined) db.notes = interaction.notes;
  return db;
}

// =============================================================================
// Contact CRUD
// =============================================================================

export async function fetchContacts(): Promise<Contact[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .order("full_name");

  if (error) throw error;
  return (data || []).map(dbToContact);
}

export async function fetchContact(id: string): Promise<Contact | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // Not found
    throw error;
  }
  return dbToContact(data);
}

export async function createContact(contact: Partial<Contact>): Promise<Contact> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("contacts")
    .insert(contactToDb(contact))
    .select()
    .single();

  if (error) throw error;
  return dbToContact(data);
}

export async function updateContact(id: string, contact: Partial<Contact>): Promise<Contact> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("contacts")
    .update(contactToDb(contact))
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return dbToContact(data);
}

export async function deleteContact(id: string): Promise<void> {
  const supabase = getSupabase();
  // Delete associated interactions first
  await supabase.from("interactions").delete().eq("contact_id", id);
  const { error } = await supabase.from("contacts").delete().eq("id", id);
  if (error) throw error;
}

// =============================================================================
// Interaction CRUD
// =============================================================================

export async function fetchInteractions(contactId?: string): Promise<Interaction[]> {
  const supabase = getSupabase();
  let query = supabase
    .from("interactions")
    .select("*")
    .order("date", { ascending: false });

  if (contactId) {
    query = query.eq("contact_id", contactId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(dbToInteraction);
}

export async function createInteraction(interaction: Partial<Interaction>): Promise<Interaction> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("interactions")
    .insert(interactionToDb(interaction))
    .select()
    .single();

  if (error) throw error;

  // Update the contact's lastSeenDate if this interaction is more recent
  if (interaction.contactId && interaction.date) {
    const contact = await fetchContact(interaction.contactId);
    if (contact) {
      const interactionDate = new Date(interaction.date);
      const lastSeen = new Date(contact.lastSeenDate);
      if (interactionDate >= lastSeen) {
        await updateContact(interaction.contactId, {
          lastSeenDate: interaction.date,
        });
      }
    }
  }

  return dbToInteraction(data);
}

// =============================================================================
// Stats
// =============================================================================

export async function fetchCrmStats(): Promise<{
  totalContacts: number;
  overdueCount: number;
  atRiskCount: number;
  upcomingBirthdays: Array<{
    contactId: string;
    fullName: string;
    birthday: string;
    daysAway: number;
  }>;
}> {
  const contacts = await fetchContacts();
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
      (now.getTime() - new Date(contact.lastSeenDate).getTime()) / (1000 * 60 * 60 * 24)
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
      // If birthday already passed this year, check next year
      if (diff < 0) {
        const nextYearBd = new Date(now.getFullYear() + 1, bd.getMonth(), bd.getDate());
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

  return {
    totalContacts: contacts.length,
    overdueCount,
    atRiskCount,
    upcomingBirthdays,
  };
}
