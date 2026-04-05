import { getSupabase } from "./supabase.ts";
import type { LoyaltyProgram } from "../../shared/types/loyalty.ts";

function dbToProgram(row: any): LoyaltyProgram {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    logoUrl: row.logo_url,
    points: row.points,
    statusTier: row.status_tier,
    memberNumber: row.member_number,
    benefits: row.benefits || [],
    colour: row.colour,
    updatedAt: row.updated_at,
    createdAt: row.created_at,
  };
}

const SEED_DATA = [
  {
    name: "Qantas Frequent Flyer",
    slug: "qantas",
    logo_url: "https://cdn.brandfetch.io/qantas.com/w/256/h/256/logo",
    points: 60702,
    status_tier: "Bronze",
    member_number: "1914602717",
    colour: "#E0102A",
    benefits: [
      "Earn 1 Qantas Point per $1 spent with partners",
      "Access to Classic Flight Rewards",
      "Priority check-in at domestic airports",
      "23kg checked baggage on Qantas domestic flights",
      "Access to Qantas Wine and Qantas Shopping",
      "Earn Status Credits towards Silver and above",
      "Points pooling with Family Transfers (limited)",
    ],
  },
  {
    name: "Velocity Frequent Flyer",
    slug: "velocity",
    logo_url: "https://cdn.brandfetch.io/velocityfrequentflyer.com/w/256/h/256/logo",
    points: 22472,
    status_tier: "Gold",
    member_number: "2117200335",
    colour: "#B8860B",
    benefits: [
      "Priority check-in and boarding on Virgin Australia",
      "Lounge access: Virgin Australia domestic lounges",
      "Extra 23kg checked baggage (46kg total domestic)",
      "Priority baggage handling",
      "Complimentary seat selection including exit rows",
      "Earn bonus Status Credits (75% bonus)",
      "Priority waitlist and standby",
      "Dedicated Gold member service line",
      "Partner lounge access (select international)",
      "Priority rebooking during disruptions",
    ],
  },
  {
    name: "Marriott Bonvoy",
    slug: "marriott",
    logo_url: "https://cdn.brandfetch.io/marriott.com/w/256/h/256/logo",
    points: 247212,
    status_tier: "Silver Elite",
    member_number: "518700765",
    colour: "#1C1C1C",
    benefits: [
      "10% bonus points on paid stays",
      "Priority late checkout (subject to availability)",
      "Complimentary enhanced internet access",
      "Member-exclusive rates on marriott.com",
      "Mobile check-in and digital key",
      "Earn 10 points per $1 USD at Marriott hotels",
      "Points redeemable at 8,800+ hotels worldwide",
      "Points transfer to 40+ airline partners",
      "Fifth night free on award stays",
      "Points can be used for experiences and gift cards",
    ],
  },
];

export async function listPrograms(): Promise<LoyaltyProgram[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("loyalty_programs")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data || []).map(dbToProgram);
}

export async function updateProgram(
  id: string,
  fields: { points?: number; status_tier?: string; member_number?: string }
): Promise<LoyaltyProgram | null> {
  const supabase = getSupabase();
  const updates: Record<string, any> = { ...fields, updated_at: new Date().toISOString() };

  const { data, error } = await supabase
    .from("loyalty_programs")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data ? dbToProgram(data) : null;
}

export async function seedProgramsIfEmpty(): Promise<void> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("loyalty_programs")
    .select("id");

  if (error) {
    console.error("[Loyalty] Error checking seed status:", error);
    return;
  }

  if (!data || data.length === 0) {
    console.log("[Loyalty] Seeding loyalty programs...");
    const { error: insertError } = await supabase
      .from("loyalty_programs")
      .insert(SEED_DATA);

    if (insertError) {
      console.error("[Loyalty] Error seeding programs:", insertError);
    } else {
      console.log("[Loyalty] Seeded 3 loyalty programs.");
    }
  }
}
