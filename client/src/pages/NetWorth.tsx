import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useFinance } from "@/hooks/useFinance";
import { NetWorthPieChart } from "@/components/net-worth/NetWorthPieChart";
import { CategoryCard } from "@/components/net-worth/CategoryCard";
import { AddAssetDialog } from "@/components/net-worth/AddAssetDialog";
import { AddDebtDialog } from "@/components/net-worth/AddDebtDialog";
import { Plus, Loader2 } from "lucide-react";
import type { AssetType } from "@shared/types/finance";

const ASSET_CATEGORY_ORDER: AssetType[] = ["bank", "property", "vehicle", "investment", "retirement_fund", "other"];

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

export default function NetWorth() {
  const finance = useFinance();
  const [showAddAsset, setShowAddAsset] = useState(false);
  const [showAddDebt, setShowAddDebt] = useState(false);

  const assetCategories = useMemo(() => {
    return ASSET_CATEGORY_ORDER.map((type) => {
      const items = (finance.assetsByType[type] || []).map((a) => ({
        id: a.id,
        name: a.name,
        value: a.currentValue || 0,
      }));
      const total = items.reduce((s, i) => s + i.value, 0);
      return { type, label: ASSET_LABELS[type], items, total };
    });
  }, [finance.assetsByType]);

  const debtCategories = useMemo(() => {
    const { loans: loanItems, otherDebts } = finance.loansByCategory;
    return [
      {
        key: "loans",
        label: "Loans",
        items: loanItems.map((l) => ({ id: l.id, name: l.name, value: l.currentBalance || 0 })),
        total: loanItems.reduce((s, l) => s + (l.currentBalance || 0), 0),
      },
      {
        key: "other",
        label: "Other Debts",
        items: otherDebts.map((l) => ({ id: l.id, name: l.name, value: l.currentBalance || 0 })),
        total: otherDebts.reduce((s, l) => s + (l.currentBalance || 0), 0),
      },
    ];
  }, [finance.loansByCategory]);

  if (finance.isLoading) {
    return (
      <DashboardLayout title="Net Worth">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Net Worth">
      <div className="space-y-6">
        {/* Chart — full width above columns */}
        <NetWorthPieChart
          assets={finance.assets}
          loans={finance.loans}
          totalAssets={finance.totalAssets}
          totalDebts={finance.totalOutstanding}
          netWorth={finance.netWorth}
        />

        {/* Assets & Debts side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assets */}
        <div className="space-y-3">
          <div className="flex items-baseline justify-between mb-1">
            <div>
              <h2 className="text-lg font-bold text-emerald-600">Assets</h2>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">What I Own</p>
            </div>
            <span className="text-lg font-bold text-emerald-600">{fmt(finance.totalAssets)}</span>
          </div>

          {assetCategories.map((cat) => (
            <CategoryCard
              key={cat.type}
              label={cat.label}
              items={cat.items}
              total={cat.total}
              variant="asset"
              emptyMessage={cat.items.length === 0 ? `No ${cat.label.toLowerCase()}` : undefined}
            />
          ))}

          <button
            onClick={() => setShowAddAsset(true)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-semibold text-sm hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Asset
          </button>
        </div>

        {/* Right: Debts */}
        <div className="space-y-3">
          <div className="flex items-baseline justify-between mb-1">
            <div>
              <h2 className="text-lg font-bold text-rose-500">Debts</h2>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">What I Owe</p>
            </div>
            <span className="text-lg font-bold text-rose-500">
              {finance.totalOutstanding > 0 ? `(${fmt(finance.totalOutstanding)})` : fmt(0)}
            </span>
          </div>

          {/* Show empty placeholders alongside asset categories */}
          {assetCategories.map((cat) => {
            const relatedDebts = finance.loans.filter((l) => {
              const asset = finance.assets.find((a) => a.id === l.assetId);
              return asset?.type === cat.type;
            });
            if (relatedDebts.length === 0) {
              return (
                <div
                  key={`debt-${cat.type}`}
                  className="rounded-xl border border-white/20 bg-white/60 dark:bg-white/5 backdrop-blur-sm px-4 py-3"
                >
                  <span className="text-xs text-gray-300 dark:text-gray-600">No related debts</span>
                </div>
              );
            }
            return null;
          })}

          {debtCategories.map((cat) =>
            cat.items.length > 0 ? (
              <CategoryCard
                key={cat.key}
                label={cat.label}
                items={cat.items}
                total={cat.total}
                variant="debt"
              />
            ) : null
          )}

          <button
            onClick={() => setShowAddDebt(true)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 font-semibold text-sm hover:bg-rose-200 dark:hover:bg-rose-900/50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Debt
          </button>
        </div>
      </div>
      </div>

      <AddAssetDialog open={showAddAsset} onOpenChange={setShowAddAsset} onSubmit={finance.addAsset} />
      <AddDebtDialog
        open={showAddDebt}
        onOpenChange={setShowAddDebt}
        onSubmit={finance.addLoan}
        assets={finance.assets}
      />
    </DashboardLayout>
  );
}
