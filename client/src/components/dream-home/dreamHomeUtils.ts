import type { DreamHomeTagGroup } from "@shared/types/dreamHome";
import { DREAMHOME_TAG_GROUPS } from "@shared/types/dreamHome";

export const TAG_GROUP_COLOURS: Record<DreamHomeTagGroup, string> = {
  Rooms: "bg-blue-500/80",
  Design: "bg-purple-500/80",
};

export function getTagGroup(tag: string): DreamHomeTagGroup | null {
  for (const [group, tags] of Object.entries(DREAMHOME_TAG_GROUPS)) {
    if ((tags as readonly string[]).includes(tag)) return group as DreamHomeTagGroup;
  }
  return null;
}

export function getTagColour(tag: string): string {
  const group = getTagGroup(tag);
  return group ? TAG_GROUP_COLOURS[group] : "bg-neutral-500/80";
}
