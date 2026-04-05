import { useState } from "react";
import type { InvestmentPayment } from "@shared/types/investment";
import { Check, Clock, AlertCircle, ChevronDown } from "lucide-react";

// Current AUD/AED rate (1 AUD = X AED) — used for future payment estimates
const CURRENT_FX_RATE = 2.53;

type PaymentStatus = "paid" | "overdue" | "due" | "upcoming";

function getPaymentStatus(payment: InvestmentPayment): PaymentStatus {
  if (payment.isPaid) return "paid";
  if (!payment.dateDue) return "upcoming";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(payment.dateDue);
  const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return "overdue";
  if (diffDays <= 7) return "due";
  return "upcoming";
}

const STATUS_CONFIG: Record<PaymentStatus, { label: string; className: string; icon: typeof Check }> = {
  paid: { label: "Paid", className: "bg-green-100 text-green-700", icon: Check },
  overdue: { label: "Overdue", className: "bg-red-100 text-red-700", icon: AlertCircle },
  due: { label: "Due Soon", className: "bg-amber-100 text-amber-700", icon: Clock },
  upcoming: { label: "To Pay", className: "bg-blue-100 text-blue-700", icon: Clock },
};

function formatDate(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
}

function fmtAud(n?: number) {
  if (!n && n !== 0) return "—";
  return `$${n.toLocaleString("en-AU", { minimumFractionDigits: 0 })}`;
}

function fmtAed(n?: number) {
  if (!n && n !== 0) return "—";
  return `AED ${n.toLocaleString()}`;
}

function estimateAud(amountLocal: number, existingAud?: number): number {
  if (existingAud && existingAud > 0) return existingAud;
  return Math.round(amountLocal / CURRENT_FX_RATE);
}

interface PaymentTableProps {
  payments: InvestmentPayment[];
  currency: string;
  onTogglePaid?: (paymentId: string, isPaid: boolean) => void;
  onStatusChange?: (paymentId: string, isPaid: boolean) => void;
}

function StatusDropdown({ payment, onStatusChange }: { payment: InvestmentPayment; onStatusChange?: (id: string, isPaid: boolean) => void }) {
  const [open, setOpen] = useState(false);
  const status = getPaymentStatus(payment);
  const config = STATUS_CONFIG[status];

  return (
    <div className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className={`flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${config.className}`}
      >
        {config.label}
        <ChevronDown className="size-2.5" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 rounded-lg border bg-card shadow-lg py-1 min-w-[100px]">
            <button
              onClick={() => { onStatusChange?.(payment.id, true); setOpen(false); }}
              className="w-full px-3 py-1.5 text-xs text-left hover:bg-muted flex items-center gap-2"
            >
              <span className="size-2 rounded-full bg-green-500" /> Paid
            </button>
            <button
              onClick={() => { onStatusChange?.(payment.id, false); setOpen(false); }}
              className="w-full px-3 py-1.5 text-xs text-left hover:bg-muted flex items-center gap-2"
            >
              <span className="size-2 rounded-full bg-blue-500" /> Unpaid
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export function PaymentTable({ payments, currency, onTogglePaid }: PaymentTableProps) {
  const paid = payments.filter((p) => p.isPaid);
  const unpaid = payments.filter((p) => !p.isPaid);

  const totalPaidLocal = paid.reduce((s, p) => s + p.amountLocal, 0);
  const totalPaidAud = paid.reduce((s, p) => s + estimateAud(p.amountLocal, p.amountAud), 0);
  const totalUnpaidLocal = unpaid.reduce((s, p) => s + p.amountLocal, 0);
  const totalUnpaidAud = unpaid.reduce((s, p) => s + estimateAud(p.amountLocal, p.amountAud), 0);

  const renderRow = (p: InvestmentPayment) => {
    const status = getPaymentStatus(p);
    const audAmount = estimateAud(p.amountLocal, p.amountAud);
    const isEstimate = !p.amountAud || p.amountAud === 0;

    return (
      <div
        key={p.id}
        className={`grid grid-cols-[1fr_auto_120px_120px_80px] items-center gap-2 px-4 py-3 text-sm border-b border-border/30 last:border-0 ${
          status === "overdue" ? "bg-red-50/50 dark:bg-red-950/10" :
          status === "due" ? "bg-amber-50/50 dark:bg-amber-950/10" :
          status === "paid" ? "" : ""
        }`}
      >
        {/* Label */}
        <div>
          <span className="font-medium">{p.label}</span>
          {p.percentage && <span className="text-xs text-muted-foreground ml-1">({p.percentage}%)</span>}
        </div>

        {/* Date */}
        <span className="text-xs text-muted-foreground w-24 text-right">
          {p.isPaid ? formatDate(p.datePaid) : formatDate(p.dateDue)}
        </span>

        {/* AUD (left/primary) */}
        <span className="font-mono font-medium text-right">
          {fmtAud(audAmount)}
          {isEstimate && !p.isPaid && <span className="text-[9px] text-muted-foreground ml-0.5">*</span>}
        </span>

        {/* AED (right/secondary) */}
        <span className="font-mono text-muted-foreground text-right text-xs">
          {fmtAed(p.amountLocal)}
        </span>

        {/* Status */}
        <div className="flex justify-end">
          <StatusDropdown payment={p} onStatusChange={onTogglePaid} />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Column headers */}
      <div className="grid grid-cols-[1fr_auto_120px_120px_80px] items-center gap-2 px-4 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
        <span>Payment</span>
        <span className="w-24 text-right">Date</span>
        <span className="text-right">AUD</span>
        <span className="text-right">AED</span>
        <span className="text-right">Status</span>
      </div>

      {/* Paid payments */}
      {paid.length > 0 && (
        <div className="rounded-xl border overflow-hidden">
          <div className="px-4 py-2 bg-green-50/80 dark:bg-green-950/30 text-xs font-semibold text-green-700 dark:text-green-400">
            Payments Made
          </div>
          {paid.map(renderRow)}
          <div className="grid grid-cols-[1fr_auto_120px_120px_80px] items-center gap-2 px-4 py-3 bg-muted/30 font-semibold text-sm">
            <span>Total Paid</span>
            <span />
            <span className="font-mono text-right text-green-600">{fmtAud(totalPaidAud)}</span>
            <span className="font-mono text-right text-xs text-green-600">{fmtAed(totalPaidLocal)}</span>
            <span />
          </div>
        </div>
      )}

      {/* Upcoming payments */}
      {unpaid.length > 0 && (
        <div className="rounded-xl border overflow-hidden">
          <div className="px-4 py-2 bg-amber-50/80 dark:bg-amber-950/30 text-xs font-semibold text-amber-700 dark:text-amber-400">
            Upcoming Instalments
          </div>
          {unpaid.map(renderRow)}
          <div className="grid grid-cols-[1fr_auto_120px_120px_80px] items-center gap-2 px-4 py-3 bg-muted/30 font-semibold text-sm">
            <span>Balance Remaining</span>
            <span />
            <span className="font-mono text-right text-amber-600">{fmtAud(totalUnpaidAud)}</span>
            <span className="font-mono text-right text-xs text-amber-600">{fmtAed(totalUnpaidLocal)}</span>
            <span />
          </div>
        </div>
      )}

      {/* FX note */}
      <p className="text-[10px] text-muted-foreground">
        * Future AUD amounts estimated at today's rate (1 AUD = {CURRENT_FX_RATE} AED). Paid amounts reflect actual transaction rates.
      </p>
    </div>
  );
}
