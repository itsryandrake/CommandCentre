import { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { Asset, Loan } from "@shared/types/finance";

const ASSET_COLOURS: Record<string, string> = {
  property: "#3b82f6",
  vehicle: "#1d4ed8",
  investment: "#93c5fd",
  retirement_fund: "#60a5fa",
  bank: "#1e293b",
  other: "#f472b6",
};

const DEBT_COLOURS: Record<string, string> = {
  loans: "#f472b6",
  other_debts: "#fbbf24",
};

const ASSET_LABELS: Record<string, string> = {
  property: "Property",
  vehicle: "Vehicles",
  investment: "Investments",
  retirement_fund: "Superannuation",
  bank: "Bank",
  other: "Other Assets",
};

const fmt = (n: number) =>
  "$" + Math.abs(n).toLocaleString("en-AU", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

interface Props {
  assets: Asset[];
  loans: Loan[];
  totalAssets: number;
  totalDebts: number;
  netWorth: number;
}

export function NetWorthPieChart({ assets, loans, totalAssets, totalDebts, netWorth }: Props) {
  const assetData = useMemo(() => {
    const byType: Record<string, number> = {};
    for (const a of assets) {
      const t = a.type;
      byType[t] = (byType[t] || 0) + (a.currentValue || 0);
    }
    return Object.entries(byType)
      .filter(([, v]) => v > 0)
      .map(([type, value]) => ({
        name: ASSET_LABELS[type] || type,
        value,
        colour: ASSET_COLOURS[type] || "#94a3b8",
      }))
      .sort((a, b) => b.value - a.value);
  }, [assets]);

  const debtData = useMemo(() => {
    const loanTotal = loans.filter((l) => l.type !== "other").reduce((s, l) => s + (l.currentBalance || 0), 0);
    const otherTotal = loans.filter((l) => l.type === "other").reduce((s, l) => s + (l.currentBalance || 0), 0);
    const result = [];
    if (loanTotal > 0) result.push({ name: "Loans", value: loanTotal, colour: DEBT_COLOURS.loans });
    if (otherTotal > 0) result.push({ name: "Other Debts", value: otherTotal, colour: DEBT_COLOURS.other_debts });
    return result;
  }, [loans]);

  const netWorthData = useMemo(() => {
    const result = [];
    if (totalAssets > 0) result.push({ name: "Assets", value: totalAssets, colour: "#10b981" });
    if (totalDebts > 0) result.push({ name: "Debts", value: totalDebts, colour: "#f43f5e" });
    return result;
  }, [totalAssets, totalDebts]);

  return (
    <div className="rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-white/20 p-6">
      <Tabs defaultValue="net-worth">
        <TabsList className="w-full max-w-sm mx-auto grid grid-cols-3">
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="net-worth">Net Worth</TabsTrigger>
          <TabsTrigger value="debt">Debt</TabsTrigger>
        </TabsList>

        <TabsContent value="assets">
          <div className="text-center mt-2">
            <span className="text-3xl font-bold text-emerald-600">{fmt(totalAssets)}</span>
          </div>
          <ChartRing data={assetData} />
          <Legend items={assetData} />
        </TabsContent>

        <TabsContent value="net-worth">
          <div className="text-center mt-2">
            <span className={`text-3xl font-bold ${netWorth >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
              {netWorth < 0 ? `(${fmt(Math.abs(netWorth))})` : fmt(netWorth)}
            </span>
          </div>
          <ChartRing data={netWorthData} />
          <Legend items={[
            ...assetData,
            { name: "Loans", value: -debtData.find(d => d.name === "Loans")?.value! || 0, colour: DEBT_COLOURS.loans },
            { name: "Other Debts", value: -debtData.find(d => d.name === "Other Debts")?.value! || 0, colour: DEBT_COLOURS.other_debts },
          ].filter(i => i.value !== 0)} />
        </TabsContent>

        <TabsContent value="debt">
          <div className="text-center mt-2">
            <span className="text-3xl font-bold text-rose-500">({fmt(totalDebts)})</span>
          </div>
          <ChartRing data={debtData} />
          <Legend items={debtData.map(d => ({ ...d, value: -d.value }))} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ChartRing({ data }: { data: { name: string; value: number; colour: string }[] }) {
  if (data.length === 0) {
    return <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">No data</div>;
  }
  return (
    <div className="h-72 mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={120}
            paddingAngle={2}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.colour} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => fmt(Math.abs(value))}
            contentStyle={{ borderRadius: 8, fontSize: 13 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function Legend({ items }: { items: { name: string; value: number; colour: string }[] }) {
  return (
    <div className="space-y-1.5 mt-4 max-w-md mx-auto">
      {items.map((item) => (
        <div key={item.name} className="flex items-center gap-2 text-sm">
          <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.colour }} />
          <span className="text-muted-foreground">{item.name}</span>
          <span className="ml-auto font-semibold">
            {item.value < 0 ? `(${fmt(Math.abs(item.value))})` : fmt(item.value)}
          </span>
        </div>
      ))}
    </div>
  );
}
