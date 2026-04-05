import { useState, useEffect, useCallback, useMemo } from "react";
import type { HouseholdDocument, DocumentCategory } from "@shared/types/document";
import { fetchDocuments, uploadDocument, updateDocumentItem, deleteDocumentItem } from "@/lib/api";

export function useDocuments() {
  const [documents, setDocuments] = useState<HouseholdDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<DocumentCategory | undefined>();

  const load = useCallback(async () => {
    setIsLoading(true);
    const data = await fetchDocuments(categoryFilter);
    setDocuments(data);
    setIsLoading(false);
  }, [categoryFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const upload = async (file: File, uploadedBy?: string) => {
    const doc = await uploadDocument(file, uploadedBy);
    if (doc) await load();
    return doc;
  };

  const update = async (id: string, input: Partial<HouseholdDocument>) => {
    const doc = await updateDocumentItem(id, input);
    if (doc) await load();
    return doc;
  };

  const remove = async (id: string) => {
    const success = await deleteDocumentItem(id);
    if (success) setDocuments((prev) => prev.filter((d) => d.id !== id));
    return success;
  };

  const groupedDocuments = useMemo(() => {
    const groups: Record<string, HouseholdDocument[]> = {};
    for (const doc of documents) {
      const key = doc.category;
      if (!groups[key]) groups[key] = [];
      groups[key].push(doc);
    }
    return groups;
  }, [documents]);

  return {
    documents,
    groupedDocuments,
    isLoading,
    categoryFilter,
    setCategoryFilter,
    upload,
    update,
    remove,
    reload: load,
  };
}
