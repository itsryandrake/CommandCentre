import { useState, useCallback, useEffect, useMemo } from "react";
import { Plus, Loader2, Castle, SlidersHorizontal } from "lucide-react";
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  fetchDreamHomeImages,
  fetchDreamHomeTagCounts,
  updateDreamHomeTags,
  deleteDreamHomeImage,
  bulkUpdateDreamHomeTags,
  bulkDeleteDreamHomeImages,
} from "@/lib/api";
import type { DreamHomeImage, DreamHomeTag } from "@shared/types/dreamHome";
import { DreamHomeSidebar, DreamHomeSidebarWrapper } from "./DreamHomeSidebar";
import { DreamHomeSearchBar } from "./DreamHomeSearchBar";
import { InspirationCard } from "./InspirationCard";
import { BulkActionsToolbar } from "./BulkActionsToolbar";
import { AddInspirationDialog } from "./AddInspirationDialog";
import { ImageDetailDialog } from "./ImageDetailDialog";

export function DreamHomeGrid() {
  const [images, setImages] = useState<DreamHomeImage[]>([]);
  const [tagCounts, setTagCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<DreamHomeImage | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

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

  // Clear selection when filters or search change
  useEffect(() => {
    setSelectedIds(new Set());
  }, [activeTags, searchQuery]);

  const filteredImages = useMemo(() => {
    if (!searchQuery.trim()) return images;
    const q = searchQuery.toLowerCase();
    return images.filter(
      (img) =>
        img.aiDescription?.toLowerCase().includes(q) ||
        img.title?.toLowerCase().includes(q) ||
        img.tags.some((t) => t.tag.toLowerCase().includes(q))
    );
  }, [images, searchQuery]);

  const selectionActive = selectedIds.size > 0;

  const selectedImages = useMemo(
    () => images.filter((img) => selectedIds.has(img.id)),
    [images, selectedIds]
  );

  const toggleTag = useCallback((tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  const clearTags = useCallback(() => setActiveTags([]), []);

  const handleImagesAdded = useCallback((newImages: DreamHomeImage[]) => {
    setImages((prev) => [...newImages, ...prev]);
    fetchDreamHomeTagCounts().then((counts) => {
      const countMap: Record<string, number> = {};
      for (const tc of counts) countMap[tc.tag] = tc.count;
      setTagCounts(countMap);
    });
  }, []);

  const refreshTagCounts = useCallback(async () => {
    const counts = await fetchDreamHomeTagCounts();
    const countMap: Record<string, number> = {};
    for (const tc of counts) countMap[tc.tag] = tc.count;
    setTagCounts(countMap);
  }, []);

  const handleDeleteImage = useCallback(
    async (id: string) => {
      const success = await deleteDreamHomeImage(id);
      if (success) {
        setImages((prev) => prev.filter((img) => img.id !== id));
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        setDetailOpen(false);
        setSelectedImage(null);
        refreshTagCounts();
      }
    },
    [refreshTagCounts]
  );

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

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(filteredImages.map((img) => img.id)));
  }, [filteredImages]);

  const handleBulkAddTags = useCallback(
    async (tags: string[]) => {
      const ids = Array.from(selectedIds);
      const success = await bulkUpdateDreamHomeTags(ids, tags);
      if (success) {
        clearSelection();
        await loadData();
      }
    },
    [selectedIds, clearSelection, loadData]
  );

  const handleBulkRemoveTags = useCallback(
    async (tags: string[]) => {
      const ids = Array.from(selectedIds);
      const success = await bulkUpdateDreamHomeTags(ids, undefined, tags);
      if (success) {
        clearSelection();
        await loadData();
      }
    },
    [selectedIds, clearSelection, loadData]
  );

  const handleBulkDelete = useCallback(async () => {
    const ids = Array.from(selectedIds);
    const success = await bulkDeleteDreamHomeImages(ids);
    if (success) {
      setImages((prev) => prev.filter((img) => !selectedIds.has(img.id)));
      clearSelection();
      refreshTagCounts();
    }
  }, [selectedIds, clearSelection, refreshTagCounts]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const hasUsedTags = Object.values(tagCounts).some((c) => c > 0);

  return (
    <div className="flex gap-6">
      {/* Left sidebar — desktop */}
      {hasUsedTags && (
        <DreamHomeSidebarWrapper
          tagCounts={tagCounts}
          activeTags={activeTags}
          onToggleTag={toggleTag}
          onClearTags={clearTags}
        />
      )}

      {/* Mobile filters sheet */}
      <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
        <SheetContent side="left" className="w-72 p-4">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <DreamHomeSidebar
              tagCounts={tagCounts}
              activeTags={activeTags}
              onToggleTag={(tag) => {
                toggleTag(tag);
              }}
              onClearTags={clearTags}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex-1 min-w-0 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-normal">Dream Home</h1>
            <p className="text-muted-foreground mt-1">
              Collect inspiration for your dream house — rooms, styles, materials, and features
            </p>
          </div>
          <Button onClick={() => setAddDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Inspiration
          </Button>
        </div>

        {/* Search + mobile filter toggle */}
        <div className="flex items-center gap-3">
          {hasUsedTags && (
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeTags.length > 0 && (
                <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {activeTags.length}
                </span>
              )}
            </button>
          )}
          <DreamHomeSearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>

        {/* Stats */}
        {filteredImages.length > 0 && (
          <p className="text-sm text-muted-foreground">
            {filteredImages.length} image{filteredImages.length !== 1 ? "s" : ""}
            {activeTags.length > 0 && ` matching ${activeTags.join(" + ")}`}
            {searchQuery.trim() && ` for "${searchQuery.trim()}"`}
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

        {/* No results for filter/search */}
        {filteredImages.length === 0 && (activeTags.length > 0 || searchQuery.trim()) && images.length > 0 && (
          <div className="flex min-h-[40vh] items-center justify-center text-center">
            <div>
              <p className="text-sm text-muted-foreground">
                No images match your {searchQuery.trim() ? "search" : "filters"}
              </p>
              <button
                onClick={() => {
                  clearTags();
                  setSearchQuery("");
                }}
                className="mt-2 text-xs text-primary hover:underline"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}

        {/* No results — tags active but no images returned from server */}
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
        {filteredImages.length > 0 && (
          <div style={{ columns: "4 260px", columnGap: "16px" }}>
            {filteredImages.map((img) => (
              <InspirationCard
                key={img.id}
                image={img}
                isSelected={selectedIds.has(img.id)}
                selectionActive={selectionActive}
                onToggleSelect={() => toggleSelect(img.id)}
                onSelect={() => {
                  setSelectedImage(img);
                  setDetailOpen(true);
                }}
                onDelete={handleDeleteImage}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bulk actions toolbar */}
      <BulkActionsToolbar
        selectedCount={selectedIds.size}
        totalCount={filteredImages.length}
        selectedImages={selectedImages}
        onSelectAll={selectAll}
        onClearSelection={clearSelection}
        onBulkAddTags={handleBulkAddTags}
        onBulkRemoveTags={handleBulkRemoveTags}
        onBulkDelete={handleBulkDelete}
      />

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
