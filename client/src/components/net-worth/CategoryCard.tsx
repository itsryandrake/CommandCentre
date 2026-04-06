import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

const fmt = (n: number) =>
  "$" + Math.abs(n).toLocaleString("en-AU", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

interface CategoryItem {
  id: string;
  name: string;
  value: number;
}

interface Props {
  label: string;
  items: CategoryItem[];
  total: number;
  variant: "asset" | "debt";
  emptyMessage?: string;
}

export function CategoryCard({ label, items, total, variant, emptyMessage }: Props) {
  const [open, setOpen] = useState(false);
  const isAsset = variant === "asset";

  if (items.length === 0 && !emptyMessage) return null;

  const headerBg = isAsset ? "bg-emerald-600" : "bg-rose-400";
  const headerText = "text-white";
  const displayTotal = isAsset ? fmt(total) : `(${fmt(total)})`;

  return (
    <div className="rounded-xl overflow-hidden border border-white/20 bg-white/60 dark:bg-white/5 backdrop-blur-sm">
      {items.length > 0 ? (
        <>
          <button
            onClick={() => setOpen(!open)}
            className={`w-full flex items-center gap-3 px-4 py-3 ${headerBg} ${headerText} transition-colors`}
          >
            <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </span>
            <span className="font-semibold text-sm">{label}</span>
            <span className="ml-auto font-bold text-sm">{displayTotal}</span>
          </button>

          {open && (
            <div className="divide-y divide-gray-100 dark:divide-white/10">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="w-6 h-6 rounded-full bg-amber-600 shrink-0" />
                  <span className="text-sm font-medium truncate">{item.name}</span>
                  <span className="ml-auto text-sm font-bold whitespace-nowrap">
                    {isAsset ? fmt(item.value) : `(${fmt(item.value)})`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="flex items-center gap-3 px-4 py-3">
          <span className="text-xs text-gray-400 font-medium">{label}</span>
          <span className="ml-auto text-xs text-gray-300 dark:text-gray-500">
            {emptyMessage || "No items"}
          </span>
        </div>
      )}
    </div>
  );
}

interface SummaryCategoryProps {
  label: string;
  count: number;
  total: number;
  variant: "asset" | "debt";
}

export function SummaryCategory({ label, count, total, variant }: SummaryCategoryProps) {
  const isAsset = variant === "asset";
  const displayTotal = isAsset ? fmt(total) : `(${fmt(total)})`;

  return (
    <div className="rounded-xl overflow-hidden border border-white/20 bg-white/60 dark:bg-white/5 backdrop-blur-sm">
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="text-xs font-semibold text-muted-foreground bg-muted rounded-full w-6 h-6 flex items-center justify-center">
          {count}
        </span>
        <span className="text-sm font-medium">{label}</span>
        <span className="ml-auto text-sm font-bold">{displayTotal}</span>
      </div>
    </div>
  );
}
