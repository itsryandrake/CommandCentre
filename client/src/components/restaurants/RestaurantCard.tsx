import { useState } from "react";
import type { Restaurant } from "@shared/types/restaurant";
import { PRICE_RANGE_LABELS } from "@shared/types/restaurant";
import { StarRating } from "./StarRating";
import { UtensilsCrossed, MapPin } from "lucide-react";

interface RestaurantCardProps {
  item: Restaurant;
  onClick?: () => void;
}

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  want_to_try: { label: "Want to Try", className: "bg-amber-500/90" },
  been_there: { label: "Been There", className: "bg-green-500/90" },
};

const MEAL_LABELS: Record<string, string> = {
  breakfast: "B",
  lunch: "L",
  dinner: "D",
};

export function RestaurantCard({ item, onClick }: RestaurantCardProps) {
  const [imageError, setImageError] = useState(false);
  const status = STATUS_STYLES[item.status] || STATUS_STYLES.want_to_try;

  return (
    <button
      onClick={onClick}
      className="group relative w-full cursor-pointer overflow-hidden rounded-xl bg-card shadow-sm transition-all duration-200 hover:shadow-lg active:scale-[0.98] text-left break-inside-avoid mb-4"
    >
      {/* Image */}
      {item.imageUrl && !imageError ? (
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full aspect-[16/10] object-cover"
          loading="lazy"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="flex aspect-[16/10] items-center justify-center bg-muted/30">
          <UtensilsCrossed className="size-10 text-muted-foreground/30" />
        </div>
      )}

      {/* Status badge */}
      <span
        className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white ${status.className}`}
      >
        {status.label}
      </span>

      {/* Price range badge */}
      {item.priceRange && (
        <span className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white">
          {PRICE_RANGE_LABELS[item.priceRange]}
        </span>
      )}

      {/* Info overlay */}
      <div className="p-3 space-y-2">
        <h3 className="font-medium text-sm leading-tight line-clamp-1">{item.name}</h3>

        <div className="flex items-center gap-2 flex-wrap">
          {item.cuisineType && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
              {item.cuisineType}
            </span>
          )}
          {item.city && (
            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <MapPin className="size-2.5" />
              {item.city}
            </span>
          )}
          {item.mealTypes.length > 0 && (
            <div className="flex gap-0.5">
              {item.mealTypes.map((meal) => (
                <span
                  key={meal}
                  className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground"
                >
                  {MEAL_LABELS[meal] || meal}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Ratings */}
        {(item.ratingRyan || item.ratingEmily) && (
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            {item.ratingRyan != null && item.ratingRyan > 0 && (
              <div className="flex items-center gap-1">
                <span>Ryan</span>
                <StarRating rating={item.ratingRyan} size="sm" />
              </div>
            )}
            {item.ratingEmily != null && item.ratingEmily > 0 && (
              <div className="flex items-center gap-1">
                <span>Emily</span>
                <StarRating rating={item.ratingEmily} size="sm" />
              </div>
            )}
          </div>
        )}
      </div>
    </button>
  );
}
