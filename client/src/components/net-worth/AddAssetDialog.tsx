import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Home, Car, TrendingUp, Landmark, Monitor } from "lucide-react";
import type { AssetType, CreateAssetInput } from "@shared/types/finance";

const ASSET_TYPES: { value: AssetType; label: string; icon: React.ReactNode }[] = [
  { value: "property", label: "Property", icon: <Home className="w-5 h-5" /> },
  { value: "vehicle", label: "Vehicle", icon: <Car className="w-5 h-5" /> },
  { value: "investment", label: "Investment", icon: <TrendingUp className="w-5 h-5" /> },
  { value: "retirement_fund", label: "Superannuation", icon: <Landmark className="w-5 h-5" /> },
  { value: "other", label: "Other Asset", icon: <Monitor className="w-5 h-5" /> },
];

const CURRENCIES = [
  { value: "AUD", label: "Australian Dollar - AUD ($)" },
  { value: "USD", label: "US Dollar - USD ($)" },
  { value: "AED", label: "UAE Dirham - AED" },
  { value: "GBP", label: "British Pound - GBP" },
  { value: "EUR", label: "Euro - EUR" },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: CreateAssetInput) => Promise<any>;
}

export function AddAssetDialog({ open, onOpenChange, onSubmit }: Props) {
  const [step, setStep] = useState<"type" | "form">("type");
  const [selectedType, setSelectedType] = useState<AssetType>("property");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const [currency, setCurrency] = useState("AUD");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reset = () => {
    setStep("type");
    setSelectedType("property");
    setName("");
    setDescription("");
    setAddress("");
    setPurchasePrice("");
    setPurchaseDate("");
    setCurrentValue("");
    setCurrency("AUD");
  };

  const handleOpenChange = (v: boolean) => {
    if (!v) reset();
    onOpenChange(v);
  };

  const handleTypeSelect = (type: AssetType) => {
    setSelectedType(type);
    setStep("form");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setIsSubmitting(true);
    await onSubmit({
      name,
      type: selectedType,
      description: description || undefined,
      address: address || undefined,
      purchasePrice: purchasePrice ? parseFloat(purchasePrice) : undefined,
      currentValue: currentValue ? parseFloat(currentValue) : undefined,
      purchaseDate: purchaseDate || undefined,
      currency,
    });
    setIsSubmitting(false);
    handleOpenChange(false);
  };

  const useOriginalValue = () => {
    setCurrentValue(purchasePrice);
  };

  const typeLabel = ASSET_TYPES.find((t) => t.value === selectedType)?.label || "Asset";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        {step === "type" ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl">Choose an asset type</DialogTitle>
              <DialogDescription>What type of asset would you like to add?</DialogDescription>
            </DialogHeader>
            <div className="space-y-1 mt-2">
              {ASSET_TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => handleTypeSelect(t.value)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors text-left"
                >
                  {t.icon}
                  <span className="font-medium">{t.label}</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>New {typeLabel}</DialogTitle>
              <DialogDescription>Add details for this asset.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="space-y-4 rounded-lg border p-4">
                <h4 className="text-sm font-semibold text-muted-foreground">Asset details</h4>

                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Input
                    placeholder={selectedType === "property" ? "E.g. Park Rd" : "E.g. My car"}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                {description !== undefined && (
                  <div>
                    <label className="text-sm font-medium">Notes</label>
                    <Input
                      placeholder="Optional notes"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                )}

                {selectedType === "property" && (
                  <div>
                    <label className="text-sm font-medium">Address</label>
                    <Input
                      placeholder="Full address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium">Original value and purchase date</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="E.g. 1000"
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      type="date"
                      value={purchaseDate}
                      onChange={(e) => setPurchaseDate(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    When, and for how much, did you purchase the asset?
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium">Current value</label>
                  <Input
                    type="number"
                    placeholder="E.g. 2000"
                    value={currentValue}
                    onChange={(e) => setCurrentValue(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    What would you get for this asset if you sold it today?{" "}
                    {purchasePrice && (
                      <button type="button" onClick={useOriginalValue} className="text-blue-500 hover:underline">
                        Use original value
                      </button>
                    )}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium">Currency</label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setStep("type")}>
                  Back
                </Button>
                <Button type="submit" disabled={!name || isSubmitting} className="bg-emerald-600 hover:bg-emerald-700">
                  {isSubmitting ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
