import { useState } from "react";
import type { Asset, Loan, CreateAssetInput, CreateLoanInput, AssetType } from "@shared/types/finance";
import { X } from "lucide-react";

interface AssetFormProps {
  existing?: Asset;
  onSubmit: (input: CreateAssetInput) => Promise<any>;
  onClose: () => void;
}

export function PropertyForm({ existing, onSubmit, onClose }: AssetFormProps) {
  const [name, setName] = useState(existing?.name || "");
  const [type, setType] = useState<AssetType>(existing?.type || "property");
  const [address, setAddress] = useState(existing?.address || "");
  const [purchasePrice, setPurchasePrice] = useState(existing?.purchasePrice?.toString() || "");
  const [currentValue, setCurrentValue] = useState(existing?.currentValue?.toString() || "");
  const [purchaseDate, setPurchaseDate] = useState(existing?.purchaseDate || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !type) return;
    setIsSubmitting(true);
    await onSubmit({
      name,
      type,
      address: address || undefined,
      purchasePrice: purchasePrice ? parseFloat(purchasePrice) : undefined,
      currentValue: currentValue ? parseFloat(currentValue) : undefined,
      purchaseDate: purchaseDate || undefined,
    });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-medium">{existing ? "Edit Asset" : "Add Asset"}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted"><X className="size-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">Name *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" required />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">Type *</label>
            <select value={type} onChange={(e) => setType(e.target.value as AssetType)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
              <option value="property">Property</option>
              <option value="vehicle">Vehicle</option>
              <option value="investment">Investment</option>
              <option value="retirement_fund">Superannuation</option>
              <option value="bank">Bank</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">Address</label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Purchase Price ($)</label>
              <input type="number" step="1" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Current Value ($)</label>
              <input type="number" step="1" value={currentValue} onChange={(e) => setCurrentValue(e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">Purchase Date</label>
            <input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors">Cancel</button>
            <button type="submit" disabled={isSubmitting || !name} className="flex-1 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
              {isSubmitting ? "Saving..." : existing ? "Update" : "Add Asset"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface LoanFormProps {
  propertyId?: string;
  properties: Asset[];
  existing?: Loan;
  onSubmit: (input: CreateLoanInput) => Promise<any>;
  onClose: () => void;
}

export function LoanForm({ propertyId, properties, existing, onSubmit, onClose }: LoanFormProps) {
  const [selectedAssetId, setSelectedAssetId] = useState(existing?.assetId || propertyId || "");
  const [name, setName] = useState(existing?.name || "");
  const [type, setType] = useState<"mortgage" | "personal" | "car" | "other">(existing?.type || "mortgage");
  const [lender, setLender] = useState(existing?.lender || "");
  const [originalAmount, setOriginalAmount] = useState(existing?.originalAmount?.toString() || "");
  const [currentBalance, setCurrentBalance] = useState(existing?.currentBalance?.toString() || "");
  const [interestRate, setInterestRate] = useState(existing?.interestRate?.toString() || "");
  const [monthlyPayment, setMonthlyPayment] = useState(existing?.monthlyPayment?.toString() || "");
  const [startDate, setStartDate] = useState(existing?.startDate || "");
  const [endDate, setEndDate] = useState(existing?.endDate || "");
  const [isFixedRate, setIsFixedRate] = useState(existing?.isFixedRate ?? true);
  const [fixedRateExpiry, setFixedRateExpiry] = useState(existing?.fixedRateExpiry || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !type) return;
    setIsSubmitting(true);
    await onSubmit({
      assetId: selectedAssetId || undefined,
      name,
      type: type as any,
      lender: lender || undefined,
      originalAmount: originalAmount ? parseFloat(originalAmount) : undefined,
      currentBalance: currentBalance ? parseFloat(currentBalance) : undefined,
      interestRate: interestRate ? parseFloat(interestRate) : undefined,
      monthlyPayment: monthlyPayment ? parseFloat(monthlyPayment) : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      isFixedRate,
      fixedRateExpiry: fixedRateExpiry || undefined,
    });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border bg-card p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-medium">{existing ? "Edit Loan" : "Add Loan"}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted"><X className="size-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">Asset</label>
            <select value={selectedAssetId} onChange={(e) => setSelectedAssetId(e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
              <option value="">No asset linked</option>
              {properties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">Name *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Type *</label>
              <select value={type} onChange={(e) => setType(e.target.value as "mortgage" | "personal" | "car" | "other")} className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
                <option value="mortgage">Mortgage</option>
                <option value="personal">Personal Loan</option>
                <option value="car">Car Loan</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Lender</label>
              <input type="text" value={lender} onChange={(e) => setLender(e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Original Amount ($)</label>
              <input type="number" step="1" value={originalAmount} onChange={(e) => setOriginalAmount(e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Current Balance ($)</label>
              <input type="number" step="1" value={currentBalance} onChange={(e) => setCurrentBalance(e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Interest Rate (%)</label>
              <input type="number" step="0.01" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Monthly Payment ($)</label>
              <input type="number" step="1" value={monthlyPayment} onChange={(e) => setMonthlyPayment(e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={isFixedRate} onChange={(e) => setIsFixedRate(e.target.checked)} className="rounded" />
              Fixed rate
            </label>
            {isFixedRate && (
              <div className="flex-1">
                <input type="date" value={fixedRateExpiry} onChange={(e) => setFixedRateExpiry(e.target.value)} placeholder="Fixed rate expiry" className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
              </div>
            )}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors">Cancel</button>
            <button type="submit" disabled={isSubmitting || !name} className="flex-1 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
              {isSubmitting ? "Saving..." : existing ? "Update" : "Add Loan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
