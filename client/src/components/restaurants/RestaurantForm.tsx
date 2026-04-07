import { useState } from "react";
import type { Restaurant, CreateRestaurantInput, RestaurantStatus } from "@shared/types/restaurant";
import { RESTAURANT_CITIES, CUISINE_TYPES, MEAL_TYPES, PRICE_RANGE_LABELS } from "@shared/types/restaurant";
import { useUser } from "@/context/UserContext";
import { scrapeRestaurantInfo } from "@/lib/api";
import { StarRating } from "./StarRating";
import { X, Loader2, Link as LinkIcon } from "lucide-react";

interface RestaurantFormProps {
  existing?: Restaurant;
  onSubmit: (input: CreateRestaurantInput) => Promise<any>;
  onClose: () => void;
}

export function RestaurantForm({ existing, onSubmit, onClose }: RestaurantFormProps) {
  const { user } = useUser();
  const [name, setName] = useState(existing?.name || "");
  const [googleMapsUrl, setGoogleMapsUrl] = useState(existing?.googleMapsUrl || "");
  const [websiteUrl, setWebsiteUrl] = useState(existing?.websiteUrl || "");
  const [phone, setPhone] = useState(existing?.phone || "");
  const [address, setAddress] = useState(existing?.address || "");
  const [city, setCity] = useState(existing?.city || "");
  const [cuisineType, setCuisineType] = useState(existing?.cuisineType || "");
  const [priceRange, setPriceRange] = useState(existing?.priceRange || 0);
  const [mealTypes, setMealTypes] = useState<string[]>(existing?.mealTypes || []);
  const [status, setStatus] = useState<RestaurantStatus>(existing?.status || "want_to_try");
  const [imageUrl, setImageUrl] = useState(existing?.imageUrl || "");
  const [notes, setNotes] = useState(existing?.notes || "");
  const [ratingRyan, setRatingRyan] = useState(existing?.ratingRyan || 0);
  const [ratingEmily, setRatingEmily] = useState(existing?.ratingEmily || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScraping, setIsScraping] = useState(false);

  const toggleMealType = (meal: string) => {
    setMealTypes((prev) =>
      prev.includes(meal) ? prev.filter((m) => m !== meal) : [...prev, meal]
    );
  };

  const beenThere = status === "would_go_back" || status === "would_not_go_back";

  // Try to auto-detect city from an address string
  const detectCity = (addr: string) => {
    if (city) return; // Already set
    const lower = addr.toLowerCase();
    for (const c of RESTAURANT_CITIES) {
      if (lower.includes(c.toLowerCase())) {
        setCity(c);
        return;
      }
    }
  };

  const handleScrape = async () => {
    if (!googleMapsUrl.trim() && !name.trim()) return;
    setIsScraping(true);
    const info = await scrapeRestaurantInfo(
      googleMapsUrl.trim() || undefined,
      name.trim() || undefined,
      city || undefined
    );
    if (info) {
      if (info.name && !name) setName(info.name);
      if (info.address && !address) {
        setAddress(info.address);
        detectCity(info.address);
      }
      if (info.phone && !phone) setPhone(info.phone);
      if (info.cuisineType && !cuisineType) setCuisineType(info.cuisineType);
      if (info.priceRange && !priceRange) setPriceRange(info.priceRange);
      if (info.imageUrl && !imageUrl) setImageUrl(info.imageUrl);
      if (info.websiteUrl && !websiteUrl) setWebsiteUrl(info.websiteUrl);
      if (info.googleMapsUrl && !googleMapsUrl) setGoogleMapsUrl(info.googleMapsUrl);
    }
    setIsScraping(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !city) return;
    setIsSubmitting(true);
    await onSubmit({
      name,
      googleMapsUrl: googleMapsUrl || undefined,
      websiteUrl: websiteUrl || undefined,
      phone: phone || undefined,
      address: address || undefined,
      city,
      cuisineType: cuisineType || undefined,
      priceRange: priceRange || undefined,
      mealTypes,
      status,
      imageUrl: imageUrl || undefined,
      notes: notes || undefined,
      ratingRyan: ratingRyan || undefined,
      ratingEmily: ratingEmily || undefined,
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
            {existing ? "Edit Restaurant" : "Add Restaurant"}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* URL with scrape button */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">
              Google Maps URL or Restaurant Link
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="url"
                  value={googleMapsUrl}
                  onChange={(e) => setGoogleMapsUrl(e.target.value)}
                  placeholder="Paste a Google Maps or restaurant URL..."
                  className="w-full rounded-lg border bg-background pl-9 pr-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <button
                type="button"
                onClick={handleScrape}
                disabled={(!googleMapsUrl.trim() && !name.trim()) || isScraping}
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
                placeholder="Restaurant name"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">City *</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                required
              >
                <option value="">Select city...</option>
                {RESTAURANT_CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Cuisine</label>
              <select
                value={cuisineType}
                onChange={(e) => setCuisineType(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              >
                <option value="">Select cuisine...</option>
                {CUISINE_TYPES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Full address"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Website</label>
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>

            {/* Price Range */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Budget</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriceRange(priceRange === p ? 0 : p)}
                    className={`flex-1 rounded-lg border px-2 py-1.5 text-sm font-medium transition-colors ${
                      priceRange === p
                        ? "bg-primary/10 border-primary/30 text-primary"
                        : "border-border/50 text-foreground/70 hover:bg-muted"
                    }`}
                  >
                    {PRICE_RANGE_LABELS[p]}
                  </button>
                ))}
              </div>
            </div>

            {/* Meal Types */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Meal Type</label>
              <div className="flex gap-1">
                {MEAL_TYPES.map((meal) => (
                  <button
                    key={meal}
                    type="button"
                    onClick={() => toggleMealType(meal)}
                    className={`flex-1 rounded-lg border px-2 py-1.5 text-sm font-medium capitalize transition-colors ${
                      mealTypes.includes(meal)
                        ? "bg-primary/10 border-primary/30 text-primary"
                        : "border-border/50 text-foreground/70 hover:bg-muted"
                    }`}
                  >
                    {meal}
                  </button>
                ))}
              </div>
            </div>

            {/* Status */}
            <div className="col-span-2">
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Have you been?</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStatus("want_to_try")}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    status === "want_to_try"
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-600"
                      : "border-border/50 text-foreground/70 hover:bg-muted"
                  }`}
                >
                  Want to Try
                </button>
                <button
                  type="button"
                  onClick={() => setStatus("would_go_back")}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    beenThere
                      ? "bg-green-500/10 border-green-500/30 text-green-600"
                      : "border-border/50 text-foreground/70 hover:bg-muted"
                  }`}
                >
                  Been There
                </button>
              </div>
            </div>

            {/* Would go back / Would not go back — only when been there */}
            {beenThere && (
              <>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">Would you go back?</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setStatus("would_go_back")}
                      className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                        status === "would_go_back"
                          ? "bg-green-500/10 border-green-500/30 text-green-600"
                          : "border-border/50 text-foreground/70 hover:bg-muted"
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus("would_not_go_back")}
                      className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                        status === "would_not_go_back"
                          ? "bg-red-500/10 border-red-500/30 text-red-600"
                          : "border-border/50 text-foreground/70 hover:bg-muted"
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>

                {/* Ratings — only show when been there */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">Ryan's Rating</label>
                  <StarRating rating={ratingRyan} onChange={setRatingRyan} />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">Emily's Rating</label>
                  <StarRating rating={ratingEmily} onChange={setRatingEmily} />
                </div>
              </>
            )}

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
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What did you enjoy? Any recommendations?"
                rows={3}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary resize-none"
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
              disabled={isSubmitting || !name || !city}
              className="flex-1 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : existing ? "Update" : "Add Restaurant"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
