import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useEquipment } from "@/hooks/useEquipment";
import { EquipmentCard } from "@/components/equipment/EquipmentCard";
import { EquipmentForm } from "@/components/equipment/EquipmentForm";
import { EquipmentNotes } from "@/components/equipment/EquipmentNotes";
import { EQUIPMENT_CATEGORIES } from "@shared/types/equipment";
import type { Equipment, CreateEquipmentInput, UpdateEquipmentInput } from "@shared/types/equipment";
import { Plus, X, ExternalLink, Trash2 } from "lucide-react";
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card";

const STATUS_LABELS: Record<string, string> = {
  working: "Working",
  needs_service: "Needs Service",
  retired: "Retired",
  sold: "Sold",
  donated: "Donated",
  thrown_out: "Thrown Out",
};

const DISPOSED_STATUSES = ["sold", "donated", "thrown_out"];

function formatDate(dateStr?: string) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-AU", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function EquipmentPage() {
  const { equipment, isLoading, categoryFilter, setCategoryFilter, create, update, remove } = useEquipment();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Equipment | undefined>();
  const [viewing, setViewing] = useState<Equipment | undefined>();

  const handleCreate = async (input: CreateEquipmentInput) => {
    await create(input);
  };

  const handleEdit = async (input: CreateEquipmentInput) => {
    if (!editing) return;
    await update(editing.id, input as UpdateEquipmentInput);
  };

  const handleDelete = async (id: string) => {
    await remove(id);
    setViewing(undefined);
  };

  const totalValue = equipment.reduce((sum, e) => sum + (e.purchasePrice || 0), 0);

  return (
    <DashboardLayout title="Equipment">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-normal">Home Equipment</h1>
            <p className="text-muted-foreground mt-1">
              Track your home equipment, warranties, and maintenance schedules
            </p>
          </div>
          <button
            onClick={() => {
              setEditing(undefined);
              setShowForm(true);
            }}
            className="flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="size-4" />
            Add Equipment
          </button>
        </div>

        {/* Category filter chips */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Categories</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategoryFilter(undefined)}
              className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                !categoryFilter
                  ? "bg-primary/10 border-primary/30 text-primary font-medium"
                  : "border-border/50 text-foreground/70 hover:bg-muted"
              }`}
            >
              All
            </button>
            {EQUIPMENT_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(categoryFilter === cat ? undefined : cat)}
                className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                  categoryFilter === cat
                    ? "bg-primary/10 border-primary/30 text-primary font-medium"
                    : "border-border/50 text-foreground/70 hover:bg-muted"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <span className="font-medium text-foreground text-base">{equipment.length} Units</span>
          <span>Track warranties, service dates, and maintenance for each item.</span>
          {totalValue > 0 && (
            <span>Total value: ${totalValue.toLocaleString("en-AU", { minimumFractionDigits: 0 })}</span>
          )}
        </div>

        {/* Equipment grid */}
        {isLoading ? (
          <p className="text-muted-foreground text-sm">Loading equipment...</p>
        ) : equipment.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-muted-foreground">No equipment added yet.</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-3 text-primary hover:underline text-sm"
            >
              Add your first item
            </button>
          </div>
        ) : (
          <div style={{ columns: "4 240px", columnGap: "16px" }}>
            {equipment.map((item) => (
              <EquipmentCard
                key={item.id}
                item={item}
                onClick={() => setViewing(item)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail view modal */}
      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border bg-card p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-medium">{viewing.name}</h2>
              <button onClick={() => setViewing(undefined)} className="p-2 rounded-lg hover:bg-muted transition-colors">
                <X className="size-5" />
              </button>
            </div>

            {/* Details */}
            <div className="space-y-3 mb-6">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Category</p>
                  <p>{viewing.category}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Status</p>
                  <p>{STATUS_LABELS[viewing.status] || viewing.status}</p>
                </div>
                {viewing.brand && (
                  <div>
                    <p className="text-muted-foreground text-xs">Brand</p>
                    <p>{viewing.brand}</p>
                  </div>
                )}
                {viewing.model && (
                  <div>
                    <p className="text-muted-foreground text-xs">Model</p>
                    <p>{viewing.model}</p>
                  </div>
                )}
                {viewing.purchaseDate && (
                  <div>
                    <p className="text-muted-foreground text-xs">Purchase Date</p>
                    <p>{formatDate(viewing.purchaseDate)}</p>
                  </div>
                )}
                {viewing.purchasePrice && (
                  <div>
                    <p className="text-muted-foreground text-xs">Purchase Price</p>
                    <p>${viewing.purchasePrice.toLocaleString("en-AU")}</p>
                  </div>
                )}
                {viewing.warrantyExpiry && (
                  <div>
                    <p className="text-muted-foreground text-xs">Warranty Expiry</p>
                    <p>{formatDate(viewing.warrantyExpiry)}</p>
                  </div>
                )}
                {viewing.lastServiced && (
                  <div>
                    <p className="text-muted-foreground text-xs">Last Serviced</p>
                    <p>{formatDate(viewing.lastServiced)}</p>
                  </div>
                )}
                {viewing.location && (
                  <div>
                    <p className="text-muted-foreground text-xs">Location</p>
                    <p>{viewing.location}</p>
                  </div>
                )}
              </div>

              {viewing.productUrl && (
                <a
                  href={viewing.productUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="size-3.5" />
                  View product page
                </a>
              )}
            </div>

            {/* Notes log */}
            <div className="border-t pt-4 mb-4">
              <EquipmentNotes equipmentId={viewing.id} />
            </div>

            {/* Actions */}
            <div className="flex gap-3 border-t pt-4">
              <button
                onClick={() => {
                  setViewing(undefined);
                  setEditing(viewing);
                  setShowForm(true);
                }}
                className="flex-1 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
              >
                Edit
              </button>
              {DISPOSED_STATUSES.includes(viewing.status) && (
                <button
                  onClick={() => handleDelete(viewing.id)}
                  className="flex items-center gap-2 rounded-lg bg-destructive/10 text-destructive px-4 py-2 text-sm font-medium hover:bg-destructive/20 transition-colors"
                >
                  <Trash2 className="size-4" />
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Form dialog */}
      {showForm && (
        <EquipmentForm
          existing={editing}
          onSubmit={editing ? handleEdit : handleCreate}
          onClose={() => {
            setShowForm(false);
            setEditing(undefined);
          }}
        />
      )}
    </DashboardLayout>
  );
}
