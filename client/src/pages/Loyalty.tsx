import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  GlassCard,
  GlassCardContent,
} from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDown,
  Check,
  Pencil,
  Loader2,
  Award,
  CreditCard,
  Gift,
} from "lucide-react";
import { fetchLoyaltyPrograms, updateLoyaltyProgram } from "@/lib/api";
import type { LoyaltyProgram } from "@shared/types/loyalty";

function formatPoints(points: number): string {
  return points.toLocaleString("en-AU");
}

export function Loyalty() {
  const [programs, setPrograms] = useState<LoyaltyProgram[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPoints, setEditPoints] = useState("");

  useEffect(() => {
    fetchLoyaltyPrograms().then((data) => {
      setPrograms(data);
      setIsLoading(false);
    });
  }, []);

  const handleSavePoints = async (id: string) => {
    const points = parseInt(editPoints.replace(/[^0-9]/g, ""));
    if (isNaN(points)) return;

    const updated = await updateLoyaltyProgram(id, { points });
    if (updated) {
      setPrograms((prev) =>
        prev.map((p) => (p.id === id ? updated : p))
      );
    }
    setEditingId(null);
  };

  const totalPoints = programs.reduce((sum, p) => sum + p.points, 0);

  return (
    <DashboardLayout title="Loyalty Programs">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-4xl font-normal">Loyalty Programs</h1>
          <p className="text-muted-foreground">
            Track your points, status tiers, and membership benefits.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Points summary */}
            <div className="flex items-center gap-4 rounded-xl bg-card border-2 border-border px-6 py-4">
              <Award className="size-6 text-primary" />
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Total Points Across All Programs
                </p>
                <p className="stat-number text-3xl text-foreground">
                  {formatPoints(totalPoints)}
                </p>
              </div>
            </div>

            {/* Program cards */}
            <div className="grid gap-6">
              {programs.map((program) => (
                <ProgramCard
                  key={program.id}
                  program={program}
                  isEditing={editingId === program.id}
                  editPoints={editPoints}
                  onStartEdit={() => {
                    setEditingId(program.id);
                    setEditPoints(formatPoints(program.points));
                  }}
                  onEditChange={setEditPoints}
                  onSave={() => handleSavePoints(program.id)}
                  onCancel={() => setEditingId(null)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

function ProgramCard({
  program,
  isEditing,
  editPoints,
  onStartEdit,
  onEditChange,
  onSave,
  onCancel,
}: {
  program: LoyaltyProgram;
  isEditing: boolean;
  editPoints: string;
  onStartEdit: () => void;
  onEditChange: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const [logoError, setLogoError] = useState(false);

  return (
    <GlassCard>
      <GlassCardContent>
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Logo */}
          <div className="flex items-start justify-center sm:justify-start shrink-0">
            <div
              className="flex size-20 items-center justify-center rounded-2xl overflow-hidden border-2 border-border bg-white"
              style={{ borderColor: program.colour + "30" }}
            >
              {!logoError ? (
                <img
                  src={program.logoUrl}
                  alt={program.name}
                  className="size-16 object-contain"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <CreditCard
                  className="size-8"
                  style={{ color: program.colour }}
                />
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-4">
            {/* Name + Status */}
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-lg font-bold">{program.name}</h3>
              <span
                className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold text-white"
                style={{ backgroundColor: program.colour }}
              >
                <Award className="size-3" />
                {program.statusTier}
              </span>
            </div>

            {/* Points */}
            <div className="flex items-center gap-3">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={editPoints}
                    onChange={(e) => onEditChange(e.target.value)}
                    className="h-10 w-40 font-mono text-lg font-bold"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") onSave();
                      if (e.key === "Escape") onCancel();
                    }}
                  />
                  <Button
                    size="icon"
                    className="h-10 w-10 rounded-full"
                    onClick={onSave}
                  >
                    <Check className="size-4" />
                  </Button>
                </div>
              ) : (
                <button
                  onClick={onStartEdit}
                  className="group/pts flex items-center gap-2"
                >
                  <span className="stat-number text-4xl" style={{ color: program.colour }}>
                    {formatPoints(program.points)}
                  </span>
                  <span className="text-sm text-muted-foreground">pts</span>
                  <Pencil className="size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover/pts:opacity-100" />
                </button>
              )}
            </div>

            {/* Member number */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CreditCard className="size-3.5" />
              Member #{program.memberNumber}
            </div>

            {/* Benefits */}
            <Collapsible>
              <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                <Gift className="size-4" />
                <span>{program.statusTier} Benefits</span>
                <ChevronDown className="size-4" />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-3">
                <ul className="space-y-2">
                  {program.benefits.map((benefit, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <Check
                        className="size-4 shrink-0 mt-0.5"
                        style={{ color: program.colour }}
                      />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </GlassCardContent>
    </GlassCard>
  );
}
