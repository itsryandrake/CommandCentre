import { useState, useCallback, useEffect } from "react";
import {
  Plus,
  Loader2,
  Sparkles,
  ExternalLink,
  Trash2,
  Pencil,
  Check,
  X,
} from "lucide-react";
import {
  GlassCard,
  GlassCardContent,
} from "@/components/ui/glass-card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  fetchVisionBoardItems,
  scrapeVisionBoardItem,
  updateVisionBoardItem,
  deleteVisionBoardItem,
} from "@/lib/api";
import { parsePrice, formatTotal } from "@/lib/parse-price";
import type { VisionBoardItem, Category } from "@shared/types/visionBoard";
import { CATEGORIES, CATEGORY_COLOURS } from "@shared/types/visionBoard";
import { cn } from "@/lib/utils";

export function VisionBoardGrid() {
  const [items, setItems] = useState<VisionBoardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category | "All">(
    "All"
  );
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<VisionBoardItem | null>(
    null
  );
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    fetchVisionBoardItems().then((data) => {
      setItems(data);
      setIsLoading(false);
    });
  }, []);

  const handleAddItem = useCallback((item: VisionBoardItem) => {
    setItems((prev) => [item, ...prev]);
  }, []);

  const handleDeleteItem = useCallback(async (id: string) => {
    const success = await deleteVisionBoardItem(id);
    if (success) {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }
  }, []);

  const handleCategoryChange = useCallback(
    async (id: string, category: Category) => {
      const success = await updateVisionBoardItem(id, { category });
      if (success) {
        setItems((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, category } : item
          )
        );
        setSelectedItem((prev) =>
          prev && prev.id === id ? { ...prev, category } : prev
        );
      }
    },
    []
  );

  const handlePriceChange = useCallback(
    async (id: string, price: string | null) => {
      const success = await updateVisionBoardItem(id, { price });
      if (success) {
        setItems((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, price } : item
          )
        );
        setSelectedItem((prev) =>
          prev && prev.id === id ? { ...prev, price } : prev
        );
      }
    },
    []
  );

  const filteredItems =
    selectedCategory === "All"
      ? items
      : items.filter((item) => item.category === selectedCategory);

  const counts: Record<string, number> = {};
  for (const item of items) {
    counts[item.category] = (counts[item.category] || 0) + 1;
  }

  const total = filteredItems.reduce(
    (sum, item) => sum + parsePrice(item.price),
    0
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add button */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          onClick={() => setAddDialogOpen(true)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add to Board
        </Button>
      </div>

      {/* Category filter */}
      {items.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedCategory("All")}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all active:scale-95",
              selectedCategory === "All"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            All
            <span className="opacity-70">{items.length}</span>
          </button>
          {CATEGORIES.filter((cat) => counts[cat] && counts[cat] > 0).map(
            (category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all active:scale-95",
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
              >
                {category}
                <span className="opacity-70">{counts[category]}</span>
              </button>
            )
          )}
        </div>
      )}

      {/* Price tally */}
      {total > 0 && (
        <div className="flex items-center justify-between rounded-xl bg-card border border-border px-4 py-3">
          <span className="text-xs font-medium text-muted-foreground">
            {selectedCategory === "All" ? "Board" : selectedCategory} total
          </span>
          <span className="font-mono text-lg font-bold text-primary">
            {formatTotal(total)}
          </span>
        </div>
      )}

      {/* Empty state */}
      {items.length === 0 && (
        <GlassCard className="py-16 text-center">
          <GlassCardContent className="flex flex-col items-center gap-3">
            <Sparkles className="h-12 w-12 text-muted-foreground/40" />
            <h2 className="text-xl font-bold">Your board is empty</h2>
            <p className="text-muted-foreground max-w-sm">
              Start adding the things you aspire to. Paste a link to any product
              or experience and we'll do the rest.
            </p>
            <Button onClick={() => setAddDialogOpen(true)} className="mt-2">
              Add your first item
            </Button>
          </GlassCardContent>
        </GlassCard>
      )}

      {/* No items in category */}
      {items.length > 0 && filteredItems.length === 0 && (
        <div className="flex min-h-[40vh] items-center justify-center text-center">
          <p className="text-sm text-muted-foreground">
            No items in "{selectedCategory}"
          </p>
        </div>
      )}

      {/* Masonry grid */}
      {filteredItems.length > 0 && (
        <div
          style={{ columns: "4 240px", columnGap: "16px" }}
        >
          {filteredItems.map((item) => (
            <VisionCard
              key={item.id}
              item={item}
              onSelect={(item) => {
                setSelectedItem(item);
                setDetailOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Add Item Dialog */}
      <AddItemDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onItemAdded={handleAddItem}
      />

      {/* Item Detail Dialog */}
      <ItemDetailDialog
        item={selectedItem}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onDelete={handleDeleteItem}
        onCategoryChange={handleCategoryChange}
        onPriceChange={handlePriceChange}
      />
    </div>
  );
}

// =============================================================================
// VisionCard
// =============================================================================

function VisionCard({
  item,
  onSelect,
}: {
  item: VisionBoardItem;
  onSelect: (item: VisionBoardItem) => void;
}) {
  const [imageError, setImageError] = useState(false);

  return (
    <button
      onClick={() => onSelect(item)}
      className="group relative mb-4 w-full cursor-pointer overflow-hidden rounded-xl bg-card shadow-sm transition-all duration-200 hover:shadow-lg active:scale-[0.98] text-left break-inside-avoid"
    >
      {item.imageUrl && !imageError ? (
        <img
          src={item.imageUrl}
          alt={item.title}
          className="w-full object-contain"
          onError={() => setImageError(true)}
          loading="lazy"
        />
      ) : (
        <div
          className={cn(
            "flex aspect-[4/3] items-center justify-center",
            CATEGORY_COLOURS[item.category]
          )}
        >
          <span className="text-sm font-semibold text-white/80">
            {item.category}
          </span>
        </div>
      )}

      {/* Category badge */}
      <span
        className={cn(
          "absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white",
          CATEGORY_COLOURS[item.category]
        )}
      >
        {item.category}
      </span>

      {/* Hover overlay */}
      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/20 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
        <h3 className="line-clamp-2 text-sm font-bold leading-tight text-white">
          {item.title}
        </h3>
        {item.price && (
          <p className="mt-1 font-mono text-sm font-semibold text-white/90">
            {item.price}
          </p>
        )}
      </div>
    </button>
  );
}

// =============================================================================
// AddItemDialog
// =============================================================================

function AddItemDialog({
  open,
  onOpenChange,
  onItemAdded,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onItemAdded: (item: VisionBoardItem) => void;
}) {
  const [urls, setUrls] = useState<string[]>([""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateUrl(index: number, value: string) {
    setUrls((prev) => prev.map((u, i) => (i === index ? value : u)));
    setError(null);
  }

  function addUrlField() {
    if (urls.length < 10) {
      setUrls((prev) => [...prev, ""]);
    }
  }

  function removeUrlField(index: number) {
    if (urls.length > 1) {
      setUrls((prev) => prev.filter((_, i) => i !== index));
    }
  }

  function normaliseUrl(raw: string): string {
    const trimmed = raw.trim();
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      return `https://${trimmed}`;
    }
    return trimmed;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const validUrls = urls.map((u) => u.trim()).filter(Boolean);
    if (validUrls.length === 0) {
      setError("Please enter at least one URL.");
      return;
    }

    setLoading(true);
    try {
      const results = await Promise.allSettled(
        validUrls.map((u) => scrapeVisionBoardItem(normaliseUrl(u)))
      );

      let addedCount = 0;
      const failures: string[] = [];

      results.forEach((result, i) => {
        if (result.status === "fulfilled" && result.value) {
          onItemAdded(result.value);
          addedCount++;
        } else {
          failures.push(validUrls[i]);
        }
      });

      if (failures.length > 0 && addedCount === 0) {
        setError(`Failed to scrape ${failures.length === 1 ? "this URL" : "all URLs"}. Please check and try again.`);
      } else if (failures.length > 0) {
        setUrls(failures);
        setError(`Added ${addedCount} item${addedCount > 1 ? "s" : ""}, but ${failures.length} failed.`);
      } else {
        setUrls([""]);
        onOpenChange(false);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { setUrls([""]); setError(null); } onOpenChange(o); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add to Vision Board</DialogTitle>
          <DialogDescription>
            Paste links to products or experiences you aspire to.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            {urls.map((url, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  placeholder="https://example.com/product"
                  value={url}
                  onChange={(e) => updateUrl(index, e.target.value)}
                  disabled={loading}
                  autoFocus={index === urls.length - 1}
                />
                {urls.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeUrlField(index)}
                    disabled={loading}
                    className="shrink-0 rounded-full p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            {urls.length < 10 && (
              <button
                type="button"
                onClick={addUrlField}
                disabled={loading}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors pt-1"
              >
                <Plus className="h-4 w-4" />
                Add another URL
              </button>
            )}
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Scraping {urls.filter((u) => u.trim()).length} URL{urls.filter((u) => u.trim()).length !== 1 ? "s" : ""}...
              </>
            ) : (
              `Add ${urls.filter((u) => u.trim()).length > 1 ? `${urls.filter((u) => u.trim()).length} Items` : ""} to Board`
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// =============================================================================
// ItemDetailDialog
// =============================================================================

function ItemDetailDialog({
  item,
  open,
  onOpenChange,
  onDelete,
  onCategoryChange,
  onPriceChange,
}: {
  item: VisionBoardItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (id: string) => void;
  onCategoryChange: (id: string, category: Category) => void;
  onPriceChange: (id: string, price: string | null) => void;
}) {
  const [editingPrice, setEditingPrice] = useState(false);
  const [priceValue, setPriceValue] = useState("");

  if (!item) return null;

  function startEditingPrice() {
    setPriceValue(item!.price || "");
    setEditingPrice(true);
  }

  function savePrice() {
    const trimmed = priceValue.trim();
    onPriceChange(item!.id, trimmed || null);
    setEditingPrice(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) setEditingPrice(false);
        onOpenChange(o);
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-lg">
        <DialogTitle className="sr-only">{item.title}</DialogTitle>

        {/* Image */}
        {item.imageUrl && (
          <div className="relative">
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full rounded-t-2xl object-cover"
            />
            <span
              className={cn(
                "absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-semibold text-white",
                CATEGORY_COLOURS[item.category]
              )}
            >
              {item.category}
            </span>
          </div>
        )}

        {/* Content */}
        <div className="space-y-4 p-5">
          <div>
            <h2 className="text-xl font-bold leading-tight">{item.title}</h2>
            <div className="mt-1 flex items-center gap-2">
              {editingPrice ? (
                <div className="flex items-center gap-1.5">
                  <Input
                    value={priceValue}
                    onChange={(e) => setPriceValue(e.target.value)}
                    placeholder="e.g. $299.00"
                    className="h-8 w-36 font-mono text-sm"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") savePrice();
                      if (e.key === "Escape") setEditingPrice(false);
                    }}
                  />
                  <button
                    onClick={savePrice}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={startEditingPrice}
                  className="group/price inline-flex items-center gap-1.5"
                >
                  <span className="font-mono text-lg font-bold text-primary">
                    {item.price || "Add price"}
                  </span>
                  <Pencil className="h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover/price:opacity-100" />
                </button>
              )}
            </div>
          </div>

          {item.description && (
            <p className="text-sm leading-relaxed text-muted-foreground">
              {item.description}
            </p>
          )}

          {/* Category selector */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Category
            </label>
            <Select
              value={item.category}
              onValueChange={(val) =>
                onCategoryChange(item.id, val as Category)
              }
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat} className="text-sm">
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Visit {item.domain}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 shrink-0 rounded-full text-muted-foreground hover:border-destructive hover:text-destructive"
              onClick={() => {
                onDelete(item.id);
                onOpenChange(false);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
