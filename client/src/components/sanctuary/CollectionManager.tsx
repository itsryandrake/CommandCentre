import { useState, useEffect } from "react";
import { Plus, Trash2, ExternalLink } from "lucide-react";
import {
  GlassCard,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardContent,
} from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCollection } from "@/hooks/useSanctuary";
import { defaultCollection } from "@/data/sanctuary/collectionData";

const CATEGORIES = [
  "All",
  "Accessories",
  "Ambiance",
  "Anal Play",
  "Bondage",
  "Dildo",
  "Games",
  "Lingerie",
  "Other",
  "Toys",
  "Vibrator",
] as const;

export function CollectionManager() {
  const { items, add, remove } = useCollection();
  const [activeCategory, setActiveCategory] = useState("All");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    url: "",
    image: "",
    category: "Toys",
    price: "",
  });

  // Seed collection on first load
  useEffect(() => {
    if (items.length === 0) {
      defaultCollection.forEach((item) => {
        add({
          id: String(item.id),
          name: item.name,
          url: item.url,
          image: item.image,
          category: item.category,
          price: parseFloat(item.price.replace(/[^0-9.]/g, "")) || 0,
          type: item.type,
        });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered =
    activeCategory === "All"
      ? items
      : items.filter((item) => item.category === activeCategory);

  function handleAdd() {
    if (!newItem.name) return;
    add({
      id: crypto.randomUUID(),
      name: newItem.name,
      url: newItem.url,
      image: newItem.image,
      category: newItem.category,
      price: parseFloat(newItem.price) || 0,
      type: "collection",
    });
    setNewItem({ name: "", url: "", image: "", category: "Toys", price: "" });
    setDialogOpen(false);
  }

  return (
    <GlassCard>
      <GlassCardHeader>
        <GlassCardTitle>Our Collection</GlassCardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <button className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/80">
              <Plus className="h-3.5 w-3.5" />
              Add Item
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add to Collection</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-3 pt-2">
              <input
                type="text"
                placeholder="Name"
                value={newItem.name}
                onChange={(e) =>
                  setNewItem((prev) => ({ ...prev, name: e.target.value }))
                }
                className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm"
              />
              <input
                type="text"
                placeholder="URL"
                value={newItem.url}
                onChange={(e) =>
                  setNewItem((prev) => ({ ...prev, url: e.target.value }))
                }
                className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm"
              />
              <input
                type="text"
                placeholder="Image URL"
                value={newItem.image}
                onChange={(e) =>
                  setNewItem((prev) => ({ ...prev, image: e.target.value }))
                }
                className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm"
              />
              <select
                value={newItem.category}
                onChange={(e) =>
                  setNewItem((prev) => ({ ...prev, category: e.target.value }))
                }
                className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm"
              >
                {CATEGORIES.filter((c) => c !== "All").map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Price (e.g. 49.95)"
                value={newItem.price}
                onChange={(e) =>
                  setNewItem((prev) => ({ ...prev, price: e.target.value }))
                }
                className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm"
              />
              <button
                onClick={handleAdd}
                className="mt-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/80"
              >
                Add Item
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </GlassCardHeader>

      <GlassCardContent>
        {/* Category filter */}
        <div className="mb-4 flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-white/5 text-muted-foreground hover:bg-white/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Items grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="group relative overflow-hidden rounded-lg border border-white/10 bg-white/5"
            >
              {item.image && (
                <div className="aspect-square overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
              )}
              <div className="p-2">
                <p className="truncate text-xs font-medium">{item.name}</p>
                <div className="mt-1 flex items-center justify-between">
                  <Badge variant="secondary" className="text-[10px]">
                    {item.category}
                  </Badge>
                  {item.price > 0 && (
                    <span className="text-[10px] text-muted-foreground">
                      ${item.price}
                    </span>
                  )}
                </div>
              </div>

              {/* Hover actions */}
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-white/20 p-2 hover:bg-white/30"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
                <button
                  onClick={() => remove(item.id)}
                  className="rounded-full bg-destructive/20 p-2 hover:bg-destructive/30"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No items in this category yet.
          </p>
        )}
      </GlassCardContent>
    </GlassCard>
  );
}
