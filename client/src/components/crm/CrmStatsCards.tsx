import type { CrmStats } from "@shared/types/crm";
import {
  GlassCard,
  GlassCardContent,
} from "@/components/ui/glass-card";
import { Users, AlertTriangle, Cake, UserCheck } from "lucide-react";

interface CrmStatsCardsProps {
  stats: CrmStats;
  isLoading: boolean;
}

export function CrmStatsCards({ stats, isLoading }: CrmStatsCardsProps) {
  const cards = [
    {
      label: "Total Contacts",
      value: stats.totalContacts,
      icon: Users,
      colour: "text-primary",
    },
    {
      label: "Healthy",
      value: stats.totalContacts - stats.overdueCount,
      icon: UserCheck,
      colour: "text-green-600",
    },
    {
      label: "Overdue",
      value: stats.overdueCount,
      icon: AlertTriangle,
      colour: "text-orange-600",
    },
    {
      label: "Upcoming Birthdays",
      value: stats.upcomingBirthdays.length,
      icon: Cake,
      colour: "text-pink-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <GlassCard key={card.label}>
          <GlassCardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  {card.label}
                </p>
                <p className={`text-2xl font-bold mt-1 ${card.colour}`}>
                  {isLoading ? "—" : card.value}
                </p>
              </div>
              <card.icon className={`size-5 ${card.colour} opacity-60`} />
            </div>
          </GlassCardContent>
        </GlassCard>
      ))}
    </div>
  );
}
