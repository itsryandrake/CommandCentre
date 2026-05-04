import { useState, useRef, useEffect } from "react";
import {
  X,
  Loader2,
  Link as LinkIcon,
  AlertTriangle,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { scrapeWishlistItem } from "@/lib/api";
import type { WishlistItem } from "@shared/types/dreamHomeWishlist";

interface Props {
  onClose: () => void;
  onAdded: (item: WishlistItem) => void;
}

const MAX_URLS = 10;

type LineStatus = "pending" | "scraping" | "success" | "failed";

interface Line {
  url: string;
  status: LineStatus;
  title?: string;
  error?: string;
}

export function AddWishlistItemDialog({ onClose, onAdded }: Props) {
  const [text, setText] = useState("");
  const [lines, setLines] = useState<Line[] | null>(null);
  const [tooMany, setTooMany] = useState(false);
  const aliveRef = useRef(true);

  useEffect(() => {
    return () => {
      aliveRef.current = false;
    };
  }, []);

  const parseUrls = (raw: string): { urls: string[]; over: boolean } => {
    const all = raw
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    return { urls: all.slice(0, MAX_URLS), over: all.length > MAX_URLS };
  };

  const start = (e: React.FormEvent) => {
    e.preventDefault();
    const { urls, over } = parseUrls(text);
    if (urls.length === 0) return;
    setTooMany(over);

    const initial: Line[] = urls.map((url) => ({ url, status: "pending" }));
    setLines(initial);

    urls.forEach((url, idx) => {
      setLines((prev) => {
        if (!prev) return prev;
        const next = [...prev];
        next[idx] = { ...next[idx], status: "scraping" };
        return next;
      });

      scrapeWishlistItem(url)
        .then((item) => {
          if (!aliveRef.current) return;
          onAdded(item);
          setLines((prev) => {
            if (!prev) return prev;
            const next = [...prev];
            next[idx] = { url, status: "success", title: item.title };
            return next;
          });
        })
        .catch((err) => {
          if (!aliveRef.current) return;
          setLines((prev) => {
            if (!prev) return prev;
            const next = [...prev];
            next[idx] = {
              url,
              status: "failed",
              error: err instanceof Error ? err.message : "Failed to scrape",
            };
            return next;
          });
        });
    });
  };

  const allDone =
    lines !== null && lines.every((l) => l.status === "success" || l.status === "failed");
  const inFlight =
    lines !== null && lines.some((l) => l.status === "scraping" || l.status === "pending");
  const successCount = lines?.filter((l) => l.status === "success").length ?? 0;
  const failedCount = lines?.filter((l) => l.status === "failed").length ?? 0;

  const reset = () => {
    setLines(null);
    setText("");
    setTooMany(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl border bg-card shadow-lg max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 pb-4 shrink-0">
          <h2 className="text-xl font-medium">Add Wishlist Items</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {lines === null ? (
          <form onSubmit={start} className="px-6 pb-6 space-y-4 overflow-y-auto">
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">
                Product URLs (one per line, up to {MAX_URLS})
              </label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-3 size-4 text-muted-foreground" />
                <textarea
                  autoFocus
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={`https://www.templeandwebster.com.au/...
https://www.harveynorman.com.au/...
https://www.winnings.com.au/...`}
                  rows={8}
                  className="w-full rounded-lg border bg-background pl-9 pr-3 py-2 text-sm outline-none focus:border-primary font-mono"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                We'll scrape each one in parallel — title, description, image, price, room.
              </p>
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
                disabled={parseUrls(text).urls.length === 0}
                className="flex-1 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                Scrape & Add{parseUrls(text).urls.length > 0 ? ` (${parseUrls(text).urls.length})` : ""}
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col flex-1 min-h-0">
            <div className="px-6 pb-3 text-sm text-muted-foreground shrink-0">
              {inFlight ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="size-3.5 animate-spin" />
                  Scraping {lines.filter((l) => l.status === "scraping").length} of{" "}
                  {lines.length}...
                </span>
              ) : (
                <span>
                  {successCount} added
                  {failedCount > 0 && ` · ${failedCount} failed`}
                </span>
              )}
              {tooMany && (
                <div className="mt-2 flex items-center gap-1.5 text-amber-600 text-xs">
                  <AlertTriangle className="size-3.5" />
                  Only the first {MAX_URLS} URLs were processed.
                </div>
              )}
            </div>

            <div className="px-6 overflow-y-auto flex-1">
              <ul className="space-y-2">
                {lines.map((line, idx) => (
                  <li
                    key={idx}
                    className="rounded-lg border bg-muted/20 px-3 py-2 text-sm"
                  >
                    <div className="flex items-start gap-2">
                      <StatusIcon status={line.status} />
                      <div className="flex-1 min-w-0">
                        <div className="truncate font-mono text-xs text-muted-foreground">
                          {line.url}
                        </div>
                        {line.status === "success" && line.title && (
                          <div className="mt-0.5 text-foreground truncate">
                            {line.title}
                          </div>
                        )}
                        {line.status === "failed" && line.error && (
                          <div className="mt-0.5 text-amber-600 text-xs">
                            {line.error}
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-3 p-6 pt-4 shrink-0 border-t">
              <button
                onClick={reset}
                disabled={!allDone}
                className="flex-1 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
              >
                Add more
              </button>
              <button
                onClick={onClose}
                disabled={inFlight}
                className="flex-1 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {allDone ? "Done" : "Working..."}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: LineStatus }) {
  if (status === "pending")
    return <Circle className="size-4 mt-0.5 text-muted-foreground/50 shrink-0" />;
  if (status === "scraping")
    return <Loader2 className="size-4 mt-0.5 animate-spin text-primary shrink-0" />;
  if (status === "success")
    return <CheckCircle2 className="size-4 mt-0.5 text-green-600 shrink-0" />;
  return <AlertTriangle className="size-4 mt-0.5 text-amber-600 shrink-0" />;
}
