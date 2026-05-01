export function dbToContact(row: any) {
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

export function contactToDb(contact: any): any {
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

export function dbToInteraction(row: any) {
  return {
    id: row.id,
    contactId: row.contact_id,
    date: row.date,
    type: row.type,
    location: row.location,
    notes: row.notes,
  };
}
