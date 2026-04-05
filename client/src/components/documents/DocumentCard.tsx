import { FileText, Image, Calendar, DollarSign, Building2, Trash2, ExternalLink } from "lucide-react";
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CATEGORY_LABELS } from "@shared/types/document";
import type { HouseholdDocument } from "@shared/types/document";

interface DocumentCardProps {
  document: HouseholdDocument;
  onDelete: (id: string) => void;
}

export function DocumentCard({ document: doc, onDelete }: DocumentCardProps) {
  const isImage = ["jpg", "jpeg", "png", "webp", "gif"].includes(doc.fileType);
  const Icon = isImage ? Image : FileText;

  const formatDate = (date?: string) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <GlassCard className="group relative">
      <GlassCardContent>
        <div className="flex items-start gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="size-5 text-primary" />
          </div>

          <div className="min-w-0 flex-1 space-y-2">
            <div>
              <h3 className="text-sm font-semibold truncate">
                {doc.documentTitle || doc.fileName}
              </h3>
              {doc.provider && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Building2 className="size-3" />
                  <span>{doc.provider}</span>
                </div>
              )}
            </div>

            {doc.aiSummary && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {doc.aiSummary}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2 text-xs">
              {doc.amount != null && (
                <span className="flex items-center gap-1 text-foreground font-medium">
                  <DollarSign className="size-3" />
                  {doc.amount.toLocaleString("en-AU", { minimumFractionDigits: 2 })}
                  {doc.amountLabel && (
                    <span className="text-muted-foreground font-normal">
                      ({doc.amountLabel})
                    </span>
                  )}
                </span>
              )}
              {doc.expiryDate && (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="size-3" />
                  Expires {formatDate(doc.expiryDate)}
                </span>
              )}
              {doc.policyNumber && (
                <span className="text-muted-foreground">
                  Ref: {doc.policyNumber}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-[10px]">
                {CATEGORY_LABELS[doc.category] || doc.category}
              </Badge>
              {doc.subcategory && (
                <Badge variant="outline" className="text-[10px]">
                  {doc.subcategory}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => window.open(doc.fileUrl, "_blank")}
            >
              <ExternalLink className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(doc.id)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      </GlassCardContent>
    </GlassCard>
  );
}
