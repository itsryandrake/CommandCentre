export type RelationshipType = 'Family' | 'Friend' | 'Work-Friend' | 'Neighbour' | 'Acquaintance' | 'Other';

export type RelationshipStatus = 'Single' | 'In a Relationship' | 'Engaged' | 'Married' | 'Divorced' | 'Widowed' | "It's Complicated";

export type InteractionType = 'In Person' | 'Phone' | 'Video Call' | 'Message' | 'Event';

export interface Child {
  id: string;
  name: string;
  dob?: string;
}

export interface Pet {
  id: string;
  type: string;
  name: string;
  notes?: string;
}

export interface Socials {
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  tiktok?: string;
  x?: string;
}

export interface Contact {
  id: string;
  fullName: string;
  avatarUrl?: string;
  relationshipType: RelationshipType;
  relationshipStrength: number;
  cadenceDays: number;
  lastSeenDate: string;

  // Context
  howWeMet?: string;
  occupation?: string;
  location?: string;
  notes?: string;
  birthday?: string;

  // Lifestyle & Personality
  dietary: string[];
  loveLanguages: string[];
  languages: string[];
  myersBriggs?: string;
  humanDesign?: string;

  // Demographics
  religion?: string;
  ethnicity?: string;
  politicalLeaning?: string;

  // Family & Relationships
  relationshipStatus?: RelationshipStatus;
  spouseName?: string;
  spouseId?: string;
  weddingAnniversary?: string;
  children: Child[];
  pets: Pet[];

  // Social Graph
  friendIds: string[];
  siblingIds: string[];
  groups: string[];

  // Contact
  email?: string;
  phone?: string;
  socials: Socials;

  isPinned: boolean;
}

export interface Interaction {
  id: string;
  contactId: string;
  date: string;
  type: InteractionType;
  location?: string;
  notes: string;
}

export interface CreateContactInput {
  fullName: string;
  relationshipType?: RelationshipType;
  relationshipStrength?: number;
  cadenceDays?: number;
  lastSeenDate?: string;
  avatarUrl?: string;
  howWeMet?: string;
  occupation?: string;
  location?: string;
  notes?: string;
  birthday?: string;
  dietary?: string[];
  loveLanguages?: string[];
  languages?: string[];
  myersBriggs?: string;
  humanDesign?: string;
  religion?: string;
  ethnicity?: string;
  politicalLeaning?: string;
  relationshipStatus?: RelationshipStatus;
  spouseName?: string;
  spouseId?: string;
  weddingAnniversary?: string;
  children?: Child[];
  pets?: Pet[];
  friendIds?: string[];
  siblingIds?: string[];
  groups?: string[];
  email?: string;
  phone?: string;
  socials?: Socials;
  isPinned?: boolean;
}

export interface CreateInteractionInput {
  contactId: string;
  date: string;
  type: InteractionType;
  location?: string;
  notes: string;
}

export interface CrmStats {
  totalContacts: number;
  overdueCount: number;
  atRiskCount: number;
  upcomingBirthdays: Array<{
    contactId: string;
    fullName: string;
    birthday: string;
    daysAway: number;
  }>;
}
