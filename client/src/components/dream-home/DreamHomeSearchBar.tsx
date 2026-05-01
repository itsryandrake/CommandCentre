import { Search, X } from "lucide-react";

export function DreamHomeSearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative max-w-sm">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search rooms, styles, descriptions..."
        className="w-full rounded-lg border border-border bg-background pl-9 pr-8 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2"
        >
          <X className="size-3.5 text-muted-foreground hover:text-foreground transition-colors" />
        </button>
      )}
    </div>
  );
}
