import { Star } from "lucide-react";

interface StarRatingProps {
  rating?: number;
  onChange?: (rating: number) => void;
  size?: "sm" | "md";
}

export function StarRating({ rating = 0, onChange, size = "md" }: StarRatingProps) {
  const starSize = size === "sm" ? "size-3.5" : "size-5";

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(star === rating ? 0 : star)}
          className={`${onChange ? "cursor-pointer hover:scale-110" : "cursor-default"} transition-transform`}
        >
          <Star
            className={`${starSize} ${
              star <= rating
                ? "fill-amber-400 text-amber-400"
                : "fill-none text-muted-foreground/30"
            }`}
          />
        </button>
      ))}
    </div>
  );
}
