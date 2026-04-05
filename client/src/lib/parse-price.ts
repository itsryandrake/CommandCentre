export function parsePrice(price: string | null): number {
  if (!price) return 0;
  const cleaned = price.replace(/[^0-9.,]/g, "");
  const normalised = cleaned.replace(/,/g, "");
  const value = parseFloat(normalised);
  return isNaN(value) ? 0 : value;
}

export function formatTotal(total: number): string {
  return total.toLocaleString("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}
