import type { BrandEntry } from "@/lib/profile-types"

// ── Style archetypes with mood board images ──────────────────────────────────

export interface StyleArchetype {
  id: string
  label: string
  imageUrl: string
}

export const STYLE_ARCHETYPES: StyleArchetype[] = [
  {
    id: "streetwear",
    label: "Streetwear",
    imageUrl: "https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/77902123-b424-4ad4-a0fd-fb177c82232d/M+NK+DF+MILER+SS.png",
  },
  {
    id: "minimalist",
    label: "Minimalist",
    imageUrl: "https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/a7e41722-a82a-42ae-90f2-1f74bc79cfd9/M+NK+DF+MILER+SS.png",
  },
  {
    id: "smart-casual",
    label: "Smart Casual",
    imageUrl: "https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/e4fb1f97-3315-45f5-9249-6d4262a1de19/M+NK+DF+FORM+HD+JKT.png",
  },
  {
    id: "scandi",
    label: "Scandi",
    imageUrl: "https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/958ae8fb-c27c-4441-9637-eeeb69f1ce78/M+NK+DF+FORM+HD+JKT.png",
  },
  {
    id: "workwear",
    label: "Workwear",
    imageUrl: "https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto,u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/i1-eef263ba-75a2-4bea-8e2f-e19d92bfeb36/M+NSW+CLUB+TEE.png",
  },
  {
    id: "athleisure",
    label: "Athleisure",
    imageUrl: "https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/77902123-b424-4ad4-a0fd-fb177c82232d/M+NK+DF+MILER+SS.png",
  },
  {
    id: "avant-garde",
    label: "Avant-Garde",
    imageUrl: "https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/a7e41722-a82a-42ae-90f2-1f74bc79cfd9/M+NK+DF+MILER+SS.png",
  },
  {
    id: "classic",
    label: "Classic",
    imageUrl: "https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/e4fb1f97-3315-45f5-9249-6d4262a1de19/M+NK+DF+FORM+HD+JKT.png",
  },
]

// ── Brand directory (~30 fashion brands with Logo.dev URLs) ──────────────────

const TOKEN = "pk_VAMPsVSMSC-VYyGOEOYXqw"
const logo = (domain: string) => `https://img.logo.dev/${domain}?token=${TOKEN}`

export const BRAND_DIRECTORY: BrandEntry[] = [
  { name: "Nike", logoUrl: logo("nike.com") },
  { name: "Adidas", logoUrl: logo("adidas.com") },
  { name: "New Balance", logoUrl: logo("newbalance.com") },
  { name: "Carhartt WIP", logoUrl: logo("carhartt-wip.com") },
  { name: "Stüssy", logoUrl: logo("stussy.com") },
  { name: "COS", logoUrl: logo("cos.com") },
  { name: "Arket", logoUrl: logo("arket.com") },
  { name: "ASOS", logoUrl: logo("asos.com") },
  { name: "Zara", logoUrl: logo("zara.com") },
  { name: "H&M", logoUrl: logo("hm.com") },
  { name: "Uniqlo", logoUrl: logo("uniqlo.com") },
  { name: "Acne Studios", logoUrl: logo("acnestudios.com") },
  { name: "A.P.C.", logoUrl: logo("apc.fr") },
  { name: "Norse Projects", logoUrl: logo("norseprojects.com") },
  { name: "Our Legacy", logoUrl: logo("ourlegacy.com") },
  { name: "Stone Island", logoUrl: logo("stoneisland.com") },
  { name: "The North Face", logoUrl: logo("thenorthface.com") },
  { name: "Patagonia", logoUrl: logo("patagonia.com") },
  { name: "Arc'teryx", logoUrl: logo("arcteryx.com") },
  { name: "Lululemon", logoUrl: logo("lululemon.com") },
  { name: "Ralph Lauren", logoUrl: logo("ralphlauren.com") },
  { name: "Tommy Hilfiger", logoUrl: logo("tommy.com") },
  { name: "Lacoste", logoUrl: logo("lacoste.com") },
  { name: "Fred Perry", logoUrl: logo("fredperry.com") },
  { name: "Puma", logoUrl: logo("puma.com") },
  { name: "Converse", logoUrl: logo("converse.com") },
  { name: "Vans", logoUrl: logo("vans.com") },
  { name: "Dr. Martens", logoUrl: logo("drmartens.com") },
  { name: "Dickies", logoUrl: logo("dickies.com") },
  { name: "Levi's", logoUrl: logo("levi.com") },
]

// ── Size options ─────────────────────────────────────────────────────────────

export const SIZE_OPTIONS = {
  Tops: ["UK XS", "UK S", "UK M", "UK L", "UK XL", "UK XXL"],
  Bottoms: ["UK 28", "UK 30", "UK 32", "UK 34", "UK 36", "UK 38"],
  Shoes: ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11", "UK 12"],
}

// ── Colour palette options ───────────────────────────────────────────────────

export const COLOUR_OPTIONS = [
  { name: "Black", hex: "#1a1a1a" },
  { name: "White", hex: "#f8f8f8" },
  { name: "Navy", hex: "#1e3a5f" },
  { name: "Grey", hex: "#808080" },
  { name: "Olive", hex: "#556b2f" },
  { name: "Cream", hex: "#f5f0e1" },
  { name: "Stone", hex: "#c2b280" },
  { name: "Burgundy", hex: "#722F37" },
  { name: "Forest", hex: "#228B22" },
  { name: "Rust", hex: "#B7410E" },
  { name: "Camel", hex: "#C19A6B" },
  { name: "Charcoal", hex: "#36454F" },
]
