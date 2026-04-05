import { useState, useRef } from "react";
import { Upload, FileText, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/UserContext";

interface DocumentUploadDialogProps {
  open: boolean;
  onClose: () => void;
  onUpload: (file: File, uploadedBy?: string) => Promise<any>;
}

export function DocumentUploadDialog({ open, onClose, onUpload }: DocumentUploadDialogProps) {
  const { user } = useUser();
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const handleFile = async (file: File) => {
    setSelectedFile(file);
    setIsUploading(true);
    await onUpload(file, user || undefined);
    setIsUploading(false);
    setSelectedFile(null);
    onClose();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-card p-6 shadow-lg">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-3 top-3 h-8 w-8"
          onClick={onClose}
          disabled={isUploading}
        >
          <X className="size-4" />
        </Button>

        <h2 className="text-lg font-semibold mb-4">Upload Document</h2>

        {isUploading ? (
          <div className="flex flex-col items-center gap-3 py-12">
            <Loader2 className="size-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">
              Uploading & analysing {selectedFile?.name}...
            </p>
            <p className="text-xs text-muted-foreground">
              AI is extracting document details
            </p>
          </div>
        ) : (
          <div
            className={`flex flex-col items-center gap-3 rounded-xl border-2 border-dashed p-12 transition-colors cursor-pointer ${
              dragOver
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
              <Upload className="size-6 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">
                Drop a file here or click to browse
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PDF, JPG, PNG up to 20MB
              </p>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              className="hidden"
              onChange={handleChange}
            />
          </div>
        )}

        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <FileText className="size-3.5" />
          <span>AI will auto-categorise and extract key details</span>
        </div>
      </div>
    </div>
  );
}
