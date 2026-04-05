import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  GlassCard,
  GlassCardContent,
} from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Loader2,
  Shirt,
  X,
  Trash2,
  ExternalLink,
  Pencil,
  Filter,
  Search,
} from "lucide-react";
import { useWardrobe } from "@/hooks/useWardrobe";
import { WARDROBE_CATEGORIES } from "@shared/types/wardrobe";
import type {
  WardrobeItem,
  CreateWardrobeInput,
  WardrobeCategory,
} from "@shared/types/wardrobe";
import { cn } from "@/lib/utils";

export function Wardrobe() {
  const {
    items,
    allItems,
    isLoading,
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    brandFilter,
    setBrandFilter,
    colourFilter,
    setColourFilter,
    sizeFilter,
    setSizeFilter,
    personFilter,
    setPersonFilter,
    allBrands,
    allColours,
    allSizes,
    allPeople,
    create,
    update,
    remove,
  } = useWardrobe();

  const [addOpen, setAddOpen] = useState(false);
  const [viewing, setViewing] = useState<WardrobeItem | null>(null);
  const [editing, setEditing] = useState<WardrobeItem | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters = brandFilter || colourFilter || sizeFilter || personFilter;

  const clearFilters = () => {
    setBrandFilter(undefined);
    setColourFilter(undefined);
    setSizeFilter(undefined);
    setPersonFilter(undefined);
    setSearch("");
  };

  return (
    <DashboardLayout title="Wardrobe">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-normal">Wardrobe</h1>
            <p className="text-muted-foreground mt-1">
              {items.length} items
            </p>
          </div>
          <Button
            onClick={() => {
              setEditing(null);
              setAddOpen(true);
            }}
          >
            <Plus className="size-4 mr-2" />
            Add Item
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search wardrobe..."
            className="pl-9"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-muted"
            >
              <X className="size-3.5 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Person filter */}
        {allPeople.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={() => setPersonFilter(undefined)}
              className={cn(
                "inline-flex shrink-0 items-center rounded-full px-3 py-1.5 text-xs font-semibold transition-all active:scale-95",
                !personFilter
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              Everyone
            </button>
            {allPeople.map((person) => (
              <button
                key={person}
                onClick={() =>
                  setPersonFilter(personFilter === person ? undefined : person)
                }
                className={cn(
                  "inline-flex shrink-0 items-center rounded-full px-3 py-1.5 text-xs font-semibold transition-all active:scale-95 capitalize",
                  personFilter === person
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
              >
                {person}
              </button>
            ))}
          </div>
        )}

        {/* Category filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setCategoryFilter(undefined)}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all active:scale-95",
              !categoryFilter
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            All
          </button>
          {WARDROBE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() =>
                setCategoryFilter(categoryFilter === cat ? undefined : cat)
              }
              className={cn(
                "inline-flex shrink-0 items-center rounded-full px-3 py-1.5 text-xs font-semibold transition-all active:scale-95",
                categoryFilter === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Advanced filters toggle */}
        <div className="space-y-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center gap-2 text-sm font-medium transition-colors",
              hasActiveFilters
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Filter className="size-4" />
            Filters
            {hasActiveFilters && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearFilters();
                }}
                className="ml-1 text-xs text-muted-foreground hover:text-foreground"
              >
                (clear)
              </button>
            )}
          </button>

          {showFilters && (
            <div className="flex flex-wrap gap-3">
              {allBrands.length > 0 && (
                <Select
                  value={brandFilter || "_all"}
                  onValueChange={(v) =>
                    setBrandFilter(v === "_all" ? undefined : v)
                  }
                >
                  <SelectTrigger className="w-40 h-9 text-sm">
                    <SelectValue placeholder="Brand" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_all">All Brands</SelectItem>
                    {allBrands.sort().map((b) => (
                      <SelectItem key={b} value={b}>
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {allColours.length > 0 && (
                <Select
                  value={colourFilter || "_all"}
                  onValueChange={(v) =>
                    setColourFilter(v === "_all" ? undefined : v)
                  }
                >
                  <SelectTrigger className="w-40 h-9 text-sm">
                    <SelectValue placeholder="Colour" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_all">All Colours</SelectItem>
                    {allColours.sort().map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {allSizes.length > 0 && (
                <Select
                  value={sizeFilter || "_all"}
                  onValueChange={(v) =>
                    setSizeFilter(v === "_all" ? undefined : v)
                  }
                >
                  <SelectTrigger className="w-40 h-9 text-sm">
                    <SelectValue placeholder="Size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_all">All Sizes</SelectItem>
                    {allSizes.sort().map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : allItems.length === 0 ? (
          <GlassCard className="py-16 text-center">
            <GlassCardContent className="flex flex-col items-center gap-3">
              <Shirt className="h-12 w-12 text-muted-foreground/40" />
              <h2 className="text-xl font-bold">Your wardrobe is empty</h2>
              <p className="text-muted-foreground max-w-sm">
                Start adding your clothes to build a visual wardrobe.
              </p>
              <Button onClick={() => setAddOpen(true)} className="mt-2">
                Add your first item
              </Button>
            </GlassCardContent>
          </GlassCard>
        ) : items.length === 0 ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <p className="text-sm text-muted-foreground">
              No items match your {search ? "search" : "filters"}
            </p>
          </div>
        ) : (
          <div style={{ columns: "4 220px", columnGap: "16px" }}>
            {items.map((item) => (
              <WardrobeCard
                key={item.id}
                item={item}
                onSelect={() => setViewing(item)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <WardrobeForm
        open={addOpen}
        onOpenChange={setAddOpen}
        existing={editing}
        onSubmit={async (input) => {
          if (editing) {
            await update(editing.id, input);
          } else {
            await create(input as CreateWardrobeInput);
          }
          setAddOpen(false);
          setEditing(null);
        }}
      />

      {/* Detail Dialog */}
      <WardrobeDetail
        item={viewing}
        open={!!viewing}
        onOpenChange={(o) => {
          if (!o) setViewing(null);
        }}
        onEdit={() => {
          setEditing(viewing);
          setViewing(null);
          setAddOpen(true);
        }}
        onDelete={async () => {
          if (viewing) {
            await remove(viewing.id);
            setViewing(null);
          }
        }}
      />
    </DashboardLayout>
  );
}

// =============================================================================
// WardrobeCard — Pinterest-style
// =============================================================================

function WardrobeCard({
  item,
  onSelect,
}: {
  item: WardrobeItem;
  onSelect: () => void;
}) {
  const [imageError, setImageError] = useState(false);

  return (
    <button
      onClick={onSelect}
      className="group relative w-full cursor-pointer overflow-hidden rounded-xl bg-card shadow-sm transition-all duration-200 hover:shadow-lg active:scale-[0.98] text-left break-inside-avoid mb-4"
    >
      {item.imageUrl && !imageError ? (
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full object-contain"
          loading="lazy"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="flex aspect-[3/4] items-center justify-center bg-muted/30">
          <Shirt className="size-10 text-muted-foreground/30" />
        </div>
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/20 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
        <h3 className="line-clamp-2 text-sm font-bold leading-tight text-white">
          {item.name}
        </h3>
        <div className="flex items-center gap-2 mt-0.5">
          {item.brand && (
            <span className="text-xs text-white/70">{item.brand}</span>
          )}
          {item.size && (
            <span className="text-xs text-white/50">Size {item.size}</span>
          )}
        </div>
        {item.purchasePrice != null && item.purchasePrice > 0 && (
          <p className="mt-1 font-mono text-sm font-semibold text-white/90">
            ${item.purchasePrice.toLocaleString("en-AU", {
              minimumFractionDigits: 0,
            })}
          </p>
        )}
      </div>
    </button>
  );
}

// =============================================================================
// WardrobeForm — Add/Edit Dialog
// =============================================================================

function WardrobeForm({
  open,
  onOpenChange,
  existing,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  existing: WardrobeItem | null;
  onSubmit: (input: CreateWardrobeInput) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<WardrobeCategory>("T-Shirts");
  const [brand, setBrand] = useState("");
  const [colour, setColour] = useState("");
  const [size, setSize] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [addedBy, setAddedBy] = useState("ryan");
  const [saving, setSaving] = useState(false);

  // Reset form when dialog opens
  const handleOpenChange = (o: boolean) => {
    if (o && existing) {
      setName(existing.name);
      setCategory(existing.category);
      setBrand(existing.brand || "");
      setColour(existing.colour || "");
      setSize(existing.size || "");
      setImageUrl(existing.imageUrl || "");
      setProductUrl(existing.productUrl || "");
      setPurchasePrice(
        existing.purchasePrice ? String(existing.purchasePrice) : ""
      );
      setAddedBy(existing.addedBy || "ryan");
    } else if (o) {
      setName("");
      setCategory("T-Shirts");
      setBrand("");
      setColour("");
      setSize("");
      setImageUrl("");
      setProductUrl("");
      setPurchasePrice("");
      setAddedBy("ryan");
    }
    onOpenChange(o);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await onSubmit({
      name: name.trim(),
      category,
      brand: brand.trim() || undefined,
      colour: colour.trim() || undefined,
      size: size.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
      productUrl: productUrl.trim() || undefined,
      purchasePrice: purchasePrice ? parseFloat(purchasePrice) : undefined,
      addedBy,
    });
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {existing ? "Edit Item" : "Add to Wardrobe"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Whose item */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">Whose</label>
            <div className="flex gap-2">
              {["ryan", "emily"].map((person) => (
                <button
                  key={person}
                  type="button"
                  onClick={() => setAddedBy(person)}
                  className={cn(
                    "flex-1 rounded-lg border px-3 py-2 text-sm font-medium capitalize transition-colors",
                    addedBy === person
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:bg-muted"
                  )}
                >
                  {person}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Name *</label>
            <Input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Navy Oxford Shirt"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Category *
              </label>
              <Select
                value={category}
                onValueChange={(v) => setCategory(v as WardrobeCategory)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WARDROBE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Brand</label>
              <Input
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Ralph Lauren"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Colour
              </label>
              <Input
                value={colour}
                onChange={(e) => setColour(e.target.value)}
                placeholder="e.g. Navy"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Size</label>
              <Input
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="e.g. M, 32, 10"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">
              Image URL
            </label>
            <Input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">
              Product URL
            </label>
            <Input
              type="url"
              value={productUrl}
              onChange={(e) => setProductUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">
              Purchase Price
            </label>
            <Input
              type="number"
              step="0.01"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <Button type="submit" className="w-full" disabled={saving}>
            {saving
              ? "Saving..."
              : existing
                ? "Save Changes"
                : "Add to Wardrobe"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// =============================================================================
// WardrobeDetail — Item detail dialog
// =============================================================================

function WardrobeDetail({
  item,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: {
  item: WardrobeItem | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-lg">
        <DialogTitle className="sr-only">{item.name}</DialogTitle>

        {item.imageUrl && (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full rounded-t-2xl object-cover max-h-96"
          />
        )}

        <div className="space-y-4 p-5">
          <div>
            <h2 className="text-xl font-bold leading-tight">{item.name}</h2>
            <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
              <span>{item.category}</span>
              {item.brand && (
                <>
                  <span>·</span>
                  <span>{item.brand}</span>
                </>
              )}
              {item.colour && (
                <>
                  <span>·</span>
                  <span>{item.colour}</span>
                </>
              )}
              {item.size && (
                <>
                  <span>·</span>
                  <span>Size {item.size}</span>
                </>
              )}
            </div>
          </div>

          {item.purchasePrice != null && item.purchasePrice > 0 && (
            <p className="font-mono text-lg font-bold text-primary">
              $
              {item.purchasePrice.toLocaleString("en-AU", {
                minimumFractionDigits: 0,
              })}
            </p>
          )}

          {item.notes && (
            <p className="text-sm text-muted-foreground">{item.notes}</p>
          )}

          <div className="flex items-center gap-2 pt-2">
            {item.productUrl && (
              <a
                href={item.productUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                View Product
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full"
              onClick={onEdit}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full text-muted-foreground hover:border-destructive hover:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
