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
import type { Asset, LoanType, CreateLoanInput } from "@shared/types/finance";

const DEBT_TYPES: { value: LoanType; label: string }[] = [
  { value: "mortgage", label: "Mortgage" },
  { value: "personal", label: "Personal Loan" },
  { value: "car", label: "Car Loan" },
  { value: "other", label: "Other Debt" },
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
  onSubmit: (input: CreateLoanInput) => Promise<any>;
  assets: Asset[];
}

export function AddDebtDialog({ open, onOpenChange, onSubmit, assets }: Props) {
  const [name, setName] = useState("");
  const [type, setType] = useState<LoanType>("mortgage");
  const [originalAmount, setOriginalAmount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [currentBalance, setCurrentBalance] = useState("");
  const [currency, setCurrency] = useState("AUD");
  const [assetId, setAssetId] = useState<string>("");
  const [lender, setLender] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reset = () => {
    setName("");
    setType("mortgage");
    setOriginalAmount("");
    setStartDate("");
    setCurrentBalance("");
    setCurrency("AUD");
    setAssetId("");
    setLender("");
    setInterestRate("");
    setNotes("");
  };

  const handleOpenChange = (v: boolean) => {
    if (!v) reset();
    onOpenChange(v);
  };

  const useOriginalAmount = () => {
    setCurrentBalance(originalAmount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !type) return;
    setIsSubmitting(true);
    await onSubmit({
      name,
      type,
      assetId: assetId || undefined,
      lender: lender || undefined,
      originalAmount: originalAmount ? parseFloat(originalAmount) : undefined,
      currentBalance: currentBalance ? parseFloat(currentBalance) : undefined,
      interestRate: interestRate ? parseFloat(interestRate) : undefined,
      startDate: startDate || undefined,
      notes: notes || undefined,
      currency,
    });
    setIsSubmitting(false);
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Debt</DialogTitle>
          <DialogDescription>Add details for this debt or loan.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-4 rounded-lg border p-4">
            <h4 className="text-sm font-semibold text-muted-foreground">Debt details</h4>

            <div>
              <label className="text-sm font-medium">Debt type</label>
              <Select value={type} onValueChange={(v) => setType(v as LoanType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEBT_TYPES.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Input
                placeholder="E.g. Loan from Alice"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Lender</label>
              <Input
                placeholder="E.g. Bank name or person"
                value={lender}
                onChange={(e) => setLender(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Original amount owing and draw-down date</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="E.g. 2000"
                  value={originalAmount}
                  onChange={(e) => setOriginalAmount(e.target.value)}
                  className="flex-1"
                />
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                When was the debt drawn down, and how much was owed?
              </p>
            </div>

            <div>
              <label className="text-sm font-medium">Amount owing</label>
              <Input
                type="number"
                placeholder="E.g. 1000"
                value={currentBalance}
                onChange={(e) => setCurrentBalance(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                How much would you need to pay to clear this debt today?{" "}
                {originalAmount && (
                  <button type="button" onClick={useOriginalAmount} className="text-blue-500 hover:underline">
                    Use original value
                  </button>
                )}
              </p>
            </div>

            {(type === "mortgage" || type === "car") && (
              <div>
                <label className="text-sm font-medium">Interest rate (%)</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="E.g. 6.04"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                />
              </div>
            )}

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

            <div>
              <label className="text-sm font-medium">Notes</label>
              <Input
                placeholder="Optional notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          {assets.length > 0 && (
            <div className="space-y-3 rounded-lg border p-4">
              <h4 className="text-sm font-semibold text-muted-foreground">Group with asset</h4>
              <p className="text-xs text-muted-foreground">
                Do you want to group this debt with an existing asset?
              </p>
              <Select value={assetId} onValueChange={setAssetId}>
                <SelectTrigger>
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {assets.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name || isSubmitting} className="bg-rose-500 hover:bg-rose-600">
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
