import { useState, useEffect, useMemo, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type PaginationState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Search,
  Trash2,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  X,
  Image as ImageIcon,
  Loader2,
  Pencil,
} from "lucide-react";
import {
  fetchWishlistItems,
  updateWishlistItem,
  deleteWishlistItem,
  bulkDeleteWishlistItems,
} from "@/lib/api";
import {
  WISHLIST_ROOMS,
  WISHLIST_PRIORITIES,
  WISHLIST_STATUSES,
  type WishlistItem,
  type WishlistRoom,
  type WishlistPriority,
  type WishlistStatus,
  type UpdateWishlistInput,
} from "@shared/types/dreamHomeWishlist";
import { AddWishlistItemDialog } from "./AddWishlistItemDialog";

const PRIORITY_STYLES: Record<WishlistPriority, string> = {
  "Must-have": "bg-red-500/10 text-red-600",
  "Should-have": "bg-amber-500/10 text-amber-600",
  "Nice-to-have": "bg-slate-500/10 text-slate-600",
};

const STATUS_STYLES: Record<WishlistStatus, string> = {
  Wanted: "bg-blue-500/10 text-blue-600",
  Bought: "bg-green-500/10 text-green-600",
  Dismissed: "bg-neutral-500/10 text-neutral-500 line-through",
};

const AUD = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  maximumFractionDigits: 2,
});

function SortIcon({ column }: { column: any }) {
  const sorted = column.getIsSorted();
  if (sorted === "asc") return <ArrowUp className="ml-1 inline size-3.5" />;
  if (sorted === "desc") return <ArrowDown className="ml-1 inline size-3.5" />;
  return <ArrowUpDown className="ml-1 inline size-3.5 opacity-30" />;
}

