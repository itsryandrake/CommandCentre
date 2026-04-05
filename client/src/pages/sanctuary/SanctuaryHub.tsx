import { Link } from "wouter";
import { Flame, Users, Sparkles, LayoutGrid } from "lucide-react";
import { SanctuaryLayout } from "@/components/sanctuary/SanctuaryLayout";
import {
  GlassCard,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardContent,
} from "@/components/ui/glass-card";
import { DesiresBoundaries } from "@/components/sanctuary/DesiresBoundaries";
import { SafeWords } from "@/components/sanctuary/SafeWords";
import { CollectionManager } from "@/components/sanctuary/CollectionManager";

const featureCards = [
  {
    icon: Flame,
    label: "Hub",
    desc: "Your sanctuary dashboard",
    href: "/sanctuary",
    current: true,
  },
  {
    icon: Users,
    label: "Profiles",
    desc: "Review desires & blueprints",
    href: "/sanctuary/profiles",
    current: false,
  },
  {
    icon: Sparkles,
    label: "Intimacy",
    desc: "Games & inspiration for tonight",
    href: "/sanctuary/intimacy",
    current: false,
  },
  {
    icon: LayoutGrid,
    label: "Vision Board",
    desc: "Pin your visual inspiration",
    href: "/sanctuary/vision-board",
    current: false,
  },
] as const;

export default function SanctuaryHub() {
  return (
    <SanctuaryLayout title="The Sanctuary">
      {/* Hero */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          The Sanctuary
        </h1>
        <p className="mt-1 text-lg text-muted-foreground">Em + I</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Our private space for connection, play, and exploration.
        </p>
      </div>

      {/* Feature card grid */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {featureCards.map((card) => {
          const Icon = card.icon;
          const content = (
            <GlassCard
              key={card.label}
              className={`cursor-pointer transition-all hover:scale-[1.02] ${
                card.current ? "border-2 border-primary/40" : ""
              }`}
            >
              <GlassCardHeader>
                <Icon className="h-5 w-5 text-primary" />
              </GlassCardHeader>
              <GlassCardContent>
                <p className="font-semibold">{card.label}</p>
                <p className="text-xs text-muted-foreground">{card.desc}</p>
              </GlassCardContent>
            </GlassCard>
          );

          if (card.current) {
            return <div key={card.label}>{content}</div>;
          }

          return (
            <Link key={card.label} href={card.href}>
              {content}
            </Link>
          );
        })}
      </div>

      {/* Sections */}
      <div className="flex flex-col gap-6">
        <DesiresBoundaries />
        <SafeWords />
        <CollectionManager />
      </div>
    </SanctuaryLayout>
  );
}
