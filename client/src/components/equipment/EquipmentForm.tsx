import { useState } from "react";
import type { Equipment, CreateEquipmentInput, EquipmentStatus } from "@shared/types/equipment";
import { EQUIPMENT_CATEGORIES } from "@shared/types/equipment";
import { useUser } from "@/context/UserContext";
import { scrapeProductUrl } from "@/lib/api";
import { X, Loader2, Link as LinkIcon } from "lucide-react";

interface EquipmentFormProps {
  existing?: Equipment;
  onSubmit: (input: CreateEquipmentInput) => Promise<any>;
  onClose: () => void;
}

export function EquipmentForm({ existing, onSubmit, onClose }: EquipmentFormProps) {
  const { user } = useUser();
  const [name, setName] = useState(existing?.name || "");
  const [category, setCategory] = useState(existing?.category || "");
  const [brand, setBrand] = useState(existing?.brand || "");
  const [model, setModel] = useState(existing?.model || "");
  const [status, setStatus] = useState<EquipmentStatus>(existing?.status || "working");
  const [imageUrl, setImageUrl] = useState(existing?.imageUrl || "");
  const [productUrl, setProductUrl] = useState(existing?.productUrl || "");
  const [purchaseDate, setPurchaseDate] = useState(existing?.purchaseDate || "");
  const [purchasePrice, setPurchasePrice] = useState(existing?.purchasePrice?.toString() || "");
  const [warrantyExpiry, setWarrantyExpiry] = useState(existing?.warrantyExpiry || "");
  const [lastServiced, setLastServiced] = useState(existing?.lastServiced || "");
  const [location, setLocation] = useState(existing?.location || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScraping, setIsScraping] = useState(false);

  const handleScrape = async () => {
    if (!productUrl.trim()) return;
    setIsScraping(true);
    const info = await scrapeProductUrl(productUrl.trim());
    if (info) {
      if (info.name && !name) setName(info.name);
      if (info.brand && !brand) setBrand(info.brand);
      if (info.model && !model) setModel(info.model);
      if (info.price && !purchasePrice) setPurchasePrice(String(info.price));
      if (info.imageUrl && !imageUrl) setImageUrl(info.imageUrl);
    }
    setIsScraping(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !category) return;
    setIsSubmitting(true);
    await onSubmit({
      name,
      category,
      brand: brand || undefined,
      model: model || undefined,
      status,
      imageUrl: imageUrl || undefined,
      productUrl: productUrl || undefined,
      purchaseDate: purchaseDate || undefined,
      purchasePrice: purchasePrice ? parseFloat(purchasePrice) : undefined,
      warrantyExpiry: warrantyExpiry || undefined,
      lastServiced: lastServiced || undefined,
      location: location || undefined,
      addedBy: user || undefined,
    });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border bg-card p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-medium">
            {existing ? "Edit Equipment" : "Add Equipment"}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product URL with fetch button */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">Product URL</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="url"
                  value={productUrl}
                  onChange={(e) => setProductUrl(e.target.value)}
                  placeholder="Paste a product URL to auto-fill..."
                  className="w-full rounded-lg border bg-background pl-9 pr-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <button
                type="button"
                onClick={handleScrape}
                disabled={!productUrl.trim() || isScraping}
                className="rounded-lg bg-primary/10 text-primary px-3 py-2 text-sm font-medium hover:bg-primary/20 transition-colors disabled:opacity-40 whitespace-nowrap flex items-center gap-1.5"
              >
                {isScraping ? <Loader2 className="size-4 animate-spin" /> : null}
                {isScraping ? "Fetching..." : "Fetch Info"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                required
              >
                <option value="">Select...</option>
                {EQUIPMENT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as EquipmentStatus)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              >
                <option value="working">Working</option>
                <option value="needs_service">Needs Service</option>
                <option value="retired">Retired</option>
                <option value="sold">Sold</option>
                <option value="donated">Donated</option>
                <option value="thrown_out">Thrown Out</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Brand</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Model</label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Purchase Date</label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Purchase Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Warranty Expiry</label>
              <input
                type="date"
                value={warrantyExpiry}
                onChange={(e) => setWarrantyExpiry(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Last Serviced</label>
              <input
                type="date"
                value={lastServiced}
                onChange={(e) => setLastServiced(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>

            <div className="col-span-2">
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Image URL</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>

            <div className="col-span-2">
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Kitchen bench, Garage shelf, Backyard"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name || !category}
              className="flex-1 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : existing ? "Update" : "Add Equipment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
