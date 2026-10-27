/** Options for formatting a value as Vietnamese đồng. */
export interface CurrencyFormatOptions {
  /** Whether to append the đồng symbol. Defaults to `true`. */
  showUnit?: boolean;
  /** Value returned when the input cannot be interpreted as a number. Defaults to `"—"`. */
  fallback?: string;
}

const vietnameseIntegerFormatter = new Intl.NumberFormat("vi-VN", {
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
  useGrouping: true,
});

/**
 * Formats a number or numeric string as Vietnamese đồng, rounded to the
 * nearest whole đồng.
 *
 * @param value - The monetary value to format.
 * @param options - Controls the unit suffix and invalid-value fallback.
 * @returns The formatted value, or the configured fallback for invalid input.
 */
export function formatVietnameseCurrency(
  value: number | string | null | undefined,
  options?: CurrencyFormatOptions,
): string {
  const fallback = options?.fallback ?? "—";

  if (value == null || (typeof value === "string" && value.trim() === "")) {
    return fallback;
  }

  const numericValue = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(numericValue)) {
    return fallback;
  }

  const formattedValue = vietnameseIntegerFormatter.format(numericValue);
  return options?.showUnit === false ? formattedValue : `${formattedValue} ₫`;
}
