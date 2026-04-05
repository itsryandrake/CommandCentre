import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from "@/components/ui/glass-card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BudgetStatCard } from "@/components/budget/BudgetStatCard";
import { PropertyForm, LoanForm } from "@/components/budget/PropertyLoanForm";
import { useFinance } from "@/hooks/useFinance";
import { Plus, Building2, Landmark } from "lucide-react";
import type { Property, Loan } from "@shared/types/finance";

// ── Months covered ──
const MONTHS = ["Dec", "Jan", "Feb", "Mar"];

// ── Currency formatter ──
const fmt = (n: number) =>
  "$" + Math.abs(n).toLocaleString("en-AU", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

// ── Monthly spending by category ──
const SPENDING: Record<string, Record<string, number>> = {
  Dec: { Rent: 3846, Mortgage: 1500, Gym: 1277, "Health Ins": 527, "Pet Ins": 428, "Car Ins": 338, Accounting: 418, Cleaner: 770, Tolls: 80, Subs: 268, Utilities: 794, Groceries: 1078, Coffee: 406, Dining: 681, Takeaway: 54, Delivery: 138, Shopping: 1594, Baby: 77, Beauty: 233, Fuel: 11, Entertainment: 0, Travel: 2063, Health: 116, Pets: 99, Home: 59, "Meal Kits": 398, Parking: 44, Personal: 144, Snacks: 10, Donations: 60, Postage: 25, Office: 27, "Body Corp": 401, Rates: 517, Transport: 37 },
  Jan: { Rent: 3680, Mortgage: 4500, Gym: 1917, "Health Ins": 527, "Pet Ins": 428, "Car Ins": 338, Accounting: 418, Cleaner: 720, Tolls: 120, Subs: 399, Groceries: 851, Coffee: 287, Dining: 505, Takeaway: 10, Delivery: 199, Shopping: 334, Baby: 241, Beauty: 88, Fuel: 303, Entertainment: 162, "Meal Kits": 111, Parking: 41, Personal: 14, Snacks: 44, Postage: 33, Tax: 678, Pets: 201, Home: 66 },
  Feb: { Rent: 4600, Mortgage: 3000, Gym: 1136, "Health Ins": 527, "Pet Ins": 428, "Car Ins": 338, Accounting: 418, Cleaner: 720, Tolls: 180, Subs: 454, Utilities: 1062, Groceries: 1414, Coffee: 372, Dining: 783, Takeaway: 150, Delivery: 166, Shopping: 1160, Baby: 185, Fuel: 153, Entertainment: 63, Health: 59, Home: 22, Parking: 42, Personal: 800, Snacks: 12, Phone: 70, Photo: 100 },
  Mar: { Rent: 1840, Mortgage: 1500, Gym: 565, "Health Ins": 527, "Pet Ins": 428, "Car Ins": 338, Accounting: 418, Cleaner: 720, Tolls: 200, Subs: 437, Utilities: 726, Groceries: 941, Coffee: 531, Dining: 458, Takeaway: 88, Shopping: 621, Baby: 364, Beauty: 230, Fuel: 144, Health: 181, Pets: 207, Donations: 50, Office: 45, Photo: 669, Coaching: 238, "Credit Card": 2195, Rates: 516, Snacks: 7 },
};

// ── Monthly income by source ──
const INCOME: Record<string, Record<string, number>> = {
  Dec: { "Emily Salary": 6150, "Emily Transfer": 10000, "Rental Income": 2000, Other: 973 },
  Jan: { "Ryan Salary": 3098, "Emily Salary": 4100, "Emily Transfer": 3500, "Rental Income": 3023 },
  Feb: { "Emily Salary": 4100, "Emily Transfer": 9520, "Rental Income": 2400 },
  Mar: { "Ryan Salary": 11308, "Emily Salary": 2050, "Emily Transfer": 1297, "Rental Income": 2400 },
};

// ── Category colours ──
const CATEGORY_COLOURS: Record<string, string> = {
  Rent: "#ef4444", Mortgage: "#dc2626", Gym: "#f97316", "Health Ins": "#06b6d4", "Pet Ins": "#8b5cf6", "Car Ins": "#6366f1", Accounting: "#ec4899", Cleaner: "#f59e0b", Tolls: "#78716c", Subs: "#a855f7", Utilities: "#0ea5e9", Groceries: "#22c55e", Coffee: "#a16207", Dining: "#e11d48", Takeaway: "#fb923c", Delivery: "#ea580c", Shopping: "#7c3aed", Baby: "#f472b6", Beauty: "#d946ef", Fuel: "#64748b", Entertainment: "#14b8a6", Travel: "#0284c7", Health: "#10b981", Pets: "#a3a3a3", Home: "#737373", "Meal Kits": "#84cc16", Parking: "#94a3b8", Personal: "#c084fc", Snacks: "#fbbf24", Donations: "#2dd4bf", Postage: "#9ca3af", Office: "#6b7280", Photo: "#db2777", Coaching: "#7c3aed", "Credit Card": "#991b1b", Tax: "#dc2626", Phone: "#0891b2", "Body Corp": "#525252", Rates: "#404040", Transport: "#475569",
};

const INCOME_COLOURS: Record<string, string> = {
  "Ryan Salary": "#22c55e", "Emily Salary": "#34d399", "Emily Transfer": "#6ee7b7", "Rental Income": "#06b6d4", Other: "#a3a3a3",
};

// ── Essential (non-cuttable) categories ──
const ESSENTIALS = new Set(["Rent", "Mortgage", "Health Ins", "Utilities", "Rates", "Body Corp", "Phone", "Car Ins", "Tax"]);

// ── Recurring items ──
interface RecurringItem {
  name: string;
  monthly: number;
  type: "F" | "V";
  category: string;
  range?: string;
}

const RECURRING: RecurringItem[] = [
  { name: "Rent (Tiger Stripe)", monthly: 3360, type: "F", category: "Rent" },
  { name: "Mortgage (Adelaide Bank)", monthly: 2864, type: "F", category: "Mortgage" },
  { name: "Total Fusion (Gym)", monthly: 1334, type: "V", category: "Gym", range: "$15-$278" },
  { name: "Heni (Cleaner)", monthly: 720, type: "F", category: "Cleaner" },
  { name: "HCF Health Insurance", monthly: 527, type: "F", category: "Health Ins" },
  { name: "Woolworths", monthly: 911, type: "V", category: "Groceries", range: "$1-$395" },
  { name: "Amazon", monthly: 420, type: "V", category: "Shopping", range: "$16-$215" },
  { name: "Ignitionpay", monthly: 418, type: "F", category: "Accounting" },
  { name: "Pet Insurance (Everyday/PetSure)", monthly: 321, type: "F", category: "Pet Ins" },
  { name: "Apple Subscriptions", monthly: 300, type: "V", category: "Subs", range: "$4-$80" },
  { name: "Campos Coffee", monthly: 200, type: "V", category: "Coffee", range: "$6-$96" },
  { name: "Qantas Insurance (Car)", monthly: 175, type: "F", category: "Car Ins" },
  { name: "Budget Direct (Car)", monthly: 163, type: "F", category: "Car Ins" },
  { name: "Linkt (Tolls)", monthly: 148, type: "V", category: "Tolls", range: "$20-$60" },
  { name: "Uber Eats", monthly: 140, type: "V", category: "Delivery", range: "$41-$121" },
  { name: "Telstra", monthly: 70, type: "F", category: "Phone" },
  { name: "Disney+", monthly: 16, type: "F", category: "Subs" },
  { name: "Binge", monthly: 19, type: "F", category: "Subs" },
  { name: "Ring Security", monthly: 15, type: "F", category: "Subs" },
  { name: "Uber One", monthly: 10, type: "F", category: "Subs" },
  { name: "Equifax", monthly: 10, type: "F", category: "Subs" },
];

// ── Helper: aggregate across months ──
function aggregateMonths(data: Record<string, Record<string, number>>, month: string): Record<string, number> {
  if (month === "All") {
    const agg: Record<string, number> = {};
    MONTHS.forEach((m) =>
      Object.entries(data[m] || {}).forEach(([k, v]) => {
        agg[k] = (agg[k] || 0) + v;
      })
    );
    return agg;
  }
  return data[month] || {};
}

export function Budget() {
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [recurringFilter, setRecurringFilter] = useState("all");

  const spend = useMemo(() => aggregateMonths(SPENDING, selectedMonth), [selectedMonth]);
  const income = useMemo(() => aggregateMonths(INCOME, selectedMonth), [selectedMonth]);

  const totalSpend = Object.values(spend).reduce((s, v) => s + v, 0);
  const totalIncome = Object.values(income).reduce((s, v) => s + v, 0);
  const net = totalIncome - totalSpend;
  const monthCount = selectedMonth === "All" ? 3.67 : 1;

  const categoryTotals = Object.entries(spend)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1]);
  const maxCategory = categoryTotals[0]?.[1] ?? 1;

  const monthlyTrend = MONTHS.map((m) => {
    const s = Object.values(SPENDING[m] || {}).reduce((a, v) => a + v, 0);
    const i = Object.values(INCOME[m] || {}).reduce((a, v) => a + v, 0);
    return { month: m, spend: s, income: i, delta: i - s };
  });
  const trendMax = Math.max(...monthlyTrend.map((z) => Math.max(z.spend, z.income)));

  const fixedTotal = RECURRING.filter((r) => r.type === "F").reduce((s, r) => s + r.monthly, 0);
  const variableTotal = RECURRING.filter((r) => r.type === "V").reduce((s, r) => s + r.monthly, 0);

  const filteredRecurring =
    recurringFilter === "fixed" ? RECURRING.filter((x) => x.type === "F") :
    recurringFilter === "variable" ? RECURRING.filter((x) => x.type === "V") :
    recurringFilter === "cuttable" ? RECURRING.filter((x) => !ESSENTIALS.has(x.category)) :
    RECURRING;

  const incomeSorted = Object.entries(income).sort((a, b) => b[1] - a[1]);

  // Finance state for Properties & Loans tab
  const finance = useFinance();
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [showLoanForm, setShowLoanForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | undefined>();
  const [editingLoan, setEditingLoan] = useState<Loan | undefined>();
  const [loanPropertyId, setLoanPropertyId] = useState<string | undefined>();

  return (
    <DashboardLayout title="Budget">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Drake Family Budget</h2>
          <p className="text-sm text-muted-foreground">Dec 2025 – Mar 20 2026</p>
        </div>

        {/* Month filter pills */}
        <div className="flex flex-wrap gap-2">
          {["All", ...MONTHS].map((m) => (
            <Button
              key={m}
              size="sm"
              variant={selectedMonth === m ? "default" : "outline"}
              className="rounded-full"
              onClick={() => setSelectedMonth(m)}
            >
              {m}
            </Button>
          ))}
        </div>

        {/* Tab views */}
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="income">Income</TabsTrigger>
            <TabsTrigger value="spending">Spending</TabsTrigger>
            <TabsTrigger value="recurring">Recurring</TabsTrigger>
            <TabsTrigger value="properties">Properties & Loans</TabsTrigger>
          </TabsList>

          {/* ════════ OVERVIEW ════════ */}
          <TabsContent value="overview" className="space-y-6 mt-4">
            {/* Stat cards with coloured accents */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
              <BudgetStatCard label="INCOME" value={fmt(totalIncome)} sub={`~${fmt(totalIncome / monthCount)}/mo`} accent="green" />
              <BudgetStatCard label="SPENDING" value={fmt(totalSpend)} sub={`~${fmt(totalSpend / monthCount)}/mo`} accent="red" />
              <BudgetStatCard label="NET" value={`${net >= 0 ? "+" : "-"}${fmt(net)}`} sub={`~${fmt(Math.abs(net / monthCount))}/mo`} accent={net >= 0 ? "green" : "red"} />
              <BudgetStatCard label="FIXED RECUR" value={`~${fmt(fixedTotal)}/mo`} sub={`${RECURRING.filter((r) => r.type === "F").length} items`} accent="cyan" />
              <BudgetStatCard label="VAR RECUR" value={`~${fmt(variableTotal)}/mo`} sub={`${RECURRING.filter((r) => r.type === "V").length} items`} accent="amber" />
            </div>

            {/* Monthly in vs out */}
            <GlassCard>
              <GlassCardHeader>
                <GlassCardTitle>Monthly In vs Out</GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent className="space-y-5">
                {monthlyTrend.map((row) => (
                  <div key={row.month}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="font-semibold">
                        {row.month}
                        {row.month === "Mar" && <span className="text-muted-foreground font-normal"> (partial)</span>}
                      </span>
                      <span className={`font-mono font-semibold ${row.delta >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {row.delta >= 0 ? "+" : ""}{fmt(row.delta)}
                      </span>
                    </div>
                    {([["IN", row.income, "bg-green-500"] as const, ["OUT", row.spend, "bg-red-500"] as const]).map(([label, value, bg]) => (
                      <div key={label} className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] text-muted-foreground w-7">{label}</span>
                        <div className="h-2.5 rounded-sm flex-1 bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-sm ${bg}`}
                            style={{ width: `${(value / trendMax) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono text-muted-foreground/60 min-w-[52px] text-right">{fmt(value)}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </GlassCardContent>
            </GlassCard>
          </TabsContent>

          {/* ════════ INCOME ════════ */}
          <TabsContent value="income" className="space-y-6 mt-4">
            {/* Income stat cards */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
              <GlassCard>
                <div className="text-[10px] font-bold tracking-widest text-muted-foreground">TOTAL</div>
                <div className="text-xl font-bold font-mono text-green-500">{fmt(totalIncome)}</div>
                <div className="text-xs text-muted-foreground/60">~{fmt(totalIncome / monthCount)}/mo</div>
              </GlassCard>
              {incomeSorted.map(([source, amount]) => (
                <GlassCard key={source}>
                  <div className="text-[10px] font-bold tracking-widest text-muted-foreground">{source.toUpperCase()}</div>
                  <div className="text-lg font-bold font-mono" style={{ color: INCOME_COLOURS[source] || "#22c55e" }}>
                    {fmt(amount / monthCount)}
                  </div>
                  <div className="text-xs text-muted-foreground/60">avg/mo ({fmt(amount)} total)</div>
                </GlassCard>
              ))}
            </div>

            {/* Monthly breakdown */}
            <GlassCard>
              <GlassCardHeader>
                <GlassCardTitle>Monthly Breakdown</GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent className="space-y-5">
                {MONTHS.map((m) => {
                  const data = INCOME[m] || {};
                  const total = Object.values(data).reduce((s, v) => s + v, 0);
                  const sources = Object.entries(data).sort((a, b) => b[1] - a[1]);
                  return (
                    <div key={m}>
                      <div className="flex items-center justify-between text-sm mb-1.5">
                        <span className="font-semibold">{m}</span>
                        <span className="font-mono font-bold text-green-500">{fmt(total)}</span>
                      </div>
                      {/* Stacked bar */}
                      <div className="flex h-3.5 rounded overflow-hidden mb-2">
                        {sources.map(([src, amt]) => (
                          <div
                            key={src}
                            style={{ width: `${(amt / total) * 100}%`, backgroundColor: INCOME_COLOURS[src] || "#525252", minWidth: 2 }}
                          />
                        ))}
                      </div>
                      {/* Legend */}
                      <div className="flex flex-wrap gap-x-3 gap-y-1">
                        {sources.map(([src, amt]) => (
                          <div key={src} className="flex items-center gap-1.5">
                            <div className="size-1.5 rounded-sm" style={{ backgroundColor: INCOME_COLOURS[src] || "#525252" }} />
                            <span className="text-xs text-muted-foreground">{src}</span>
                            <span className="text-xs font-mono text-muted-foreground/60">{fmt(amt)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </GlassCardContent>
            </GlassCard>

            {/* Fixed monthly income */}
            <GlassCard>
              <GlassCardHeader>
                <GlassCardTitle>Fixed Monthly Income</GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent>
                <div className="divide-y divide-border">
                  {([
                    { name: "Ryan (Ential) $3,010/fn", value: "~$6,520", colour: "#22c55e" },
                    { name: "Emily (Fairweather) $2,050/fn", value: "~$4,440", colour: "#34d399" },
                    { name: "Rental Income", value: "~$2,400", colour: "#06b6d4" },
                  ] as const).map((row) => (
                    <div key={row.name} className="flex items-center justify-between py-2 text-sm">
                      <span className="text-muted-foreground">{row.name}</span>
                      <span className="font-mono font-semibold" style={{ color: row.colour }}>{row.value}/mo</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between py-2.5 text-sm font-bold">
                    <span>Reliable Total</span>
                    <span className="font-mono text-green-500">~$13,360/mo</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Emily&apos;s family transfers ($1K-$5K variable) supplement the gap. Not counted as fixed.
                </p>
              </GlassCardContent>
            </GlassCard>
          </TabsContent>

          {/* ════════ SPENDING ════════ */}
          <TabsContent value="spending" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Category totals for {selectedMonth === "All" ? "full period" : selectedMonth}.
            </p>
            <GlassCard>
              <GlassCardContent className="space-y-1.5">
                {categoryTotals.map(([cat, total]) => (
                  <div key={cat} className="flex items-center gap-2">
                    <div className="size-2 rounded-sm shrink-0" style={{ backgroundColor: CATEGORY_COLOURS[cat] || "#525252" }} />
                    <span className="text-xs flex-1 truncate">{cat}</span>
                    <div className="w-28 h-2 bg-muted rounded-sm shrink-0 overflow-hidden">
                      <div
                        className="h-full rounded-sm"
                        style={{ width: `${(total / maxCategory) * 100}%`, backgroundColor: CATEGORY_COLOURS[cat] || "#525252" }}
                      />
                    </div>
                    <span className="text-xs font-mono text-muted-foreground min-w-[52px] text-right">{fmt(total)}</span>
                    <span className="text-[10px] text-muted-foreground/60 min-w-[48px] text-right">{fmt(total / monthCount)}/m</span>
                  </div>
                ))}
              </GlassCardContent>
            </GlassCard>
          </TabsContent>

          {/* ════════ RECURRING ════════ */}
          <TabsContent value="recurring" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Active last 45 days, 2+ months. EveryPlate excluded (cancelled).
            </p>

            {/* Recurring filter pills */}
            <div className="flex flex-wrap gap-2">
              {([
                { key: "all", label: `All (${fmt(fixedTotal + variableTotal)}/mo)` },
                { key: "fixed", label: `Fixed (${fmt(fixedTotal)}/mo)` },
                { key: "variable", label: `Variable (${fmt(variableTotal)}/mo)` },
                { key: "cuttable", label: "Cuttable" },
              ] as const).map((pill) => (
                <Button
                  key={pill.key}
                  size="sm"
                  variant={recurringFilter === pill.key ? "default" : "outline"}
                  className={`rounded-full ${pill.key === "cuttable" && recurringFilter === "cuttable" ? "bg-red-500 hover:bg-red-600 border-red-500" : ""}`}
                  onClick={() => setRecurringFilter(pill.key)}
                >
                  {pill.label}
                </Button>
              ))}
            </div>

            {/* Recurring items */}
            <div className="space-y-2">
              {filteredRecurring.map((item) => (
                <GlassCard
                  key={item.name}
                  className={!ESSENTIALS.has(item.category) ? "border border-zinc-700" : ""}
                >
                  <div className="flex items-center gap-3">
                    <div className="size-2 rounded-sm shrink-0" style={{ backgroundColor: CATEGORY_COLOURS[item.category] || "#525252" }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">{item.name}</div>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <Badge
                          variant="secondary"
                          className={
                            item.type === "F"
                              ? "bg-cyan-950 text-cyan-400 border-0"
                              : "bg-amber-950 text-amber-400 border-0"
                          }
                        >
                          {item.type === "F" ? "Fixed" : "Variable"}
                        </Badge>
                        {item.range && <span className="text-xs text-muted-foreground/60">{item.range}</span>}
                        <span className="text-xs text-muted-foreground/60">{item.category}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-base font-mono font-semibold">{fmt(item.monthly)}</div>
                      <div className="text-[10px] text-muted-foreground/60">avg/mo</div>
                    </div>
                    {!ESSENTIALS.has(item.category) && (
                      <Badge variant="destructive" className="text-[9px] px-1.5 py-0.5 shrink-0">REVIEW</Badge>
                    )}
                  </div>
                </GlassCard>
              ))}
            </div>

            {/* Total Fusion breakdown */}
            <GlassCard className="border border-orange-500/30">
              <GlassCardHeader>
                <GlassCardTitle className="text-orange-500 font-bold">Total Fusion Breakdown</GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    { month: "Dec", value: "$1,277", detail: "5 charges" },
                    { month: "Jan", value: "$1,917", detail: "7 charges" },
                    { month: "Feb", value: "$1,136", detail: "6 charges" },
                    { month: "Mar", value: "$565", detail: "3 (partial)" },
                  ] as const).map((row) => (
                    <div key={row.month} className="rounded-lg bg-muted p-3">
                      <div className="text-xs text-muted-foreground">{row.month}</div>
                      <div className="text-lg font-bold font-mono text-orange-500">{row.value}</div>
                      <div className="text-xs text-muted-foreground/60">{row.detail}</div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                  2 memberships (~$271 + ~$277 fortnightly) plus sessions ($15-$24).{" "}
                  <strong className="text-foreground">~$548/fn in memberships alone.</strong>
                </p>
              </GlassCardContent>
            </GlassCard>
          </TabsContent>

          {/* ════════ PROPERTIES & LOANS ════════ */}
          <TabsContent value="properties" className="space-y-6 mt-4">
            {/* Summary cards */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              <BudgetStatCard label="PROPERTIES" value={String(finance.properties.length)} accent="blue" />
              <BudgetStatCard label="ACTIVE LOANS" value={String(finance.loans.length)} accent="peach" />
              <BudgetStatCard label="TOTAL OUTSTANDING" value={fmt(finance.totalOutstanding)} accent="red" />
              <BudgetStatCard label="MONTHLY PAYMENTS" value={fmt(finance.totalMonthlyPayments)} sub="combined" accent="amber" />
            </div>

            {/* Properties */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Properties</h3>
                <button
                  onClick={() => { setEditingProperty(undefined); setShowPropertyForm(true); }}
                  className="flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-3 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  <Plus className="size-4" />
                  Add Property
                </button>
              </div>

              {finance.isLoading ? (
                <p className="text-muted-foreground text-sm">Loading...</p>
              ) : finance.properties.length === 0 ? (
                <GlassCard>
                  <GlassCardContent className="py-8 text-center">
                    <Building2 className="size-8 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="text-muted-foreground">No properties added yet.</p>
                  </GlassCardContent>
                </GlassCard>
              ) : (
                finance.properties.map((property) => {
                  const propertyLoans = finance.getLoansForProperty(property.id);
                  const totalOwed = propertyLoans.reduce((sum, l) => sum + (l.currentBalance || 0), 0);
                  const equity = (property.currentValue || 0) - totalOwed;

                  return (
                    <GlassCard key={property.id}>
                      <GlassCardContent className="pt-4">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <Building2 className="size-5 text-primary" />
                              <h4 className="font-medium text-lg">{property.name}</h4>
                              <span className="text-xs rounded-full border px-2 py-0.5 capitalize text-muted-foreground">
                                {property.type}
                              </span>
                            </div>
                            {property.address && (
                              <p className="text-sm text-muted-foreground mt-1">{property.address}</p>
                            )}
                          </div>
                          <button
                            onClick={() => { setEditingProperty(property); setShowPropertyForm(true); }}
                            className="text-xs text-primary hover:underline"
                          >
                            Edit
                          </button>
                        </div>

                        {/* Property metrics */}
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          {property.purchasePrice && (
                            <div>
                              <p className="text-xs text-muted-foreground">Purchase Price</p>
                              <p className="font-mono font-medium">{fmt(property.purchasePrice)}</p>
                            </div>
                          )}
                          {property.currentValue && (
                            <div>
                              <p className="text-xs text-muted-foreground">Current Value</p>
                              <p className="font-mono font-medium text-green-500">{fmt(property.currentValue)}</p>
                            </div>
                          )}
                          {property.currentValue && totalOwed > 0 && (
                            <div>
                              <p className="text-xs text-muted-foreground">Equity</p>
                              <p className={`font-mono font-medium ${equity >= 0 ? "text-green-500" : "text-red-500"}`}>
                                {equity >= 0 ? "" : "-"}{fmt(equity)}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Loans for this property */}
                        {propertyLoans.length > 0 && (
                          <div className="border-t pt-3 space-y-3">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium flex items-center gap-1.5">
                                <Landmark className="size-4 text-muted-foreground" />
                                Loans ({propertyLoans.length})
                              </p>
                              <button
                                onClick={() => { setLoanPropertyId(property.id); setEditingLoan(undefined); setShowLoanForm(true); }}
                                className="text-xs text-primary hover:underline"
                              >
                                + Add Loan
                              </button>
                            </div>
                            {propertyLoans.map((loan) => (
                              <div key={loan.id} className="rounded-lg bg-muted/50 p-3">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-medium">{loan.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {loan.lender && `${loan.lender} \u00B7 `}
                                      {loan.interestRate && `${loan.interestRate}% `}
                                      {loan.isFixedRate ? "Fixed" : "Variable"}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    {loan.currentBalance && (
                                      <p className="font-mono font-medium text-red-500">{fmt(loan.currentBalance)}</p>
                                    )}
                                    {loan.monthlyPayment && (
                                      <p className="text-xs text-muted-foreground">{fmt(loan.monthlyPayment)}/mo</p>
                                    )}
                                  </div>
                                </div>
                                {loan.isFixedRate && loan.fixedRateExpiry && (
                                  <p className="text-xs text-amber-500 mt-1">
                                    Fixed rate expires {new Date(loan.fixedRateExpiry).toLocaleDateString("en-AU")}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {propertyLoans.length === 0 && (
                          <div className="border-t pt-3">
                            <button
                              onClick={() => { setLoanPropertyId(property.id); setEditingLoan(undefined); setShowLoanForm(true); }}
                              className="text-sm text-primary hover:underline"
                            >
                              + Add a loan for this property
                            </button>
                          </div>
                        )}
                      </GlassCardContent>
                    </GlassCard>
                  );
                })
              )}
            </div>

            {/* Unlinked loans */}
            {finance.loans.filter((l) => !l.propertyId).length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-medium">Other Loans</h3>
                {finance.loans
                  .filter((l) => !l.propertyId)
                  .map((loan) => (
                    <GlassCard key={loan.id}>
                      <GlassCardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{loan.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {loan.lender && `${loan.lender} \u00B7 `}
                              {loan.type} \u00B7 {loan.interestRate && `${loan.interestRate}%`}
                            </p>
                          </div>
                          <div className="text-right">
                            {loan.currentBalance && (
                              <p className="font-mono font-medium text-red-500">{fmt(loan.currentBalance)}</p>
                            )}
                            {loan.monthlyPayment && (
                              <p className="text-xs text-muted-foreground">{fmt(loan.monthlyPayment)}/mo</p>
                            )}
                          </div>
                        </div>
                      </GlassCardContent>
                    </GlassCard>
                  ))}
              </div>
            )}

            {/* Add loan button (when no properties exist) */}
            {finance.properties.length === 0 && finance.loans.length === 0 && (
              <button
                onClick={() => { setLoanPropertyId(undefined); setEditingLoan(undefined); setShowLoanForm(true); }}
                className="text-sm text-primary hover:underline"
              >
                + Add a standalone loan
              </button>
            )}
          </TabsContent>
        </Tabs>

        {/* Property form dialog */}
        {showPropertyForm && (
          <PropertyForm
            existing={editingProperty}
            onSubmit={editingProperty
              ? (input) => finance.editProperty(editingProperty.id, input)
              : finance.addProperty
            }
            onClose={() => { setShowPropertyForm(false); setEditingProperty(undefined); }}
          />
        )}

        {/* Loan form dialog */}
        {showLoanForm && (
          <LoanForm
            propertyId={loanPropertyId}
            properties={finance.properties}
            existing={editingLoan}
            onSubmit={editingLoan
              ? (input) => finance.editLoan(editingLoan.id, input)
              : finance.addLoan
            }
            onClose={() => { setShowLoanForm(false); setEditingLoan(undefined); setLoanPropertyId(undefined); }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