export function WishlistTable() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [roomFilter, setRoomFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 50 });
  const [pendingDelete, setPendingDelete] = useState<{ ids: string[]; titles: string[] } | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    const data = await fetchWishlistItems();
    setItems(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const filtered = useMemo(() => {
    let data = items;
    if (roomFilter) data = data.filter((i) => i.room === roomFilter);
    if (statusFilter) data = data.filter((i) => i.status === statusFilter);
    return data;
  }, [items, roomFilter, statusFilter]);

  const filteredTotal = useMemo(
    () =>
      filtered.reduce(
        (sum, i) => sum + (i.price ?? 0) * (i.quantity ?? 1),
        0
      ),
    [filtered]
  );

  const selectedTotal = useMemo(
    () =>
      filtered
        .filter((i) => selected.has(i.id))
        .reduce(
          (sum, i) => sum + (i.price ?? 0) * (i.quantity ?? 1),
          0
        ),
    [filtered, selected]
  );

  const headerTotal = selected.size > 0 ? selectedTotal : filteredTotal;

  const patchLocal = useCallback((id: string, patch: Partial<WishlistItem>) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }, []);

  const handlePatch = useCallback(
    async (id: string, patch: UpdateWishlistInput) => {
      patchLocal(id, patch as Partial<WishlistItem>);
      const updated = await updateWishlistItem(id, patch);
      if (updated) patchLocal(id, updated);
    },
    [patchLocal]
  );

  const requestDelete = useCallback(
    (ids: string[], itemsForDisplay: WishlistItem[]) => {
      if (ids.length === 0) return;
      const idSet = new Set(ids);
      const titles = itemsForDisplay
        .filter((i) => idSet.has(i.id))
        .map((i) => i.title);
      setPendingDelete({ ids, titles });
    },
    []
  );

  const confirmDelete = useCallback(async () => {
    if (!pendingDelete) return;
    const { ids } = pendingDelete;
    const idSet = new Set(ids);
    setItems((prev) => prev.filter((i) => !idSet.has(i.id)));
    setSelected((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });
    setPendingDelete(null);
    if (ids.length === 1) await deleteWishlistItem(ids[0]);
    else await bulkDeleteWishlistItems(ids);
  }, [pendingDelete]);

  const handleBulkRoomChange = useCallback(
    async (room: WishlistRoom) => {
      const ids = Array.from(selected);
      if (ids.length === 0) return;
      setItems((prev) =>
        prev.map((i) => (selected.has(i.id) ? { ...i, room } : i))
      );
      await Promise.all(ids.map((id) => updateWishlistItem(id, { room })));
    },
    [selected]
  );

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelected((prev) => {
      if (prev.size === filtered.length) return new Set();
      return new Set(filtered.map((i) => i.id));
    });
  }, [filtered]);

  const columns = useMemo<ColumnDef<WishlistItem>[]>(
    () => [
      {
        id: "select",
        enableSorting: false,
        header: () => (
          <input
            type="checkbox"
            checked={filtered.length > 0 && selected.size === filtered.length}
            onChange={toggleSelectAll}
            className="size-4 rounded border-input"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={selected.has(row.original.id)}
            onChange={(e) => {
              e.stopPropagation();
              toggleSelect(row.original.id);
            }}
            onClick={(e) => e.stopPropagation()}
            className="size-4 rounded border-input"
          />
        ),
      },
      {
        id: "image",
        header: "",
        enableSorting: false,
        cell: ({ row }) => {
          const r = row.original;
          return r.imageUrl ? (
            <img
              src={r.imageUrl}
              alt=""
              className="size-12 rounded-md object-cover"
              onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
            />
          ) : (
            <div className="size-12 rounded-md bg-muted flex items-center justify-center">
              <ImageIcon className="size-4 text-muted-foreground/50" />
            </div>
          );
        },
      },
      {
        accessorKey: "title",
        header: ({ column }) => (
          <button className="flex items-center" onClick={() => column.toggleSorting()}>
            Title <SortIcon column={column} />
          </button>
        ),
        cell: ({ row }) => (
          <TitleCell
            value={row.original.title}
            sourceUrl={row.original.sourceUrl}
            onSave={(v) => handlePatch(row.original.id, { title: v })}
          />
        ),
      },
      {
        accessorKey: "description",
        header: "Description",
        enableSorting: false,
        cell: ({ row }) => (
          <EditableText
            value={row.original.description ?? ""}
            onSave={(v) => handlePatch(row.original.id, { description: v || null })}
            placeholder="—"
            className="text-sm text-muted-foreground max-w-[280px] truncate"
            multiline
          />
        ),
      },
      {
        accessorKey: "room",
        header: ({ column }) => (
          <button className="flex items-center" onClick={() => column.toggleSorting()}>
            Room <SortIcon column={column} />
          </button>
        ),
        cell: ({ row }) => (
          <select
            value={row.original.room}
            onChange={(e) =>
              handlePatch(row.original.id, { room: e.target.value as WishlistRoom })
            }
            onClick={(e) => e.stopPropagation()}
            className="rounded-md bg-transparent border border-input px-2 py-1 text-xs outline-none focus:border-primary"
          >
            {WISHLIST_ROOMS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        ),
      },
      {
        accessorKey: "price",
        header: ({ column }) => (
          <div className="flex flex-col gap-0.5 leading-tight">
            <button
              className="flex items-center self-start"
              onClick={() => column.toggleSorting()}
            >
              Price <SortIcon column={column} />
            </button>
            <span
              className={`text-[11px] font-medium tabular-nums ${selected.size > 0 ? "text-primary" : "text-muted-foreground"}`}
              title={selected.size > 0 ? "Total of selected rows" : "Total of all filtered rows"}
            >
              {AUD.format(headerTotal)}
            </span>
          </div>
        ),
        cell: ({ row }) => (
          <EditableNumber
            value={row.original.price}
            onSave={(v) => handlePatch(row.original.id, { price: v })}
            format={(n) => (n != null ? AUD.format(n) : "—")}
            className="font-medium tabular-nums"
          />
        ),
      },
      {
        accessorKey: "quantity",
        header: ({ column }) => (
          <button className="flex items-center" onClick={() => column.toggleSorting()}>
            Qty <SortIcon column={column} />
          </button>
        ),
        cell: ({ row }) => (
          <EditableNumber
            value={row.original.quantity}
            onSave={(v) => handlePatch(row.original.id, { quantity: Math.max(1, v ?? 1) })}
            format={(n) => String(n ?? 1)}
            className="tabular-nums"
            integer
          />
        ),
      },
      {
        accessorKey: "priority",
        header: ({ column }) => (
          <button className="flex items-center" onClick={() => column.toggleSorting()}>
            Priority <SortIcon column={column} />
          </button>
        ),
        cell: ({ row }) => (
          <select
            value={row.original.priority}
            onChange={(e) =>
              handlePatch(row.original.id, { priority: e.target.value as WishlistPriority })
            }
            onClick={(e) => e.stopPropagation()}
            className={`rounded-full px-2 py-0.5 text-xs font-medium border-0 outline-none cursor-pointer ${PRIORITY_STYLES[row.original.priority]}`}
          >
            {WISHLIST_PRIORITIES.map((p) => (
              <option key={p} value={p} className="bg-background text-foreground">
                {p}
              </option>
            ))}
          </select>
        ),
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <button className="flex items-center" onClick={() => column.toggleSorting()}>
            Status <SortIcon column={column} />
          </button>
        ),
        cell: ({ row }) => (
          <select
            value={row.original.status}
            onChange={(e) =>
              handlePatch(row.original.id, { status: e.target.value as WishlistStatus })
            }
            onClick={(e) => e.stopPropagation()}
            className={`rounded-full px-2 py-0.5 text-xs font-medium border-0 outline-none cursor-pointer ${STATUS_STYLES[row.original.status]}`}
          >
            {WISHLIST_STATUSES.map((s) => (
              <option key={s} value={s} className="bg-background text-foreground no-underline">
                {s}
              </option>
            ))}
          </select>
        ),
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => (
          <button
            onClick={(e) => {
              e.stopPropagation();
              requestDelete([row.original.id], [row.original]);
            }}
            className="rounded p-1 text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all"
            title="Delete"
          >
            <Trash2 className="size-4" />
          </button>
        ),
      },
    ],
    [filtered.length, selected, headerTotal, toggleSelect, toggleSelectAll, handlePatch, requestDelete]
  );

  const table = useReactTable({
    data: filtered,
    columns,
    state: { globalFilter, sorting, pagination },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const pageRows = table.getRowModel().rows;
  const filteredCount = table.getFilteredRowModel().rows.length;
  const pageCount = table.getPageCount();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-normal">Dream Home Wishlist</h1>
          <p className="text-muted-foreground mt-1">
            A sortable list of items for the dream home — paste a product URL to add.
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="size-4" />
          Add Item
        </button>
      </div>

      {/* Toolbar */}
      <div className="space-y-3">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search wishlist..."
            className="w-full rounded-lg border bg-background pl-9 pr-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={roomFilter}
            onChange={(e) => setRoomFilter(e.target.value)}
            className="rounded-lg border bg-background px-3 py-1.5 text-sm outline-none focus:border-primary"
          >
            <option value="">All rooms</option>
            {WISHLIST_ROOMS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border bg-background px-3 py-1.5 text-sm outline-none focus:border-primary"
          >
            <option value="">All statuses</option>
            {WISHLIST_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {(roomFilter || statusFilter) && (
            <button
              onClick={() => {
                setRoomFilter("");
                setStatusFilter("");
              }}
              className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="size-3" />
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Totals strip */}
      <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3 text-sm">
        <div className="flex items-center gap-6">
          <span className="text-muted-foreground">
            {filteredCount} item{filteredCount === 1 ? "" : "s"}
          </span>
          <span>
            Total:{" "}
            <span className="font-semibold tabular-nums">{AUD.format(filteredTotal)}</span>
          </span>
          {selected.size > 0 && (
            <span className="text-primary">
              {selected.size} selected ·{" "}
              <span className="font-semibold tabular-nums">
                {AUD.format(selectedTotal)}
              </span>
            </span>
          )}
        </div>
        {selected.size > 0 && (
          <div className="flex items-center gap-2">
            <select
              value=""
              onChange={(e) => {
                if (!e.target.value) return;
                handleBulkRoomChange(e.target.value as WishlistRoom);
                e.target.value = "";
              }}
              className="rounded-lg border bg-background px-3 py-1.5 text-xs outline-none focus:border-primary"
              title="Move selected to room"
            >
              <option value="">Move to room…</option>
              {WISHLIST_ROOMS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <button
              onClick={() => setSelected(new Set())}
              className="rounded-lg px-3 py-1.5 text-xs hover:bg-muted transition-colors"
            >
              Clear
            </button>
            <button
              onClick={() => requestDelete(Array.from(selected), filtered)}
              className="flex items-center gap-1.5 rounded-lg bg-destructive/10 text-destructive px-3 py-1.5 text-xs font-medium hover:bg-destructive/20 transition-colors"
            >
              <Trash2 className="size-3.5" />
              Delete ({selected.size})
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground py-8">
          <Loader2 className="size-4 animate-spin" />
          Loading wishlist...
        </div>
      ) : (
        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id}>
                  {hg.headers.map((header) => (
                    <TableHead key={header.id} className="whitespace-nowrap">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {pageRows.length ? (
                pageRows.map((row) => (
                  <TableRow key={row.id} className="group">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No items yet.{" "}
                    <button
                      onClick={() => setShowAdd(true)}
                      className="text-primary hover:underline"
                    >
                      Add your first item
                    </button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {!loading && filteredCount > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>Rows per page</span>
            <select
              value={pagination.pageSize}
              onChange={(e) =>
                setPagination((p) => ({ pageIndex: 0, pageSize: Number(e.target.value) }))
              }
              className="rounded-lg border bg-background px-2 py-1 text-sm outline-none focus:border-primary"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground tabular-nums">
              Page {pageCount === 0 ? 0 : pagination.pageIndex + 1} of {pageCount}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="rounded-md border p-1.5 hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Previous page"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="rounded-md border p-1.5 hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Next page"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {showAdd && (
        <AddWishlistItemDialog
          onClose={() => setShowAdd(false)}
          onAdded={(item) => {
            setItems((prev) => [item, ...prev]);
          }}
        />
      )}

      {pendingDelete && (
        <ConfirmDialog
          count={pendingDelete.ids.length}
          titles={pendingDelete.titles}
          onCancel={() => setPendingDelete(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}

function TitleCell({
  value,
  sourceUrl,
  onSave,
}: {
  value: string;
  sourceUrl: string | null;
  onSave: (v: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const commit = () => {
    setEditing(false);
    if (draft.trim() && draft.trim() !== value) onSave(draft.trim());
  };

  if (editing) {
    return (
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") {
            setDraft(value);
            setEditing(false);
          }
        }}
        className="w-full rounded border bg-background px-1.5 py-1 text-sm font-medium outline-none focus:border-primary"
      />
    );
  }

  return (
    <div className="flex items-center gap-1.5 min-w-[180px]">
      {sourceUrl ? (
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="font-medium hover:underline truncate"
          title={sourceUrl}
        >
          {value || <span className="text-muted-foreground/50">Untitled</span>}
        </a>
      ) : (
        <span className="font-medium truncate">
          {value || <span className="text-muted-foreground/50">Untitled</span>}
        </span>
      )}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setEditing(true);
        }}
        className="rounded p-1 text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-muted transition-all shrink-0"
        title="Edit title"
      >
        <Pencil className="size-3.5" />
      </button>
    </div>
  );
}

function ConfirmDialog({
  count,
  titles,
  onCancel,
  onConfirm,
}: {
  count: number;
  titles: string[];
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const preview = titles.slice(0, 3);
  const more = titles.length - preview.length;
  const isMulti = count > 1;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-2xl border bg-card shadow-lg p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-medium mb-2">
          Delete {count} {isMulti ? "items" : "item"}?
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          This can't be undone.
        </p>
        {preview.length > 0 && (
          <ul className="text-sm space-y-1 mb-5 rounded-lg bg-muted/40 p-3">
            {preview.map((t, i) => (
              <li key={i} className="truncate">• {t || "(untitled)"}</li>
            ))}
            {more > 0 && (
              <li className="text-muted-foreground">…and {more} more</li>
            )}
          </ul>
        )}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            autoFocus
            className="flex-1 rounded-lg bg-destructive text-destructive-foreground px-4 py-2 text-sm font-medium hover:bg-destructive/90 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function EditableText({
  value,
  onSave,
  placeholder,
  className,
  multiline,
}: {
  value: string;
  onSave: (v: string) => void;
  placeholder?: string;
  className?: string;
  multiline?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const commit = () => {
    setEditing(false);
    if (draft !== value) onSave(draft.trim());
  };

  if (!editing) {
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          setEditing(true);
        }}
        className={`block text-left w-full hover:bg-muted/50 rounded px-1 -mx-1 ${className || ""}`}
      >
        {value || <span className="text-muted-foreground/50">{placeholder || "—"}</span>}
      </button>
    );
  }

  if (multiline) {
    return (
      <textarea
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setDraft(value);
            setEditing(false);
          }
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) commit();
        }}
        className={`w-full rounded border bg-background px-1.5 py-1 text-sm outline-none focus:border-primary ${className || ""}`}
        rows={2}
      />
    );
  }

  return (
    <input
      autoFocus
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") commit();
        if (e.key === "Escape") {
          setDraft(value);
          setEditing(false);
        }
      }}
      className={`w-full rounded border bg-background px-1.5 py-1 text-sm outline-none focus:border-primary ${className || ""}`}
    />
  );
}

function EditableNumber({
  value,
  onSave,
  format,
  className,
  integer,
}: {
  value: number | null;
  onSave: (v: number | null) => void;
  format: (v: number | null) => string;
  className?: string;
  integer?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value != null ? String(value) : "");

  useEffect(() => {
    setDraft(value != null ? String(value) : "");
  }, [value]);

  const commit = () => {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed === "") {
      if (value !== null) onSave(null);
      return;
    }
    const parsed = integer ? parseInt(trimmed, 10) : parseFloat(trimmed);
    if (Number.isFinite(parsed) && parsed !== value) onSave(parsed);
  };

  if (!editing) {
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          setEditing(true);
        }}
        className={`block text-left w-full hover:bg-muted/50 rounded px-1 -mx-1 ${className || ""}`}
      >
        {value != null ? (
          format(value)
        ) : (
          <span className="text-muted-foreground/50">—</span>
        )}
      </button>
    );
  }

  return (
    <input
      autoFocus
      type="number"
      step={integer ? 1 : "0.01"}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") commit();
        if (e.key === "Escape") {
          setDraft(value != null ? String(value) : "");
          setEditing(false);
        }
      }}
      className={`w-24 rounded border bg-background px-1.5 py-1 text-sm outline-none focus:border-primary ${className || ""}`}
    />
  );
}
