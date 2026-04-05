import { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import type { PartnerProfile, EroticRecipe } from "@/data/sanctuary/profilesData";

interface ProfileCardProps {
  profile: PartnerProfile;
  recipe?: EroticRecipe;
}

function CollapsibleSection({
  title,
  items,
}: {
  title: string;
  items: readonly string[];
}) {
  const [open, setOpen] = useState(false);

  if (items.length === 0) return null;

  return (
    <div className="border-t border-border pt-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
      >
        {title}
        {open ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>
      {open && (
        <ul className="mt-2 space-y-1.5">
          {items.map((item, i) => (
            <li
              key={i}
              className="text-sm text-muted-foreground pl-3 border-l-2 border-primary/30"
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function IgniteIdeasSection({
  ideas,
}: {
  ideas: EroticRecipe["igniteIdeas"];
}) {
  const [open, setOpen] = useState(false);

  if (ideas.length === 0) return null;

  return (
    <div className="border-t border-border pt-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
      >
        Ignite Ideas
        {open ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>
      {open && (
        <div className="mt-2 grid gap-2">
          {ideas.map((idea, i) => (
            <div
              key={i}
              className="flex items-start gap-2 rounded-lg bg-muted/50 p-2.5"
            >
              <span className="text-lg leading-none mt-0.5">{idea.icon}</span>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {idea.title}
                </p>
                <p className="text-xs text-muted-foreground">{idea.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ProfileCard({ profile, recipe }: ProfileCardProps) {
  return (
    <GlassCard className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-primary text-2xl font-bold text-primary">
          {profile.initial}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">{profile.name}</h2>
          <p className="text-sm text-primary">{profile.role}</p>
        </div>
      </div>

      {/* BDSM Traits */}
      {profile.bdsmTraits.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            BDSM Traits
          </h3>
          <div className="space-y-2">
            {profile.bdsmTraits.map((trait) => (
              <div key={trait.name} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground/70">{trait.name}</span>
                  <span className="text-muted-foreground">{trait.percentage}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${trait.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sex Map Tags */}
      {profile.sexMapTags.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Sex Map
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {profile.sexMapTags.map((tag) => (
              <Badge
                key={tag.name}
                variant={tag.highlight ? "default" : "secondary"}
                className={
                  tag.highlight
                    ? "bg-primary/20 text-primary border-primary/30"
                    : ""
                }
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Erotic Blueprint */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Erotic Blueprint
        </h3>
        <div className="rounded-lg bg-muted/50 p-3">
          <p className="text-sm font-semibold text-primary">
            {profile.eroticBlueprint.type}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {profile.eroticBlueprint.description}
          </p>
          {profile.eroticBlueprint.quizUrl && (
            <a
              href={profile.eroticBlueprint.quizUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="outline"
                size="sm"
                className="mt-2 gap-1.5 text-xs"
              >
                Take the Quiz
                <ExternalLink className="h-3 w-3" />
              </Button>
            </a>
          )}
        </div>
      </div>

      {/* Human Design */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Human Design
        </h3>
        <div className="rounded-lg bg-muted/50 p-3 space-y-1.5">
          <p className="text-sm font-semibold text-foreground">
            {profile.humanDesign.type}
          </p>
          <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
            <span>Strategy: {profile.humanDesign.strategy}</span>
            <span>Authority: {profile.humanDesign.authority}</span>
            <span>Signature: {profile.humanDesign.signature}</span>
            <span>Not-Self: {profile.humanDesign.notSelf}</span>
          </div>
          <p className="text-xs text-muted-foreground/70 italic">
            {profile.humanDesign.birthDetails}
          </p>
        </div>
      </div>

      {/* Love Languages */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Love Languages
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Receives</p>
            {profile.loveLanguages.receives.map((lang) => (
              <p key={lang.rank} className="text-sm text-foreground/80">
                <span className="text-primary mr-1.5">#{lang.rank}</span>
                {lang.name}
              </p>
            ))}
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Gives</p>
            {profile.loveLanguages.gives.map((lang) => (
              <p key={lang.rank} className="text-sm text-foreground/80">
                <span className="text-primary mr-1.5">#{lang.rank}</span>
                {lang.name}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Erotic Recipes */}
      {recipe && (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Erotic Recipe — {recipe.name}
          </h3>
          <CollapsibleSection
            title="Pre-Heating"
            items={recipe.preHeating}
          />
          <CollapsibleSection
            title="Smoke Signals"
            items={recipe.smokeSignals}
          />
          <CollapsibleSection
            title="Fire-Starters"
            items={recipe.fireStarters}
          />
          <CollapsibleSection
            title="Lumps of Coal"
            items={recipe.lumpsOfCoal}
          />
          <CollapsibleSection
            title="Closed for Business"
            items={recipe.closedForBusiness}
          />
          <CollapsibleSection title="Cool-Down" items={recipe.coolDown} />
          <IgniteIdeasSection ideas={recipe.igniteIdeas} />
        </div>
      )}
    </GlassCard>
  );
}
