import { useState, useCallback, useEffect, useRef } from "react";
import {
  Plus,
  Loader2,
  Sparkles,
  ExternalLink,
  Trash2,
  X,
  Search,
  Castle,
} from "lucide-react";
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  fetchDreamHomeImages,
  fetchDreamHomeTagCounts,
  scrapeDreamHomeListing,
  pollDreamHomeJob,
  updateDreamHomeImage,
  updateDreamHomeTags,
  deleteDreamHomeImage,
} from "@/lib/api";
import type { DreamHomeImage, DreamHomeScrapeJob } from "@shared/types/dreamHome";
import { DREAMHOME_TAG_GROUPS, ALL_TAGS } from "@shared/types/dreamHome";
import type { DreamHomeTag, DreamHomeTagGroup } from "@shared/types/dreamHome";
import { cn } from "@/lib/utils";

// =============================================================================
// Tag colour map
// =============================================================================

const TAG_GROUP_COLOURS: Record<DreamHomeTagGroup, string> = {
  "Room / Area": "bg-blue-500/80",
  Style: "bg-purple-500/80",
  Colour: "bg-amber-500/80",
};

function getTagGroup(tag: string): DreamHomeTagGroup | null {
  for (const [group, tags] of Object.entries(DREAMHOME_TAG_GROUPS)) {
    if ((tags as readonly string[]).includes(tag)) return group as DreamHomeTagGroup;
  }
  return null;
}

function getTagColour(tag: string): string {
  const group = getTagGroup(tag);
  return group ? TAG_GROUP_COLOURS[group] : "bg-neutral-500/80";
}

// =============================================================================
// Main Grid
// =============================================================================

