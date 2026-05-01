import { useState } from "react";
import { Plus, Minus, Trash2, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { DREAMHOME_TAG_GROUPS, ALL_TAGS } from "@shared/types/dreamHome";
import type { DreamHomeImage } from "@shared/types/dreamHome";
import { cn } from "@/lib/utils";

export function BulkActionsToolbar({
  selectedCount,
  totalCount,
  selectedImages,
  onSelectAll,
  onClearSelection,
  onBulkAddTags,
  onBulkRemoveTags,
  onBulkDelete,
}: {
  selectedCount: number;
  totalCount: number;
  selectedImages: DreamHomeImage[];
  onSelectAll: () => void;
  onClearSelection: () => void;
  onBulkAddTags: (tags: string[]) => Promise<void>;
  onBulkRemoveTags: (tags: string[]) => Promise<void>;
  onBulkDelete: () => Promise<void>;
}) {
  const [addTagsOpen, setAddTagsOpen] = useState(false);
  const [removeTagsOpen, setRemoveTagsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (selectedCount === 0) return null;

  return (
    <>
      <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 flex items-center gap-3 rounded-xl border bg-card/95 backdrop-blur-sm shadow-lg px-4 py-3">
        <span className="text-sm font-medium whitespace-nowrap">
          {selectedCount} selected
        </span>

        <Separator orientation="vertical" className="h-5" />

        {selectedCount < totalCount && (
          <Button variant="outline" size="sm" onClick={onSelectAll}>
            Select All
          </Button>
        )}

        <Button variant="outline" size="sm" onClick={() => setAddTagsOpen(true)} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          Add Tags
        </Button>

        <Button variant="outline" size="sm" onClick={() => setRemoveTagsOpen(true)} className="gap-1.5">
          <Minus className="h-3.5 w-3.5" />
          Remove Tags
        </Button>

        <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)} className="gap-1.5">
          <Trash2 className="h-3.5 w-3.5" />
          Delete ({selectedCount})
        </Button>

        <button onClick={onClearSelection} className="ml-1 p-1 rounded hover:bg-muted transition-colors">
          <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
        </button>
      </div>

      {/* Add Tags Dialog */}
      <BulkTagDialog
        open={addTagsOpen}
        onOpenChange={setAddTagsOpen}
        mode="add"
        onConfirm={onBulkAddTags}
      />

      {/* Remove Tags Dialog */}
      <BulkTagDialog
        open={removeTagsOpen}
        onOpenChange={setRemoveTagsOpen}
        mode="remove"
        selectedImages={selectedImages}
        onConfirm={onBulkRemoveTags}
      />

      {/* Delete Confirmation */}
      <BulkDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        count={selectedCount}
        onConfirm={onBulkDelete}
      />
    </>
  );
}

function BulkTagDialog({
  open,
  onOpenChange,
  mode,
  selectedImages,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "remove";
  selectedImages?: DreamHomeImage[];
  onConfirm: (tags: string[]) => Promise<void>;
}) {
  const [pickedTags, setPickedTags] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const availableTags = mode === "remove" && selectedImages
    ? Array.from(new Set(selectedImages.flatMap((img) => img.tags.map((t) => t.tag)))).sort()
    : ALL_TAGS;

  const filteredTags = search
    ? availableTags.filter((t) => t.toLowerCase().includes(search.toLowerCase()))
    : availableTags;

  const toggleTag = (tag: string) => {
    setPickedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  };

  const handleConfirm = async () => {
    if (pickedTags.size === 0) return;
    setIsLoading(true);
    await onConfirm(Array.from(pickedTags));
    setIsLoading(false);
    setPickedTags(new Set());
    setSearch("");
    onOpenChange(false);
  };

  const handleClose = (v: boolean) => {
    if (!v) {
      setPickedTags(new Set());
      setSearch("");
    }
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add Tags" : "Remove Tags"}
          </DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Select tags to add to all selected images."
              : "Select tags to remove from the selected images."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tags..."
            className="w-full rounded-md border border-border/50 bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />

          <div className="max-h-64 overflow-y-auto space-y-3">
            {search ? (
              <div className="flex flex-wrap gap-1.5">
                {filteredTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                      pickedTags.has(tag)
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    )}
                  >
                    {tag}
                  </button>
                ))}
                {filteredTags.length === 0 && (
                  <p className="text-xs text-muted-foreground">No matching tags</p>
                )}
              </div>
            ) : mode === "remove" ? (
              <div className="flex flex-wrap gap-1.5">
                {availableTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                      pickedTags.has(tag)
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            ) : (
              Object.entries(DREAMHOME_TAG_GROUPS).map(([group, tags]) => (
                <div key={group}>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                    {group}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={cn(
                          "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                          pickedTags.has(tag)
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                        )}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {pickedTags.size > 0 && (
            <div className="flex items-center gap-2 border-t pt-3">
              <p className="text-xs text-muted-foreground flex-1">
                {pickedTags.size} tag{pickedTags.size !== 1 ? "s" : ""} selected
              </p>
              <Button size="sm" variant="outline" onClick={() => setPickedTags(new Set())}>
                Clear
              </Button>
              <Button size="sm" onClick={handleConfirm} disabled={isLoading} className="gap-1.5">
                {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {mode === "add" ? "Add Tags" : "Remove Tags"}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function BulkDeleteDialog({
  open,
  onOpenChange,
  count,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  count: number;
  onConfirm: () => Promise<void>;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    await onConfirm();
    setIsLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete {count} image{count !== 1 ? "s" : ""}?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. The selected images will be permanently removed.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isLoading} className="gap-1.5">
            {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Delete {count} image{count !== 1 ? "s" : ""}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
