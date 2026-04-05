import {
  GlassCard,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardContent,
} from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { desireCategories } from "@/data/sanctuary/hubData";

function getBadgeProps(title: string) {
  switch (title) {
    case "TRIED & LOVED":
      return {
        variant: "default" as const,
        className: "bg-primary text-primary-foreground border-primary hover:bg-primary/90",
      };
    case "WANT TO TRY":
      return { variant: "default" as const };
    case "CURIOUS ABOUT":
      return { variant: "secondary" as const };
    case "BOUNDARIES":
      return { variant: "outline" as const, className: "border-destructive text-destructive" };
    default:
      return { variant: "default" as const };
  }
}

export function DesiresBoundaries() {
  return (
    <GlassCard>
      <GlassCardHeader>
        <GlassCardTitle>Desires & Boundaries</GlassCardTitle>
      </GlassCardHeader>
      <GlassCardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {desireCategories.map((category) => (
            <GlassCard key={category.title} variant="solid">
              <GlassCardHeader>
                <GlassCardTitle className="text-xs uppercase tracking-wider">
                  {category.title}
                </GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent>
                <div className="flex flex-wrap gap-2">
                  {category.items.length > 0 ? (
                    category.items.map((item) => {
                      const badgeProps = getBadgeProps(category.title);
                      return (
                        <Badge
                          key={item}
                          variant={badgeProps.variant}
                          className={badgeProps.className}
                        >
                          {item}
                        </Badge>
                      );
                    })
                  ) : (
                    <p className="text-xs italic text-muted-foreground">
                      {category.emptyText}
                    </p>
                  )}
                </div>
              </GlassCardContent>
            </GlassCard>
          ))}
        </div>
      </GlassCardContent>
    </GlassCard>
  );
}