export function DreamHomeGrid() {
  const [images, setImages] = useState<DreamHomeImage[]>([]);
  const [tagCounts, setTagCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<DreamHomeImage | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [tagSearch, setTagSearch] = useState("");

  const loadData = useCallback(async () => {
    const [imgs, counts] = await Promise.all([
      fetchDreamHomeImages(activeTags.length > 0 ? activeTags : undefined),
      fetchDreamHomeTagCounts(),
    ]);
    setImages(imgs);
    const countMap: Record<string, number> = {};
    for (const tc of counts) countMap[tc.tag] = tc.count;
    setTagCounts(countMap);
    setIsLoading(false);
  }, [activeTags]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleTag = useCallback((tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  const clearTags = useCallback(() => setActiveTags([]), []);

  const handleImagesAdded = useCallback((newImages: DreamHomeImage[]) => {
    setImages((prev) => [...newImages, ...prev]);
    // Refresh tag counts
    fetchDreamHomeTagCounts().then((counts) => {
      const countMap: Record<string, number> = {};
      for (const tc of counts) countMap[tc.tag] = tc.count;
      setTagCounts(countMap);
    });
  }, []);

  const handleDeleteImage = useCallback(async (id: string) => {
    const success = await deleteDreamHomeImage(id);
    if (success) {
      setImages((prev) => prev.filter((img) => img.id !== id));
      setDetailOpen(false);
      setSelectedImage(null);
      fetchDreamHomeTagCounts().then((counts) => {
        const countMap: Record<string, number> = {};
        for (const tc of counts) countMap[tc.tag] = tc.count;
        setTagCounts(countMap);
      });
    }
  }, []);

  const handleTagsChange = useCallback(
    async (id: string, tags: string[]) => {
      const success = await updateDreamHomeTags(id, tags);
      if (success) {
        setImages((prev) =>
          prev.map((img) =>
            img.id === id
              ? { ...img, tags: tags.map((t) => ({ tag: t as DreamHomeTag, confidence: 1 })) }
              : img
          )
        );
        setSelectedImage((prev) =>
          prev && prev.id === id
            ? { ...prev, tags: tags.map((t) => ({ tag: t as DreamHomeTag, confidence: 1 })) }
            : prev
        );
      }
    },
    []
  );

  // Tags that actually have images
  const usedTags = Object.keys(tagCounts).filter((t) => tagCounts[t] > 0);

  // Filter tags by search
  const filteredUsedTags = tagSearch
    ? usedTags.filter((t) => t.toLowerCase().includes(tagSearch.toLowerCase()))
    : usedTags;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-normal">Dream Home</h1>
          <p className="text-muted-foreground mt-1">
            Collect inspiration for your dream house — rooms, styles, materials, and features
          </p>
        </div>
        <Button
          onClick={() => setAddDialogOpen(true)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Inspiration
        </Button>
      </div>

      {/* Tag filter */}
      {usedTags.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
              Filter by tags
            </p>
            {activeTags.length > 0 && (
              <button
                onClick={clearTags}
                className="text-xs text-primary hover:underline"
              >
                Clear all
              </button>
            )}
            {usedTags.length > 15 && (
              <div className="relative ml-auto">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={tagSearch}
                  onChange={(e) => setTagSearch(e.target.value)}
                  placeholder="Search tags..."
                  className="h-7 w-48 rounded-full border border-border/50 bg-background pl-8 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {filteredUsedTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-all active:scale-95",
                  activeTags.includes(tag)
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
              >
                {tag}
                <span className="opacity-60">{tagCounts[tag]}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      {images.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {images.length} image{images.length !== 1 ? "s" : ""}
          {activeTags.length > 0 && ` matching ${activeTags.join(" + ")}`}
        </p>
      )}

      {/* Empty state */}
      {images.length === 0 && activeTags.length === 0 && (
        <GlassCard className="py-16 text-center">
          <GlassCardContent className="flex flex-col items-center gap-3">
            <Castle className="h-12 w-12 text-muted-foreground/40" />
            <h2 className="text-xl font-bold">Start building your dream</h2>
            <p className="text-muted-foreground max-w-sm">
              Paste a real estate listing URL or a direct image link to start
              collecting inspiration for your dream home.
            </p>
            <Button onClick={() => setAddDialogOpen(true)} className="mt-2">
              Add your first inspiration
            </Button>
          </GlassCardContent>
        </GlassCard>
      )}

      {/* No results for filter */}
      {images.length === 0 && activeTags.length > 0 && (
        <div className="flex min-h-[40vh] items-center justify-center text-center">
          <div>
            <p className="text-sm text-muted-foreground">
              No images match {activeTags.join(" + ")}
            </p>
            <button
              onClick={clearTags}
              className="mt-2 text-xs text-primary hover:underline"
            >
              Clear filters
            </button>
          </div>
        </div>
      )}

      {/* Masonry grid */}
      {images.length > 0 && (
        <div style={{ columns: "4 260px", columnGap: "16px" }}>
          {images.map((img) => (
            <InspirationCard
              key={img.id}
              image={img}
              onSelect={() => {
                setSelectedImage(img);
                setDetailOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Add dialog */}
      <AddInspirationDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onImagesAdded={handleImagesAdded}
      />

      {/* Detail dialog */}
      <ImageDetailDialog
        image={selectedImage}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onDelete={handleDeleteImage}
        onTagsChange={handleTagsChange}
      />
    </div>
  );
}

// =============================================================================
// InspirationCard
// =============================================================================

function InspirationCard({
  image,
  onSelect,
}: {
  image: DreamHomeImage;
  onSelect: () => void;
}) {
  const [imageError, setImageError] = useState(false);

  return (
    <button
      onClick={onSelect}
      className="group relative mb-4 w-full cursor-pointer overflow-hidden rounded-xl bg-card shadow-sm transition-all duration-200 hover:shadow-lg active:scale-[0.98] text-left break-inside-avoid"
    >
      {!imageError ? (
        <img
          src={image.imageUrl}
          alt={image.aiDescription || image.title || "Inspiration"}
          className="w-full object-contain"
          onError={() => setImageError(true)}
          loading="lazy"
        />
      ) : (
        <div className="flex h-48 items-center justify-center bg-muted">
          <Castle className="h-8 w-8 text-muted-foreground/40" />
        </div>
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="absolute bottom-0 left-0 right-0 p-3 space-y-1.5">
          {image.aiDescription && (
            <p className="text-xs text-white/90 line-clamp-2">
              {image.aiDescription}
            </p>
          )}
          {image.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {image.tags.slice(0, 4).map((t) => (
                <span
                  key={t.tag}
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-medium text-white",
                    getTagColour(t.tag)
                  )}
                >
                  {t.tag}
                </span>
              ))}
              {image.tags.length > 4 && (
                <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] text-white">
                  +{image.tags.length - 4}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

// =============================================================================
// AddInspirationDialog
// =============================================================================

function AddInspirationDialog({
  open,
  onOpenChange,
  onImagesAdded,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImagesAdded: (images: DreamHomeImage[]) => void;
}) {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [job, setJob] = useState<DreamHomeScrapeJob | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cleanup = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const handleClose = useCallback(
    (open: boolean) => {
      if (!open) {
        cleanup();
        setUrl("");
        setError(null);
        setJob(null);
        setIsLoading(false);
      }
      onOpenChange(open);
    },
    [onOpenChange, cleanup]
  );

  const handleSubmit = useCallback(async () => {
    if (!url.trim()) return;
    setIsLoading(true);
    setError(null);
    setJob(null);

    try {
      const result = await scrapeDreamHomeListing(url.trim());

      if (result.job) {
        // Direct image — completed immediately
        setJob(result.job);
        setIsLoading(false);
        if (result.job.images.length > 0) {
          onImagesAdded(result.job.images);
        }
        return;
      }

      if (result.jobId) {
        // Listing scrape — poll for progress
        const jobId = result.jobId;
        pollRef.current = setInterval(async () => {
          try {
            const status = await pollDreamHomeJob(jobId);
            setJob(status);

            if (status.status === "complete" || status.status === "error") {
              cleanup();
              setIsLoading(false);
              if (status.status === "complete" && status.images.length > 0) {
                onImagesAdded(status.images);
              }
              if (status.status === "error") {
                setError(status.error || "Scraping failed");
              }
            }
          } catch {
            cleanup();
            setIsLoading(false);
            setError("Lost connection to scraping job");
          }
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || "Failed to process URL");
      setIsLoading(false);
    }
  }, [url, onImagesAdded, cleanup]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Inspiration</DialogTitle>
          <DialogDescription>
            Paste a real estate listing URL to import all photos, or a direct image URL.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="https://realestate.com.au/property/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              disabled={isLoading}
            />
            <Button onClick={handleSubmit} disabled={isLoading || !url.trim()}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
            </Button>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {/* Progress */}
          {job && job.status === "processing" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Processing images...</span>
                <span>
                  {job.progress.done} / {job.progress.total}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{
                    width: `${job.progress.total > 0 ? (job.progress.done / job.progress.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Completion */}
          {job && job.status === "complete" && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {job.images.length} image{job.images.length !== 1 ? "s" : ""} added to your board
              </p>
              {job.images.length > 0 && (
                <div className="grid grid-cols-4 gap-2 max-h-60 overflow-y-auto">
                  {job.images.map((img) => (
                    <div
                      key={img.id}
                      className="aspect-square overflow-hidden rounded-lg"
                    >
                      <img
                        src={img.imageUrl}
                        alt={img.aiDescription || ""}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              )}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleClose(false)}
              >
                Done
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// =============================================================================
// ImageDetailDialog
// =============================================================================

function ImageDetailDialog({
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
