export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(price);
}

export function formatAlcoholPct(pct: number): string {
  return `${pct}%`;
}

export function formatVolume(liters: number): string {
  if (liters < 1) {
    return `${Math.round(liters * 1000)} mL`;
  }
  return `${liters} L`;
}

export function formatPricePerMl(price: number): string {
  return `$${price.toFixed(4)}/mL`;
}
