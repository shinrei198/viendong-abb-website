import type { ProductItem, ProductVariant } from "@/data/siteData"

const COLOR_PRIORITY = new Map<string, number>([
  ["vang", 0],
  ["gold", 0],
  ["xam dam", 1],
  ["dark grey", 1],
  ["dark gray", 1],
  ["den", 2],
  ["black", 2],
  ["bac", 3],
  ["silver", 3],
  ["trang", 4],
  ["white", 4],
])

export const productColorDot: Record<string, string> = {
  Trắng: "#FFFFFF",
  White: "#FFFFFF",
  Bạc: "#D1D5DB",
  Silver: "#D1D5DB",
  Vàng: "#EAB308",
  Gold: "#EAB308",
  "Xám Đậm": "#4B5563",
  "Dark Grey": "#4B5563",
  "Dark Gray": "#4B5563",
  Xám: "#4B5563",
  Đen: "#1F2937",
  Black: "#1F2937",
}

export function normalizeProductColor(color: string): string {
  return color
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
}

export function getEnabledVariants(product: ProductItem): ProductVariant[] {
  const enabled = product.variants.filter((variant) => variant.enabled)
  if (product.category === "breaker") return enabled

  return enabled
    .map((variant, originalIndex) => ({ variant, originalIndex }))
    .sort((a, b) => {
      const priorityA =
        COLOR_PRIORITY.get(normalizeProductColor(a.variant.color)) ??
        Number.MAX_SAFE_INTEGER
      const priorityB =
        COLOR_PRIORITY.get(normalizeProductColor(b.variant.color)) ??
        Number.MAX_SAFE_INTEGER
      return priorityA - priorityB || a.originalIndex - b.originalIndex
    })
    .map(({ variant }) => variant)
}

export function getDefaultVariant(product: ProductItem): ProductVariant {
  return (
    getEnabledVariants(product)[0] ||
    product.variants[0] || {
      color: "Trắng",
      colorCode: "P01",
      hex: "#FFFFFF",
      sku: product.baseSku,
      image: "",
      enabled: true,
    }
  )
}

export function hasVariantOptions(
  product: ProductItem,
  variants = getEnabledVariants(product),
): boolean {
  if (product.category === "breaker") return variants.length > 1
  return (
    new Set(variants.map((variant) => normalizeProductColor(variant.color)))
      .size > 1
  )
}
