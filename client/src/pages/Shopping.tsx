import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useShopping } from "@/hooks/useShopping";
import { useUser } from "@/context/UserContext";
import { SHOPPING_CATEGORIES } from "@shared/types/shopping";
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card";
import { Plus, Trash2, Check, ShoppingCart } from "lucide-react";

export function Shopping() {
  const { unchecked, checked, isLoading, add, toggle, remove, clearChecked } = useShopping();
  const { user } = useUser();
  const [newItem, setNewItem] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const handleAdd = async () => {
    if (!newItem.trim()) return;
    await add({
      name: newItem.trim(),
      category: newCategory || undefined,
      addedBy: user || undefined,
    });
    setNewItem("");
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <DashboardLayout title="Shopping List">
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Shopping List</h1>
          <p className="text-muted-foreground">Shared family shopping list</p>
        </div>

        {/* Quick-add input */}
        <div className="flex gap-2">
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Add an item..."
              className="flex-1 rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary w-32"
            >
              <option value="">Category</option>
              {SHOPPING_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleAdd}
            disabled={!newItem.trim()}
            className="rounded-lg bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Plus className="size-4" />
          </button>
        </div>

        {/* Category filter chips */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setCategoryFilter("all")}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              categoryFilter === "all"
                ? "bg-primary/10 border-primary/30 text-primary"
                : "border-border/50 text-muted-foreground hover:bg-muted"
            }`}
          >
            All
          </button>
          {SHOPPING_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(categoryFilter === cat ? "all" : cat)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                categoryFilter === cat
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "border-border/50 text-muted-foreground hover:bg-muted"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {isLoading ? (
          <p className="text-muted-foreground text-sm">Loading...</p>
        ) : unchecked.length === 0 && checked.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ShoppingCart className="size-10 text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground">Your shopping list is empty.</p>
          </div>
        ) : (
          <>
            {/* Unchecked items */}
            {unchecked.filter((i) => categoryFilter === "all" || i.category === categoryFilter).length > 0 && (
              <div className="space-y-2">
                {unchecked.filter((i) => categoryFilter === "all" || i.category === categoryFilter).map((item) => (
                  <GlassCard key={item.id} className="py-0">
                    <GlassCardContent className="py-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggle(item.id, true)}
                          className="flex size-6 items-center justify-center rounded-md border-2 border-muted-foreground/30 hover:border-primary hover:bg-primary/10 transition-colors shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{item.name}</p>
                          {item.category && (
                            <p className="text-xs text-muted-foreground">{item.category}</p>
                          )}
                        </div>
                        {item.quantity > 1 && (
                          <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                            x{item.quantity}
                          </span>
                        )}
                        <button
                          onClick={() => remove(item.id)}
                          className="p-1.5 rounded text-muted-foreground/50 hover:text-destructive transition-colors"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </GlassCardContent>
                  </GlassCard>
                ))}
              </div>
            )}

            {/* Checked items */}
            {checked.filter((i) => categoryFilter === "all" || i.category === categoryFilter).length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                    Checked ({checked.filter((i) => categoryFilter === "all" || i.category === categoryFilter).length})
                  </p>
                  <button
                    onClick={clearChecked}
                    className="text-xs text-destructive hover:underline"
                  >
                    Clear all
                  </button>
                </div>
                {checked.filter((i) => categoryFilter === "all" || i.category === categoryFilter).map((item) => (
                  <GlassCard key={item.id} className="py-0 opacity-60">
                    <GlassCardContent className="py-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggle(item.id, false)}
                          className="flex size-6 items-center justify-center rounded-md border-2 border-primary bg-primary/10 text-primary shrink-0"
                        >
                          <Check className="size-3.5" />
                        </button>
                        <p className="text-sm line-through text-muted-foreground flex-1">{item.name}</p>
                        <button
                          onClick={() => remove(item.id)}
                          className="p-1.5 rounded text-muted-foreground/50 hover:text-destructive transition-colors"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </GlassCardContent>
                  </GlassCard>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
