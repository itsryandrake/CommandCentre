import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DocumentCard } from "@/components/documents/DocumentCard";
import { DocumentUploadDialog } from "@/components/documents/DocumentUploadDialog";
import { Button } from "@/components/ui/button";
import { useDocuments } from "@/hooks/useDocuments";
import { DOCUMENT_CATEGORIES, CATEGORY_LABELS } from "@shared/types/document";
import type { DocumentCategory } from "@shared/types/document";
import { Upload, FileText } from "lucide-react";

export function Documents() {
  const {
    documents,
    groupedDocuments,
    isLoading,
    categoryFilter,
    setCategoryFilter,
    upload,
    remove,
  } = useDocuments();

  const [uploadOpen, setUploadOpen] = useState(false);

  const handleDelete = async (id: string) => {
    await remove(id);
  };

  return (
    <DashboardLayout title="Documents">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Household Documents</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {documents.length} document{documents.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Button onClick={() => setUploadOpen(true)} className="gap-2">
            <Upload className="size-4" />
            Upload Document
          </Button>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategoryFilter(undefined)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              !categoryFilter
                ? "bg-primary text-white border-primary"
                : "border-border hover:border-primary/50"
            }`}
          >
            All
          </button>
          {DOCUMENT_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() =>
                setCategoryFilter(
                  categoryFilter === cat ? undefined : (cat as DocumentCategory)
                )
              }
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                categoryFilter === cat
                  ? "bg-primary text-white border-primary"
                  : "border-border hover:border-primary/50"
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {/* Documents */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-muted-foreground">Loading documents...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-muted mb-4">
              <FileText className="size-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium">No documents yet</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Upload your first document to get started
            </p>
            <Button
              onClick={() => setUploadOpen(true)}
              variant="outline"
              className="mt-4 gap-2"
            >
              <Upload className="size-4" />
              Upload Document
            </Button>
          </div>
        ) : categoryFilter ? (
          // Flat list when filtered
          <div className="grid gap-4">
            {documents.map((doc) => (
              <DocumentCard key={doc.id} document={doc} onDelete={handleDelete} />
            ))}
          </div>
        ) : (
          // Grouped by category
          <div className="space-y-8">
            {Object.entries(groupedDocuments).map(([category, docs]) => (
              <div key={category}>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  {CATEGORY_LABELS[category as DocumentCategory] || category}
                </h3>
                <div className="grid gap-4">
                  {docs.map((doc) => (
                    <DocumentCard
                      key={doc.id}
                      document={doc}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <DocumentUploadDialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUpload={upload}
      />
    </DashboardLayout>
  );
}
