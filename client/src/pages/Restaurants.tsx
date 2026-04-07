import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useRestaurants } from "@/hooks/useRestaurants";
import { RestaurantForm } from "@/components/restaurants/RestaurantForm";
import { StarRating } from "@/components/restaurants/StarRating";
import { RESTAURANT_CITIES, CUISINE_TYPES, MEAL_TYPES, PRICE_RANGE_LABELS } from "@shared/types/restaurant";
import type { Restaurant, CreateRestaurantInput, UpdateRestaurantInput, RestaurantStatus } from "@shared/types/restaurant";
import { scrapeRestaurantReviews } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  X,
  ExternalLink,
  MapPin,
  Phone,
  Globe,
  Trash2,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Pencil,
  Loader2,
  Star,
  MessageSquareQuote,
} from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  want_to_try: "Want to Try",
  would_go_back: "Would Go Back",
  would_not_go_back: "Wouldn't Go Back",
};

const STATUS_STYLES: Record<string, string> = {
  want_to_try: "bg-amber-500/10 text-amber-600",
  would_go_back: "bg-green-500/10 text-green-600",
  would_not_go_back: "bg-red-500/10 text-red-600",
};

function SortIcon({ column }: { column: any }) {
  const sorted = column.getIsSorted();
  if (sorted === "asc") return <ArrowUp className="ml-1 inline size-3.5" />;
  if (sorted === "desc") return <ArrowDown className="ml-1 inline size-3.5" />;
  return <ArrowUpDown className="ml-1 inline size-3.5 opacity-30" />;
}

