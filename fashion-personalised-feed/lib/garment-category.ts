/**
 * Infer Fashn.ai garment category from product metadata.
 * Used as a hint — Fashn's "auto" mode handles most cases.
 */

export type GarmentCategory = "tops" | "bottoms" | "one-pieces"

export function inferGarmentCategory(
  productName: string,
  brand = ""
): GarmentCategory {
  const text = `${productName} ${brand}`.toLowerCase()

  // One-pieces: outerwear, dresses, jumpsuits
  if (
    /coat|jacket|blazer|parka|vest|gilet|dress|jumpsuit|romper|overall|poncho/.test(
      text
    )
  ) {
    return "one-pieces"
  }

  // Bottoms: trousers, shorts, skirts
  if (/trouser|pant|chino|jean|denim|short|skirt|jogger|legging/.test(text)) {
    return "bottoms"
  }

  // Default to tops: shirts, tees, sweaters, hoodies, scarves, etc.
  return "tops"
}
