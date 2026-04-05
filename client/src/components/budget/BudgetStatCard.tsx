import { GlassCard } from "@/components/ui/glass-card";

interface BudgetStatCardProps {
  label: string;
  value: string;
  sub?: string;
  accent?: "green" | "peach" | "blue" | "neutral" | "red" | "amber" | "cyan";
}

const ACCENT_STYLES: Record<string, string> = {
  green: "bg-green-50/80 dark:bg-green-950/30",
  peach: "bg-orange-50/80 dark:bg-orange-950/30",
  blue: "bg-blue-50/80 dark:bg-blue-950/30",
  red: "bg-red-50/80 dark:bg-red-950/30",
  amber: "bg-amber-50/80 dark:bg-amber-950/30",
  cyan: "bg-cyan-50/80 dark:bg-cyan-950/30",
  neutral: "",
};

const TEXT_STYLES: Record<string, string> = {
  green: "text-green-600 dark:text-green-400",
  peach: "text-orange-600 dark:text-orange-400",
  blue: "text-blue-600 dark:text-blue-400",
  red: "text-red-600 dark:text-red-400",
  amber: "text-amber-600 dark:text-amber-400",
  cyan: "text-cyan-600 dark:text-cyan-400",
  neutral: "text-foreground",
};

export function BudgetStatCard({ label, value, sub, accent = "neutral" }: BudgetStatCardProps) {
  return (
    <GlassCard className={ACCENT_STYLES[accent]}>
      <div className="text-[10px] font-bold tracking-widest text-muted-foreground">{label}</div>
      <div className={`text-xl font-bold font-mono ${TEXT_STYLES[accent]}`}>{value}</div>
      {sub && <div className="text-xs text-muted-foreground/60">{sub}</div>}
    </GlassCard>
  );
}