export function Restaurants() {
  const {
    restaurants,
    isLoading,
    create,
    update,
    remove,
    reload,
  } = useRestaurants();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Restaurant | undefined>();
  const [viewing, setViewing] = useState<Restaurant | undefined>();
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  // Filters
  const [cityFilter, setCityFilter] = useState<string>("");
  const [cuisineFilter, setCuisineFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [priceFilter, setPriceFilter] = useState<string>("");
  const [mealFilter, setMealFilter] = useState<string>("");

  const handleCreate = async (input: CreateRestaurantInput) => {
    const item = await create(input);
    // Auto-fetch Google reviews in the background
    if (item) {
      scrapeRestaurantReviews(item.id).then(() => reload());
    }
  };

  const handleEdit = async (input: CreateRestaurantInput) => {
    if (!editing) return;
    await update(editing.id, input as UpdateRestaurantInput);
    setViewing(undefined);
  };

  const handleDelete = async (id: string) => {
    await remove(id);
    setViewing(undefined);
  };

  // Client-side filtering on top of server data
  const filtered = useMemo(() => {
    let data = restaurants;
    if (cityFilter) data = data.filter((r) => r.city === cityFilter);
    if (cuisineFilter) data = data.filter((r) => r.cuisineType === cuisineFilter);
    if (statusFilter) data = data.filter((r) => r.status === statusFilter);
    if (priceFilter) data = data.filter((r) => r.priceRange === Number(priceFilter));
    if (mealFilter) data = data.filter((r) => r.mealTypes.includes(mealFilter));
    return data;
  }, [restaurants, cityFilter, cuisineFilter, statusFilter, priceFilter, mealFilter]);

  const columns = useMemo<ColumnDef<Restaurant>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <button className="flex items-center" onClick={() => column.toggleSorting()}>
            Name <SortIcon column={column} />
          </button>
        ),
        cell: ({ row }) => {
          const r = row.original;
          return (
            <div className="flex flex-col gap-1.5 py-1">
              {r.imageUrl && (
                <img
                  src={r.imageUrl}
                  alt={r.name}
                  className="w-full max-w-[180px] h-20 rounded-lg object-cover"
                />
              )}
              <span className="font-medium">{r.name}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "city",
        header: ({ column }) => (
          <button className="flex items-center" onClick={() => column.toggleSorting()}>
            City <SortIcon column={column} />
          </button>
        ),
        cell: ({ getValue }) => (
          <span className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="size-3" />
            {getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: "cuisineType",
        header: ({ column }) => (
          <button className="flex items-center" onClick={() => column.toggleSorting()}>
            Cuisine <SortIcon column={column} />
          </button>
        ),
        cell: ({ getValue }) => {
          const v = getValue() as string | undefined;
          return v ? (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {v}
            </span>
          ) : (
            <span className="text-muted-foreground/50">—</span>
          );
        },
      },
      {
        accessorKey: "priceRange",
        header: ({ column }) => (
          <button className="flex items-center" onClick={() => column.toggleSorting()}>
            Budget <SortIcon column={column} />
          </button>
        ),
        cell: ({ getValue }) => {
          const v = getValue() as number | undefined;
          return v ? (
            <span className="font-medium">{PRICE_RANGE_LABELS[v]}</span>
          ) : (
            <span className="text-muted-foreground/50">—</span>
          );
        },
      },
      {
        accessorKey: "mealTypes",
        header: "Meals",
        enableSorting: false,
        cell: ({ getValue }) => {
          const meals = getValue() as string[];
          if (!meals?.length) return <span className="text-muted-foreground/50">—</span>;
          return (
            <div className="flex gap-1">
              {meals.map((m) => (
                <span
                  key={m}
                  className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground capitalize"
                >
                  {m}
                </span>
              ))}
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <button className="flex items-center" onClick={() => column.toggleSorting()}>
            Status <SortIcon column={column} />
          </button>
        ),
        cell: ({ getValue }) => {
          const v = getValue() as string;
          return (
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[v] || ""}`}
            >
              {STATUS_LABELS[v] || v}
            </span>
          );
        },
      },
      {
        id: "rating",
        header: "Rating",
        accessorFn: (row) => {
          const ratings = [row.ratingRyan, row.ratingEmily].filter(Boolean) as number[];
          return ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
        },
        cell: ({ row }) => {
          const r = row.original;
          if (!r.ratingRyan && !r.ratingEmily)
            return <span className="text-muted-foreground/50">—</span>;
          return (
            <div className="flex flex-col gap-0.5">
              {r.ratingRyan != null && r.ratingRyan > 0 && (
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <span>R</span>
                  <StarRating rating={r.ratingRyan} size="sm" />
                </div>
              )}
              {r.ratingEmily != null && r.ratingEmily > 0 && (
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <span>E</span>
                  <StarRating rating={r.ratingEmily} size="sm" />
                </div>
              )}
            </div>
          );
        },
      },
      {
        id: "actions",
        enableSorting: false,
        cell: ({ row }) => {
          const r = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 rounded hover:bg-muted transition-colors">
                  <MoreHorizontal className="size-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setViewing(r)}>
                  View details
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setEditing(r);
                    setShowForm(true);
                  }}
                >
                  <Pencil className="size-3.5" />
                  Edit
                </DropdownMenuItem>
                {r.googleMapsUrl && (
                  <DropdownMenuItem onClick={() => window.open(r.googleMapsUrl, "_blank")}>
                    <ExternalLink className="size-3.5" />
                    Google Maps
                  </DropdownMenuItem>
                )}
                {r.websiteUrl && (
                  <DropdownMenuItem onClick={() => window.open(r.websiteUrl, "_blank")}>
                    <Globe className="size-3.5" />
                    Website
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => handleDelete(r.id)}
                >
                  <Trash2 className="size-3.5" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: filtered,
    columns,
    state: { globalFilter, sorting },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const activeFilterCount = [cityFilter, cuisineFilter, statusFilter, priceFilter, mealFilter].filter(Boolean).length;

  return (
    <DashboardLayout title="Restaurants">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-normal">Restaurants</h1>
            <p className="text-muted-foreground mt-1">
              Track restaurants you love and places you want to try
            </p>
          </div>
          <button
            onClick={() => {
              setEditing(undefined);
              setShowForm(true);
            }}
            className="flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="size-4" />
            Add Restaurant
          </button>
        </div>

        {/* Toolbar: Search + Filters */}
        <div className="space-y-3">
          {/* Search */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search restaurants..."
              className="w-full rounded-lg border bg-background pl-9 pr-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>

          {/* Filter row */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border bg-background px-3 py-1.5 text-sm outline-none focus:border-primary"
            >
              <option value="">All statuses</option>
              <option value="want_to_try">Want to Try</option>
              <option value="would_go_back">Would Go Back</option>
              <option value="would_not_go_back">Wouldn't Go Back</option>
            </select>

            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="rounded-lg border bg-background px-3 py-1.5 text-sm outline-none focus:border-primary"
            >
              <option value="">All cities</option>
              {RESTAURANT_CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={cuisineFilter}
              onChange={(e) => setCuisineFilter(e.target.value)}
              className="rounded-lg border bg-background px-3 py-1.5 text-sm outline-none focus:border-primary"
            >
              <option value="">All cuisines</option>
              {CUISINE_TYPES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="rounded-lg border bg-background px-3 py-1.5 text-sm outline-none focus:border-primary"
            >
              <option value="">All budgets</option>
              {[1, 2, 3, 4].map((p) => (
                <option key={p} value={String(p)}>{PRICE_RANGE_LABELS[p]}</option>
              ))}
            </select>

            <select
              value={mealFilter}
              onChange={(e) => setMealFilter(e.target.value)}
              className="rounded-lg border bg-background px-3 py-1.5 text-sm outline-none focus:border-primary"
            >
              <option value="">All meals</option>
              {MEAL_TYPES.map((m) => (
                <option key={m} value={m} className="capitalize">{m.charAt(0).toUpperCase() + m.slice(1)}</option>
              ))}
            </select>

            {activeFilterCount > 0 && (
              <button
                onClick={() => {
                  setCityFilter("");
                  setCuisineFilter("");
                  setStatusFilter("");
                  setPriceFilter("");
                  setMealFilter("");
                }}
                className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="size-3" />
                Clear filters ({activeFilterCount})
              </button>
            )}
          </div>
        </div>

        {/* Count */}
        <p className="text-sm text-muted-foreground">
          {table.getRowModel().rows.length} restaurant{table.getRowModel().rows.length !== 1 ? "s" : ""}
        </p>

        {/* Data Table */}
        {isLoading ? (
          <p className="text-muted-foreground text-sm py-8">Loading restaurants...</p>
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className="cursor-pointer"
                      onClick={() => setViewing(row.original)}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                      No restaurants found.{" "}
                      <button
                        onClick={() => setShowForm(true)}
                        className="text-primary hover:underline"
                      >
                        Add your first restaurant
                      </button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Detail view modal */}
      {viewing && (
        <RestaurantDetail
          restaurant={viewing}
          onClose={() => setViewing(undefined)}
          onUpdate={async (id, fields) => {
            const updated = await update(id, fields);
            if (updated) setViewing(updated);
          }}
          onEdit={() => {
            setEditing(viewing);
            setViewing(undefined);
            setShowForm(true);
          }}
          onDelete={() => handleDelete(viewing.id)}
        />
      )}

      {/* Form dialog */}
      {showForm && (
        <RestaurantForm
          existing={editing}
          onSubmit={editing ? handleEdit : handleCreate}
          onClose={() => {
            setShowForm(false);
            setEditing(undefined);
          }}
        />
      )}
    </DashboardLayout>
  );
}

// =============================================================================
// RestaurantDetail — enhanced detail modal
// =============================================================================

const STATUS_OPTIONS: { value: RestaurantStatus; label: string }[] = [
  { value: "want_to_try", label: "Want to Try" },
  { value: "would_go_back", label: "Would Go Back" },
  { value: "would_not_go_back", label: "Wouldn't Go Back" },
];

function RestaurantDetail({
  restaurant,
  onClose,
  onUpdate,
  onEdit,
  onDelete,
}: {
  restaurant: Restaurant;
  onClose: () => void;
  onUpdate: (id: string, fields: UpdateRestaurantInput) => Promise<void>;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [loadingReviews, setLoadingReviews] = useState(false);

  const handleRatingChange = (field: "ratingRyan" | "ratingEmily", value: number) => {
    onUpdate(restaurant.id, { [field]: value });
  };

  const handleStatusChange = (status: RestaurantStatus) => {
    onUpdate(restaurant.id, { status });
  };

  const handleFetchReviews = async () => {
    setLoadingReviews(true);
    await scrapeRestaurantReviews(restaurant.id);
    // Parent will reload via onUpdate flow
    setLoadingReviews(false);
    // Trigger a reload by updating with empty object
    onUpdate(restaurant.id, {});
  };

  const reviews = restaurant.googleReviews || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border bg-card shadow-lg">
        {/* Hero image */}
        {restaurant.imageUrl && (
          <img
            src={restaurant.imageUrl}
            alt={restaurant.name}
            className="w-full object-cover aspect-[16/9] rounded-t-2xl"
          />
        )}

        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-medium">{restaurant.name}</h2>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
              <X className="size-5" />
            </button>
          </div>

          <div className="space-y-4 mb-6">
            {/* Status — clickable toggle */}
            <div>
              <p className="text-muted-foreground text-xs mb-1.5">Status</p>
              <div className="flex gap-1.5">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleStatusChange(opt.value)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      restaurant.status === opt.value
                        ? STATUS_STYLES[opt.value]
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              {restaurant.cuisineType && (
                <div>
                  <p className="text-muted-foreground text-xs">Cuisine</p>
                  <p>{restaurant.cuisineType}</p>
                </div>
              )}
              {restaurant.city && (
                <div>
                  <p className="text-muted-foreground text-xs">City</p>
                  <p>{restaurant.city}</p>
                </div>
              )}
              {restaurant.priceRange && (
                <div>
                  <p className="text-muted-foreground text-xs">Budget</p>
                  <p>{PRICE_RANGE_LABELS[restaurant.priceRange]}</p>
                </div>
              )}
              {restaurant.mealTypes.length > 0 && (
                <div>
                  <p className="text-muted-foreground text-xs">Meal Types</p>
                  <p className="capitalize">{restaurant.mealTypes.join(", ")}</p>
                </div>
              )}
            </div>

            {/* Contact */}
            {restaurant.address && (
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                <span>{restaurant.address}</span>
              </div>
            )}
            {restaurant.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="size-4 text-muted-foreground shrink-0" />
                <a href={`tel:${restaurant.phone}`} className="text-primary hover:underline">
                  {restaurant.phone}
                </a>
              </div>
            )}
            <div className="flex gap-4">
              {restaurant.websiteUrl && (
                <a
                  href={restaurant.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                >
                  <Globe className="size-3.5" />
                  Website
                </a>
              )}
              {restaurant.googleMapsUrl && (
                <a
                  href={restaurant.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="size-3.5" />
                  Google Maps
                </a>
              )}
            </div>

            {/* Ratings — clickable */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <p className="text-muted-foreground text-xs mb-1">Ryan's Rating</p>
                <StarRating
                  rating={restaurant.ratingRyan || 0}
                  onChange={(val) => handleRatingChange("ratingRyan", val)}
                />
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-1">Emily's Rating</p>
                <StarRating
                  rating={restaurant.ratingEmily || 0}
                  onChange={(val) => handleRatingChange("ratingEmily", val)}
                />
              </div>
            </div>

            {/* Notes */}
            {restaurant.notes && (
              <div>
                <p className="text-muted-foreground text-xs mb-1">Notes</p>
                <p className="text-sm whitespace-pre-wrap">{restaurant.notes}</p>
              </div>
            )}

            {/* Google Reviews */}
            <div className="border-t pt-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-muted-foreground text-xs uppercase tracking-wider font-medium">
                  Google Reviews
                </p>
                <button
                  onClick={handleFetchReviews}
                  disabled={loadingReviews}
                  className="flex items-center gap-1.5 text-xs text-primary hover:underline disabled:opacity-50"
                >
                  {loadingReviews ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <MessageSquareQuote className="size-3" />
                  )}
                  {reviews.length > 0 ? "Refresh" : "Fetch reviews"}
                </button>
              </div>
              {reviews.length > 0 ? (
                <div className="space-y-3">
                  {reviews.map((review, i) => (
                    <div key={i} className="rounded-lg bg-muted/50 p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{review.author}</span>
                        <span className="text-xs text-muted-foreground">{review.relativeTime}</span>
                      </div>
                      <div className="flex gap-0.5 mb-1.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`size-3 ${
                              s <= review.rating
                                ? "fill-amber-400 text-amber-400"
                                : "fill-none text-muted-foreground/30"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{review.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  No reviews yet. Click "Fetch reviews" to pull from Google.
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 border-t pt-4">
            <button
              onClick={onEdit}
              className="flex-1 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
            >
              Edit
            </button>
            <button
              onClick={onDelete}
              className="flex items-center gap-2 rounded-lg bg-destructive/10 text-destructive px-4 py-2 text-sm font-medium hover:bg-destructive/20 transition-colors"
            >
              <Trash2 className="size-4" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
