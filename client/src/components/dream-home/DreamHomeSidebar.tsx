import { ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { getTagGroup } from "./dreamHomeUtils";

export function DreamHomeSidebar({
  tagCounts,
  activeTags,
  onToggleTag,
  onClearTags,
}: {
  tagCounts: Record<string, number>;
  activeTags: string[];
  onToggleTag: (tag: string) => void;
  onClearTags: () => void;
}) {
  const usedTags = Object.keys(tagCounts).filter((t) => tagCounts[t] > 0);
  const roomTags = usedTags.filter((t) => getTagGroup(t) === "Rooms").sort();
  const designTags = usedTags.filter((t) => getTagGroup(t) === "Design").sort();
  const otherTags = usedTags.filter((t) => !getTagGroup(t)).sort();

  if (usedTags.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold">Filters</p>
          {activeTags.length > 0 && (
            <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {activeTags.length}
            </span>
          )}
        </div>
        {activeTags.length > 0 && (
          <button
            onClick={onClearTags}
            className="text-xs text-primary hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Rooms */}
      {roomTags.length > 0 && (
        <TagGroup
          label="Rooms"
          tags={roomTags}
          tagCounts={tagCounts}
          activeTags={activeTags}
          onToggleTag={onToggleTag}
        />
      )}

      {/* Design */}
      {designTags.length > 0 && (
        <TagGroup
          label="Design"
          tags={designTags}
          tagCounts={tagCounts}
          activeTags={activeTags}
          onToggleTag={onToggleTag}
        />
      )}

      {/* Other */}
      {otherTags.length > 0 && (
        <TagGroup
          label="Other"
          tags={otherTags}
          tagCounts={tagCounts}
          activeTags={activeTags}
          onToggleTag={onToggleTag}
        />
      )}
    </div>
  );
}

function TagGroup({
  label,
  tags,
  tagCounts,
  activeTags,
  onToggleTag,
}: {
  label: string;
  tags: string[];
  tagCounts: Record<string, number>;
  activeTags: string[];
  onToggleTag: (tag: string) => void;
}) {
  return (
    <Collapsible defaultOpen>
      <CollapsibleTrigger className="flex w-full items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors [&[data-state=open]>svg]:rotate-90">
        <ChevronRight className="h-3.5 w-3.5 transition-transform duration-200" />
        {label}
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-1">
        <div className="space-y-0.5">
          {tags.map((tag) => {
            const isActive = activeTags.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => onToggleTag(tag)}
                className={cn(
                  "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-foreground/80 hover:bg-muted"
                )}
              >
                <span className="truncate">{tag}</span>
                <span className={cn(
                  "ml-2 shrink-0 text-xs tabular-nums",
                  isActive ? "text-primary/70" : "text-muted-foreground"
                )}>
                  {tagCounts[tag]}
                </span>
              </button>
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function DreamHomeSidebarWrapper({
  tagCounts,
  activeTags,
  onToggleTag,
  onClearTags,
}: {
  tagCounts: Record<string, number>;
  activeTags: string[];
  onToggleTag: (tag: string) => void;
  onClearTags: () => void;
}) {
  return (
    <aside className="hidden w-64 shrink-0 lg:block">
      <ScrollArea className="h-[calc(100vh-8rem)]">
        <div className="pr-3">
          <DreamHomeSidebar
            tagCounts={tagCounts}
            activeTags={activeTags}
            onToggleTag={onToggleTag}
            onClearTags={onClearTags}
          />
        </div>
      </ScrollArea>
    </aside>
  );
}
