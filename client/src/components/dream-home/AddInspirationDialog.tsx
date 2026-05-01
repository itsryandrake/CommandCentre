import { useState, useCallback, useRef } from "react";
import {
  Loader2,
  Sparkles,
  X,
  Upload,
  ImagePlus,
  Link,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  scrapeDreamHomeListing,
  pollDreamHomeJob,
  uploadDreamHomeFiles,
  importDreamHomeUrls,
} from "@/lib/api";
import type { DreamHomeImage, DreamHomeScrapeJob } from "@shared/types/dreamHome";
import { cn } from "@/lib/utils";

export function AddInspirationDialog({
  open,
  onOpenChange,
  onImagesAdded,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImagesAdded: (images: DreamHomeImage[]) => void;
}) {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [job, setJob] = useState<DreamHomeScrapeJob | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [showPasteUrls, setShowPasteUrls] = useState(false);
  const [pasteUrls, setPasteUrls] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const cleanup = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const handleClose = useCallback(
    (open: boolean) => {
      if (!open) {
        cleanup();
        setUrl("");
        setError(null);
        setJob(null);
        setIsLoading(false);
        setPendingFiles([]);
        setShowPasteUrls(false);
        setPasteUrls("");
      }
      onOpenChange(open);
    },
    [onOpenChange, cleanup]
  );

  const startPolling = useCallback(
    (jobId: string) => {
      pollRef.current = setInterval(async () => {
        try {
          const status = await pollDreamHomeJob(jobId);
          setJob(status);

          if (status.status === "complete" || status.status === "error") {
            cleanup();
            setIsLoading(false);
            if (status.status === "complete" && status.images.length > 0) {
              onImagesAdded(status.images);
            }
            if (status.status === "error") {
              setError(status.error || "Processing failed");
            }
          }
        } catch {
          cleanup();
          setIsLoading(false);
          setError("Lost connection to processing job");
        }
      }, 2000);
    },
    [onImagesAdded, cleanup]
  );

  const handleUploadFiles = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;
      setIsLoading(true);
      setError(null);
      setJob(null);

      try {
        const result = await uploadDreamHomeFiles(files);
        startPolling(result.jobId);
      } catch (err: any) {
        setError(err.message || "Failed to upload files");
        setIsLoading(false);
      }
    },
    [startPolling]
  );

  const handleImportPastedUrls = useCallback(async () => {
    const urls = pasteUrls
      .split(/[\n,]+/)
      .map((u) => u.trim())
      .filter((u) => u.startsWith("http"));
    if (urls.length === 0) {
      setError("No valid URLs found. Paste one URL per line.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setJob(null);
    try {
      const result = await importDreamHomeUrls(urls);
      startPolling(result.jobId);
    } catch (err: any) {
      setError(err.message || "Failed to import URLs");
      setIsLoading(false);
    }
  }, [pasteUrls, startPolling]);

  const handleSubmit = useCallback(async () => {
    if (pendingFiles.length > 0) {
      handleUploadFiles(pendingFiles);
      setPendingFiles([]);
      return;
    }

    if (!url.trim()) return;
    setIsLoading(true);
    setError(null);
    setJob(null);

    try {
      const result = await scrapeDreamHomeListing(url.trim());

      if (result.job) {
        setJob(result.job);
        setIsLoading(false);
        if (result.job.images.length > 0) {
          onImagesAdded(result.job.images);
        }
        return;
      }

      if (result.jobId) {
        startPolling(result.jobId);
      }
    } catch (err: any) {
      setError(err.message || "Failed to process URL");
      setIsLoading(false);
    }
  }, [url, pendingFiles, onImagesAdded, startPolling, handleUploadFiles]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith("image/")
      );
      if (files.length === 0) {
        setError("No image files found. Please drop image files (JPG, PNG, WebP).");
        return;
      }
      setPendingFiles(files);
      setError(null);
    },
    []
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        setPendingFiles(files);
        setError(null);
      }
      e.target.value = "";
    },
    []
  );

  const removePendingFile = useCallback((index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Inspiration</DialogTitle>
          <DialogDescription>
            Paste a listing URL, or drag and drop images to upload.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* URL input */}
          <div className="flex gap-2">
            <Input
              placeholder="https://realestate.com.au/property/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              disabled={isLoading || pendingFiles.length > 0}
            />
            <Button
              onClick={handleSubmit}
              disabled={isLoading || (!url.trim() && pendingFiles.length === 0)}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Divider */}
          {!job && !isLoading && (
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">or</span>
              <div className="h-px flex-1 bg-border" />
            </div>
          )}

          {/* Paste URLs toggle */}
          {!job && !isLoading && pendingFiles.length === 0 && (
            <button
              onClick={() => setShowPasteUrls(!showPasteUrls)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Link className="h-3.5 w-3.5" />
              {showPasteUrls ? "Hide" : "Paste multiple image URLs"}
            </button>
          )}

          {/* Paste URLs textarea */}
          {showPasteUrls && !job && !isLoading && pendingFiles.length === 0 && (
            <div className="space-y-2">
              <Textarea
                placeholder={"Paste image URLs, one per line:\nhttps://i2.au.reastatic.net/...\nhttps://i2.au.reastatic.net/..."}
                value={pasteUrls}
                onChange={(e) => setPasteUrls(e.target.value)}
                rows={5}
                className="text-xs"
              />
              <Button
                onClick={handleImportPastedUrls}
                disabled={!pasteUrls.trim()}
                className="w-full gap-2"
                size="sm"
              >
                <ImagePlus className="h-4 w-4" />
                Import {pasteUrls.split(/[\n,]+/).filter((u) => u.trim().startsWith("http")).length} URL{pasteUrls.split(/[\n,]+/).filter((u) => u.trim().startsWith("http")).length !== 1 ? "s" : ""}
              </Button>
            </div>
          )}

          {/* Drop zone */}
          {!job && !isLoading && pendingFiles.length === 0 && !showPasteUrls && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed py-8 transition-colors",
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-border/50 hover:border-border hover:bg-muted/50"
              )}
            >
              <Upload className={cn("h-8 w-8", isDragging ? "text-primary" : "text-muted-foreground/40")} />
              <div className="text-center">
                <p className="text-sm font-medium">
                  {isDragging ? "Drop images here" : "Drag and drop images"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  or click to browse — JPG, PNG, WebP
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}

          {/* Pending files preview */}
          {pendingFiles.length > 0 && !isLoading && !job && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {pendingFiles.length} image{pendingFiles.length !== 1 ? "s" : ""} ready to upload
                </p>
                <button
                  onClick={() => setPendingFiles([])}
                  className="text-xs text-primary hover:underline"
                >
                  Clear all
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                {pendingFiles.map((file, i) => (
                  <div key={i} className="group relative aspect-square overflow-hidden rounded-lg bg-muted">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="h-full w-full object-cover"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removePendingFile(i);
                      }}
                      className="absolute top-1 right-1 rounded-full bg-black/60 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-border/50 hover:border-border hover:bg-muted/50 transition-colors"
                >
                  <ImagePlus className="h-5 w-5 text-muted-foreground/40" />
                </button>
              </div>
              <Button onClick={handleSubmit} className="w-full gap-2">
                <Upload className="h-4 w-4" />
                Upload {pendingFiles.length} image{pendingFiles.length !== 1 ? "s" : ""}
              </Button>
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {/* Progress */}
          {job && job.status === "processing" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Processing images...</span>
                <span>
                  {job.progress.done} / {job.progress.total}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{
                    width: `${job.progress.total > 0 ? (job.progress.done / job.progress.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Completion */}
          {job && job.status === "complete" && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {job.images.length} image{job.images.length !== 1 ? "s" : ""} added to your board
              </p>
              {job.images.length > 0 && (
                <div className="grid grid-cols-4 gap-2 max-h-60 overflow-y-auto">
                  {job.images.map((img) => (
                    <div
                      key={img.id}
                      className="aspect-square overflow-hidden rounded-lg"
                    >
                      <img
                        src={img.imageUrl}
                        alt={img.aiDescription || ""}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              )}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleClose(false)}
              >
                Done
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
