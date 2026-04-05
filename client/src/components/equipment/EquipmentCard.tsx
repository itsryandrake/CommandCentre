import { useState } from "react";
import type { Equipment } from "@shared/types/equipment";
import { Wrench } from "lucide-react";

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  working: { label: "Working", className: "bg-green-500/90" },
  needs_service: { label: "Needs Service", className: "bg-amber-500/90" },
  retired: { label: "Retired", className: "bg-neutral-500/90" },
  sold: { label: "Sold", className: "bg-blue-500/90" },
  donated: { label: "Donated", className: "bg-purple-500/90" },
  thrown_out: { label: "Thrown Out", className: "bg-red-500/90" },
};

interface EquipmentCardProps {
  item: Equipment;
  onClick?: () => void;
}

export function EquipmentCard({ item, onClick }: EquipmentCardProps) {
  const [imageError, setImageError] = useState(false);
  const status = STATUS_STYLES[item.status] || STATUS_STYLES.working;

  return (
    <button
      onClick={onClick}
      className="group relative w-full cursor-pointer overflow-hidden rounded-xl bg-card shadow-sm transition-all duration-200 hover:shadow-lg active:scale-[0.98] text-left break-inside-avoid mb-4"
    >
      {/* Image — front and centre */}
      {item.imageUrl && !imageError ? (
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full object-contain"
          loading="lazy"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="flex aspect-[4/3] items-center justify-center bg-muted/30">
          <Wrench className="size-10 text-muted-foreground/30" />
        </div>
      )}

      {/* Status badge — always visible, top-left */}
      {item.status !== "working" && (
        <span
          className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white ${status.className}`}
        >
          {status.label}
        </span>
      )}

      {/* Hover overlay — title, brand, price */}
      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/20 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
        <h3 className="line-clamp-2 text-sm font-bold leading-tight text-white">
          {item.name}
        </h3>
        {(item.brand || item.category) && (
          <p className="mt-0.5 text-xs text-white/70">
            {item.category}
            {item.brand && ` · ${item.brand}`}
          </p>
        )}
        {item.purchasePrice != null && item.purchasePrice > 0 && (
          <p className="mt-1 font-mono text-sm font-semibold text-white/90">
            ${item.purchasePrice.toLocaleString("en-AU", { minimumFractionDigits: 0 })}
          </p>
        )}
      </div>
    </button>
  );
}
