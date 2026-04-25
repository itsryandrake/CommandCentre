/**
 * Seed production Supabase with local SQLite data.
 * Run: npx tsx scripts/seed-production.ts
 */
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env"), override: true });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

async function seedLoyaltyPrograms() {
  const { data: existing } = await supabase.from("loyalty_programs").select("id");
  if (existing && existing.length > 0) {
    console.log(`[Loyalty] Already has ${existing.length} rows, skipping.`);
    return;
  }

  const programs = [
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

  const { error } = await supabase.from("loyalty_programs").insert(programs);
  if (error) {
    console.error("[Loyalty] Error:", error.message);
  } else {
    console.log("[Loyalty] Seeded 3 programs.");
  }
}

async function seedGoalYears() {
  const { data: existing } = await supabase.from("goal_years").select("id");
  if (existing && existing.length > 0) {
    console.log(`[GoalYears] Already has ${existing.length} rows, skipping.`);
    return;
  }

  const { error } = await supabase.from("goal_years").insert({
    year: 2026,
    theme: "Growth & Freedom",
    purpose: "Build financial independence",
    outcomes: "Hit $20k/mo recurring",
    target_monthly_income: 20000.0,
    target_daily_income: 666.0,
  });

  if (error) {
    console.error("[GoalYears] Error:", error.message);
  } else {
    console.log("[GoalYears] Seeded 2026 year data.");
  }
}

async function seedGoalYearIntentions() {
  const { data: existing } = await supabase.from("goal_year_intentions").select("id");
  if (existing && existing.length > 0) {
    console.log(`[Intentions] Already has ${existing.length} rows, skipping.`);
    return;
  }

  const { error } = await supabase.from("goal_year_intentions").insert({
    year: 2026,
    category: "business",
    intention: "build recurring revenue streams",
  });

  if (error) {
    console.error("[Intentions] Error:", error.message);
  } else {
    console.log("[Intentions] Seeded 2026 business intention.");
  }
}

async function main() {
  console.log("Seeding production Supabase...\n");
  await seedLoyaltyPrograms();
  await seedGoalYears();
  await seedGoalYearIntentions();
  console.log("\nDone.");
}

main().catch(console.error);
