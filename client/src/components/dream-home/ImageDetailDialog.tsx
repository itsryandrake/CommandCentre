import { useState, useEffect } from "react";
import { ExternalLink, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { updateDreamHomeImage } from "@/lib/api";
import type { DreamHomeImage } from "@shared/types/dreamHome";
import { DREAMHOME_TAG_GROUPS, ALL_TAGS } from "@shared/types/dreamHome";
import { cn } from "@/lib/utils";
import { getTagColour } from "./dreamHomeUtils";

export function ImageDetailDialog({
  image,
  open,
  onOpenChange,
  onDelete,
  onTagsChange,
}: {
  image: DreamHomeImage | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (id: string) => void;
  onTagsChange: (id: string, tags: string[]) => void;
}) {
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState("");
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [tagPickerSearch, setTagPickerSearch] = useState("");

  useEffect(() => {
    if (image) {
      setNotesValue(image.notes || "");
      setEditingNotes(false);
      setShowTagPicker(false);
      setTagPickerSearch("");
    }
  }, [image]);

  if (!image) return null;

  const currentTags = image.tags.map((t) => t.tag);

  const handleSaveNotes = async () => {
    await updateDreamHomeImage(image.id, { notes: notesValue });
    setEditingNotes(false);
  };

  const handleToggleTag = (tag: string) => {
    const tagStrings = currentTags as string[];
    const newTags = tagStrings.includes(tag)
      ? tagStrings.filter((t) => t !== tag)
      : [...tagStrings, tag];
    onTagsChange(image.id, newTags);
  };

  const filteredTaxonomy = tagPickerSearch
    ? ALL_TAGS.filter((t) => t.toLowerCase().includes(tagPickerSearch.toLowerCase()))
    : ALL_TAGS;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">
            {image.title || image.aiDescription || "Inspiration"}
          </DialogTitle>
          <DialogDescription className="sr-only">Image detail view</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Image */}
          <div className="overflow-hidden rounded-xl">
            <img
              src={image.imageUrl}
              alt={image.aiDescription || ""}
              className="w-full object-contain max-h-[50vh]"
            />
          </div>

          {/* AI description */}
          {image.aiDescription && (
            <p className="text-sm text-muted-foreground italic">
              {image.aiDescription}
            </p>
          )}

          {/* Tags */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                Tags
              </p>
              <button
                onClick={() => setShowTagPicker(!showTagPicker)}
                className="text-xs text-primary hover:underline"
              >
                {showTagPicker ? "Done" : "Edit tags"}
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {currentTags.map((tag) => (
                <span
                  key={tag}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-white",
                    getTagColour(tag)
                  )}
                >
                  {tag}
                  {showTagPicker && (
                    <button
                      onClick={() => handleToggleTag(tag)}
                      className="ml-0.5 hover:text-white/70"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </span>
              ))}
              {currentTags.length === 0 && (
                <span className="text-xs text-muted-foreground">No tags</span>
              )}
            </div>

            {/* Tag picker */}
            {showTagPicker && (
              <div className="space-y-2 rounded-lg border p-3 bg-card">
                <input
                  type="text"
                  value={tagPickerSearch}
                  onChange={(e) => setTagPickerSearch(e.target.value)}
                  placeholder="Search tags..."
                  className="w-full rounded-md border border-border/50 bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <div className="max-h-48 overflow-y-auto space-y-3">
                  {tagPickerSearch ? (
                    <div className="flex flex-wrap gap-1">
                      {filteredTaxonomy.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => handleToggleTag(tag)}
                          className={cn(
                            "rounded-full px-2 py-0.5 text-xs transition-colors",
                            currentTags.includes(tag)
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                          )}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  ) : (
                    Object.entries(DREAMHOME_TAG_GROUPS).map(
                      ([group, tags]) => (
                        <div key={group}>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                            {group}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {tags.map((tag) => (
                              <button
                                key={tag}
                                onClick={() => handleToggleTag(tag)}
                                className={cn(
                                  "rounded-full px-2 py-0.5 text-xs transition-colors",
                                  currentTags.includes(tag)
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                                )}
                              >
                                {tag}
                              </button>
                            ))}
                          </div>
                        </div>
                      )
                    )
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
              Notes
            </p>
            {editingNotes ? (
              <div className="flex gap-2">
                <textarea
                  value={notesValue}
                  onChange={(e) => setNotesValue(e.target.value)}
                  rows={3}
                  className="flex-1 rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <div className="flex flex-col gap-1">
                  <Button size="sm" onClick={handleSaveNotes}>
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditingNotes(false);
                      setNotesValue(image.notes || "");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setEditingNotes(true)}
                className="w-full text-left rounded-md border border-dashed border-border/50 px-3 py-2 text-sm text-muted-foreground hover:border-border hover:bg-muted/50 transition-colors"
              >
                {image.notes || "Click to add notes..."}
              </button>
            )}
          </div>

          {/* Source */}
          {image.sourceUrl && (
            <a
              href={image.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {image.sourceDomain || "View source"}
            </a>
          )}

          {/* Actions */}
          <div className="flex justify-end border-t pt-3">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(image.id)}
              className="gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
