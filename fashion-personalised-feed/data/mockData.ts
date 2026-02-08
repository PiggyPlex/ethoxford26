// ─── Shared Types ──────────────────────────────────────────────────────────────

export type CardType =
  | "product"
  | "trending"
  | "deal"
  | "drop"
  | "outfit"
  | "sponsored";

export type Priority = "hot" | "new" | "normal";

export interface CardAction {
  label: string;
  variant?: "default" | "outline" | "ghost";
  actionType?: "primary" | "secondary" | "dismiss";
}

export interface CardData {
  id: string;
  type: CardType;
  title: string;
  summary: string;
  timestamp: string;
  priority: Priority;
  image?: string;
  actions: CardAction[];
  details?: Record<string, unknown>;
}

// ─── Notification-specific types (for the side panel / briefing) ───────────────

export type NotificationType =
  | "product"
  | "trending"
  | "deal"
  | "drop"
  | "outfit"
  | "sponsored"
  | (string & {});

export interface DataSource {
  /** Human-readable name of the data source */
  name: string;
  /** Lucide icon name (reuses notification-icon registry) */
  iconName: string;
}

export interface DataPoint {
  /** Specific observation that triggered this recommendation */
  text: string;
  /** Which source this came from (references DataSource.name) */
  source: string;
}

export interface Provenance {
  /** What data sources were consulted */
  dataSources: DataSource[];
  /** Specific data points that triggered this */
  dataPoints: DataPoint[];
  /** Why this was surfaced right now */
  reasoning: string;
}

export interface OutfitItem {
  name: string;
  price: string;
  brand?: string;
  imageUrl?: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  iconName: string;
  title: string;
  summary: string;
  timestamp: string;
  image?: string;
  /** Masonry grid height hint: "tall" (3:4), "wide" (4:3), or "standard" (square) */
  masonrySize?: "tall" | "wide" | "standard";
  provenance?: Provenance;
  details?: {
    // Shopping-specific fields
    productName?: string;
    brand?: string;
    brandLogoUrl?: string;
    currentPrice?: string;
    originalPrice?: string;
    salePrice?: string;
    discount?: string;
    imageUrl?: string;
    images?: string[];
    sizes?: string[];
    inStock?: boolean;
    socialProof?: string;
    distance?: string;
    storeName?: string;
    urgency?: string;
    dropDate?: string;
    collectionName?: string;
    occasion?: string;
    totalPrice?: string;
    whyForYou?: string;
    outfitItems?: OutfitItem[];
  };
}

// ─── Notifications (used in pill → panel → briefing flow) ──────────────────────

export const notifications: Notification[] = [
  {
    id: "1",
    type: "product",
    iconName: "sparkles",
    title: "Nike Air Max 90 — Picked for You",
    summary: "Sail/Gum colourway just restocked in your size",
    timestamp: "2 hours ago",
    image:
      "https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/77902123-b424-4ad4-a0fd-fb177c82232d/M+NK+DF+MILER+SS.png",
    masonrySize: "tall",
    provenance: {
      dataSources: [
        { name: "Your Instagram follows", iconName: "globe" },
        { name: "Your browsing history on END", iconName: "tag" },
      ],
      dataPoints: [
        {
          text: "You follow @nike and 4 sneaker accounts on IG",
          source: "Your Instagram follows",
        },
        {
          text: "You viewed Air Max 90s 3 times last week on END Clothing",
          source: "Your browsing history on END",
        },
      ],
      reasoning:
        "Sail/Gum colourway restocked in UK 10 — matches your saved size preference",
    },
    details: {
      productName: "Nike Air Max 90",
      brand: "Nike",
      brandLogoUrl:
        "https://img.logo.dev/nike.com?token=pk_VAMPsVSMSC-VYyGOEOYXqw",
      currentPrice: "£129.99",
      sizes: ["UK 8", "UK 9", "UK 10", "UK 11"],
      inStock: true,
      whyForYou: "Matches brands you follow on IG and your saved size UK 10",
      storeName: "END Clothing",
    },
  },
  {
    id: "2",
    type: "trending",
    iconName: "arrow-trending-up",
    title: "Carhartt WIP Beanie Trending Near You",
    summary: "Popular in Shoreditch — 12 people you follow bought this",
    timestamp: "3 hours ago",
    image:
      "https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/a7e41722-a82a-42ae-90f2-1f74bc79cfd9/M+NK+DF+MILER+SS.png",
    masonrySize: "tall",
    provenance: {
      dataSources: [
        { name: "Your location data", iconName: "map-pin" },
        { name: "Social purchase signals", iconName: "globe" },
      ],
      dataPoints: [
        {
          text: "You're currently in Shoreditch, East London",
          source: "Your location data",
        },
        {
          text: "12 accounts you follow purchased this item recently",
          source: "Social purchase signals",
        },
      ],
      reasoning:
        "Trending item in your area that aligns with your streetwear preferences",
    },
    details: {
      productName: "Carhartt WIP Acrylic Watch Hat",
      brand: "Carhartt WIP",
      brandLogoUrl:
        "https://img.logo.dev/carhartt-wip.com?token=pk_VAMPsVSMSC-VYyGOEOYXqw",
      currentPrice: "£19.00",
      socialProof: "Popular with people you follow",
      distance: "0.3 miles away",
      storeName: "Carhartt WIP Shoreditch",
      inStock: true,
    },
  },
  {
    id: "3",
    type: "deal",
    iconName: "tag",
    title: "40% Off COS Wool Overcoat",
    summary: "Price dropped from £175 to £105 — lowest price this year",
    timestamp: "4 hours ago",
    image:
      "https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/e4fb1f97-3315-45f5-9249-6d4262a1de19/M+NK+DF+FORM+HD+JKT.png",
    masonrySize: "wide",
    provenance: {
      dataSources: [
        { name: "Your price alert watchlist", iconName: "bell" },
        { name: "Historical price tracker", iconName: "arrow-trending-up" },
      ],
      dataPoints: [
        {
          text: "You set a price alert for COS outerwear under £120",
          source: "Your price alert watchlist",
        },
        {
          text: "This is the lowest price recorded in 6 months",
          source: "Historical price tracker",
        },
      ],
      reasoning:
        "Price dropped below your alert threshold — limited stock remaining",
    },
    details: {
      productName: "COS Relaxed-Fit Wool Overcoat",
      brand: "COS",
      brandLogoUrl:
        "https://img.logo.dev/cos.com?token=pk_VAMPsVSMSC-VYyGOEOYXqw",
      originalPrice: "£175.00",
      salePrice: "£105.00",
      discount: "-40%",
      urgency: "Ends in 2 hours · Only 3 left in your size",
      inStock: true,
      sizes: ["S", "M", "L"],
    },
  },
  {
    id: "4",
    type: "drop",
    iconName: "flame",
    title: "Stüssy Spring 2025 Collection",
    summary:
      "New season drop this Friday — 24 pieces including the reversible fleece",
    timestamp: "6 hours ago",
    image:
      "https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/958ae8fb-c27c-4441-9637-eeeb69f1ce78/M+NK+DF+FORM+HD+JKT.png",
    masonrySize: "wide",
    provenance: {
      dataSources: [
        { name: "Your followed brands", iconName: "heart" },
        { name: "Release calendar", iconName: "calendar-days" },
      ],
      dataPoints: [
        {
          text: "Stüssy is in your top 5 followed brands",
          source: "Your followed brands",
        },
        {
          text: "You purchased from their last 2 seasonal drops",
          source: "Release calendar",
        },
      ],
      reasoning:
        "New collection from a brand you consistently shop — drop date confirmed for Friday 10 AM",
    },
    details: {
      brand: "Stüssy",
      brandLogoUrl:
        "https://img.logo.dev/stussy.com?token=pk_VAMPsVSMSC-VYyGOEOYXqw",
      collectionName: "Spring 2025 Collection",
      dropDate: "Friday, 10:00 AM",
      images: [
        "https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto,u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/i1-eef263ba-75a2-4bea-8e2f-e19d92bfeb36/M+NSW+CLUB+TEE.png",
        "https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/77902123-b424-4ad4-a0fd-fb177c82232d/M+NK+DF+MILER+SS.png",
        "https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/a7e41722-a82a-42ae-90f2-1f74bc79cfd9/M+NK+DF+MILER+SS.png",
      ],
    },
  },
  {
    id: "5",
    type: "outfit",
    iconName: "shirt",
    title: "Smart Casual Friday Look",
    summary: "4 items assembled from your saved pieces and new finds",
    timestamp: "8 hours ago",
    image:
      "https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto,u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/i1-eef263ba-75a2-4bea-8e2f-e19d92bfeb36/M+NSW+CLUB+TEE.png",
    masonrySize: "standard",
    provenance: {
      dataSources: [
        { name: "Your saved items", iconName: "heart" },
        { name: "Your calendar", iconName: "calendar-days" },
      ],
      dataPoints: [
        {
          text: "You have a dinner reservation Friday at 7 PM",
          source: "Your calendar",
        },
        {
          text: "2 of these items are already in your saved list",
          source: "Your saved items",
        },
      ],
      reasoning:
        "Assembled an outfit for your Friday dinner — mixes saved pieces with new recommendations",
    },
    details: {
      occasion: "Smart Casual",
      totalPrice: "£247.00",
      outfitItems: [
        {
          name: "Relaxed Wool Blazer",
          price: "£89.00",
          brand: "COS",
          imageUrl:
            "https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/77902123-b424-4ad4-a0fd-fb177c82232d/M+NK+DF+MILER+SS.png",
        },
        {
          name: "Heavyweight Cotton Tee",
          price: "£28.00",
          brand: "Arket",
          imageUrl:
            "https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/a7e41722-a82a-42ae-90f2-1f74bc79cfd9/M+NK+DF+MILER+SS.png",
        },
        {
          name: "Wide-Leg Chinos",
          price: "£49.00",
          brand: "Uniqlo U",
          imageUrl:
            "https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/e4fb1f97-3315-45f5-9249-6d4262a1de19/M+NK+DF+FORM+HD+JKT.png",
        },
        {
          name: "New Balance 990v6",
          price: "£185.00",
          brand: "New Balance",
          imageUrl:
            "https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/958ae8fb-c27c-4441-9637-eeeb69f1ce78/M+NK+DF+FORM+HD+JKT.png",
        },
      ],
    },
  },
  {
    id: "6",
    type: "sponsored",
    iconName: "megaphone",
    title: "ASOS New Season Edit",
    summary: "Curated picks for your style — up to 30% off new arrivals",
    timestamp: "10 hours ago",
    image:
      "https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto,u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/i1-eef263ba-75a2-4bea-8e2f-e19d92bfeb36/M+NSW+CLUB+TEE.png",
    masonrySize: "wide",
    provenance: {
      dataSources: [{ name: "ASOS advertising", iconName: "megaphone" }],
      dataPoints: [
        {
          text: "Based on your browsing profile and style preferences",
          source: "ASOS advertising",
        },
      ],
      reasoning:
        "Sponsored recommendation — ASOS New Season campaign targeting your demographic",
    },
    details: {
      brand: "ASOS",
      brandLogoUrl:
        "https://img.logo.dev/asos.com?token=pk_VAMPsVSMSC-VYyGOEOYXqw",
      discount: "Up to 30% off",
      storeName: "ASOS",
      currentPrice: "From £14.99",
    },
  },
  {
    id: "7",
    type: "product",
    iconName: "sparkles",
    title: "Adidas Samba OG — Back in Stock",
    summary: "White/Black colourway restocked on Adidas.co.uk",
    timestamp: "1 hour ago",
    image:
      "https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/77902123-b424-4ad4-a0fd-fb177c82232d/M+NK+DF+MILER+SS.png",
    masonrySize: "tall",
    provenance: {
      dataSources: [{ name: "Your browsing history", iconName: "globe" }],
      dataPoints: [
        {
          text: "You viewed Samba OGs 5 times in the last month",
          source: "Your browsing history",
        },
      ],
      reasoning:
        "Restocked in your size UK 10 — one of the most viewed items in your history",
    },
    details: {
      productName: "Adidas Samba OG",
      brand: "Adidas",
      brandLogoUrl:
        "https://img.logo.dev/adidas.com?token=pk_VAMPsVSMSC-VYyGOEOYXqw",
      currentPrice: "£90.00",
      sizes: ["UK 8", "UK 9", "UK 10", "UK 11"],
      inStock: true,
      whyForYou: "One of your most viewed shoes — finally back in stock",
      storeName: "Adidas",
    },
  },
  {
    id: "8",
    type: "trending",
    iconName: "arrow-trending-up",
    title: "Acne Studios Wool Scarf",
    summary: "Trending this winter — 8 people in your circle just bought one",
    timestamp: "5 hours ago",
    image:
      "https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/a7e41722-a82a-42ae-90f2-1f74bc79cfd9/M+NK+DF+MILER+SS.png",
    masonrySize: "standard",
    provenance: {
      dataSources: [{ name: "Social purchase signals", iconName: "globe" }],
      dataPoints: [
        {
          text: "8 people in your circle purchased this in the last week",
          source: "Social purchase signals",
        },
      ],
      reasoning:
        "Winter essential trending among people with similar style to yours",
    },
    details: {
      productName: "Acne Studios Canada Scarf",
      brand: "Acne Studios",
      brandLogoUrl:
        "https://img.logo.dev/acnestudios.com?token=pk_VAMPsVSMSC-VYyGOEOYXqw",
      currentPrice: "£160.00",
      socialProof: "8 friends purchased recently",
      inStock: true,
    },
  },
  {
    id: "9",
    type: "deal",
    iconName: "tag",
    title: "25% Off Uniqlo Cashmere",
    summary: "Premium cashmere sweater dropped to £59.90",
    timestamp: "3 hours ago",
    image:
      "https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/e4fb1f97-3315-45f5-9249-6d4262a1de19/M+NK+DF+FORM+HD+JKT.png",
    masonrySize: "tall",
    provenance: {
      dataSources: [{ name: "Your price alert watchlist", iconName: "bell" }],
      dataPoints: [
        {
          text: "You saved Uniqlo cashmere items to your wishlist",
          source: "Your price alert watchlist",
        },
      ],
      reasoning: "Price dropped below your £70 alert for Uniqlo knitwear",
    },
    details: {
      productName: "Uniqlo Premium Cashmere Crew Neck",
      brand: "Uniqlo",
      brandLogoUrl:
        "https://img.logo.dev/uniqlo.com?token=pk_VAMPsVSMSC-VYyGOEOYXqw",
      originalPrice: "£79.90",
      salePrice: "£59.90",
      discount: "-25%",
      urgency: "Sale ends Sunday",
      inStock: true,
      sizes: ["XS", "S", "M", "L", "XL"],
    },
  },
  {
    id: "10",
    type: "product",
    iconName: "sparkles",
    title: "Salomon XT-6 — Your Style",
    summary: "Trail-to-street in Black/Vanilla Ice colourway",
    timestamp: "4 hours ago",
    image:
      "https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/958ae8fb-c27c-4441-9637-eeeb69f1ce78/M+NK+DF+FORM+HD+JKT.png",
    masonrySize: "tall",
    provenance: {
      dataSources: [{ name: "Your style profile", iconName: "heart" }],
      dataPoints: [
        {
          text: "Gorpcore is in your style tags",
          source: "Your style profile",
        },
      ],
      reasoning: "Matches your gorpcore aesthetic and size UK 10",
    },
    details: {
      productName: "Salomon XT-6 Advanced",
      brand: "Salomon",
      brandLogoUrl:
        "https://img.logo.dev/salomon.com?token=pk_VAMPsVSMSC-VYyGOEOYXqw",
      currentPrice: "£175.00",
      sizes: ["UK 8", "UK 9", "UK 10", "UK 11"],
      inStock: true,
      whyForYou: "Gorpcore essential that matches your style profile",
      storeName: "End Clothing",
    },
  },
  {
    id: "11",
    type: "drop",
    iconName: "flame",
    title: "Palace Spring Lookbook",
    summary: "New season pieces dropping next week",
    timestamp: "7 hours ago",
    image:
      "https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto,u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/i1-eef263ba-75a2-4bea-8e2f-e19d92bfeb36/M+NSW+CLUB+TEE.png",
    masonrySize: "wide",
    provenance: {
      dataSources: [{ name: "Your followed brands", iconName: "heart" }],
      dataPoints: [
        {
          text: "Palace is in your followed brands",
          source: "Your followed brands",
        },
      ],
      reasoning:
        "New collection from a brand in your favourites — preview just released",
    },
    details: {
      brand: "Palace",
      brandLogoUrl:
        "https://img.logo.dev/palaceskateboards.com?token=pk_VAMPsVSMSC-VYyGOEOYXqw",
      collectionName: "Spring 2025 Lookbook",
      dropDate: "Next Wednesday, 11:00 AM",
      images: [
        "https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/77902123-b424-4ad4-a0fd-fb177c82232d/M+NK+DF+MILER+SS.png",
        "https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/a7e41722-a82a-42ae-90f2-1f74bc79cfd9/M+NK+DF+MILER+SS.png",
        "https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/e4fb1f97-3315-45f5-9249-6d4262a1de19/M+NK+DF+FORM+HD+JKT.png",
      ],
    },
  },
  {
    id: "12",
    type: "outfit",
    iconName: "shirt",
    title: "Date Night Look",
    summary: "3 pieces for a polished evening out",
    timestamp: "9 hours ago",
    image:
      "https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/958ae8fb-c27c-4441-9637-eeeb69f1ce78/M+NK+DF+FORM+HD+JKT.png",
    masonrySize: "standard",
    provenance: {
      dataSources: [{ name: "Your calendar", iconName: "calendar-days" }],
      dataPoints: [
        {
          text: "You have a date on Saturday evening",
          source: "Your calendar",
        },
      ],
      reasoning: "Assembled a polished look for your Saturday night plans",
    },
    details: {
      occasion: "Date Night",
      totalPrice: "£312.00",
      outfitItems: [
        {
          name: "Slim Fit Shirt",
          price: "£45.00",
          brand: "COS",
          imageUrl:
            "https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto,u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/i1-eef263ba-75a2-4bea-8e2f-e19d92bfeb36/M+NSW+CLUB+TEE.png",
        },
        {
          name: "Tailored Trousers",
          price: "£89.00",
          brand: "Arket",
          imageUrl:
            "https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/77902123-b424-4ad4-a0fd-fb177c82232d/M+NK+DF+MILER+SS.png",
        },
        {
          name: "Chelsea Boots",
          price: "£178.00",
          brand: "Grenson",
          imageUrl:
            "https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/a7e41722-a82a-42ae-90f2-1f74bc79cfd9/M+NK+DF+MILER+SS.png",
        },
      ],
    },
  },
  {
    id: "13",
    type: "product",
    iconName: "sparkles",
    title: "Arc'teryx Beta LT Jacket",
    summary: "Technical shell in Black — new arrival at END",
    timestamp: "5 hours ago",
    image:
      "https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/e4fb1f97-3315-45f5-9249-6d4262a1de19/M+NK+DF+FORM+HD+JKT.png",
    masonrySize: "tall",
    provenance: {
      dataSources: [{ name: "Your followed brands", iconName: "heart" }],
      dataPoints: [
        {
          text: "Arc'teryx is in your followed brands",
          source: "Your followed brands",
        },
      ],
      reasoning: "New arrival from a brand you follow — gorpcore staple",
    },
    details: {
      productName: "Arc'teryx Beta LT Jacket",
      brand: "Arc'teryx",
      brandLogoUrl:
        "https://img.logo.dev/arcteryx.com?token=pk_VAMPsVSMSC-VYyGOEOYXqw",
      currentPrice: "£450.00",
      sizes: ["S", "M", "L", "XL"],
      inStock: true,
      whyForYou: "Premium technical outerwear matching your gorpcore style",
      storeName: "END Clothing",
    },
  },
];

// ─── Dashboard card data ───────────────────────────────────────────────────────

export const dashboardCards: CardData[] = [
  {
    id: "dash-product",
    type: "product",
    title: "Nike Air Max 90 Sail/Gum",
    summary: "END Clothing · Restocked in your size",
    timestamp: "2 hours ago",
    priority: "new",
    image:
      "https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/77902123-b424-4ad4-a0fd-fb177c82232d/M+NK+DF+MILER+SS.png",
    actions: [
      { label: "Buy Now", actionType: "primary" },
      { label: "Save", variant: "outline", actionType: "secondary" },
      { label: "Not My Style", variant: "ghost", actionType: "dismiss" },
    ],
  },
  {
    id: "dash-trending",
    type: "trending",
    title: "Carhartt WIP Beanie",
    summary: "Trending in Shoreditch · 12 friends bought this",
    timestamp: "3 hours ago",
    priority: "hot",
    image:
      "https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/a7e41722-a82a-42ae-90f2-1f74bc79cfd9/M+NK+DF+MILER+SS.png",
    actions: [
      { label: "View", actionType: "primary" },
      { label: "Save", variant: "outline", actionType: "secondary" },
      { label: "Dismiss", variant: "ghost", actionType: "dismiss" },
    ],
  },
  {
    id: "dash-deal",
    type: "deal",
    title: "COS Wool Overcoat — Save £70",
    summary: "40% off · Ends in 2 hours",
    timestamp: "4 hours ago",
    priority: "hot",
    image:
      "https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/e4fb1f97-3315-45f5-9249-6d4262a1de19/M+NK+DF+FORM+HD+JKT.png",
    actions: [
      { label: "Buy Now", actionType: "primary" },
      { label: "Price History", variant: "outline", actionType: "secondary" },
      { label: "Dismiss", variant: "ghost", actionType: "dismiss" },
    ],
  },
  {
    id: "dash-drop",
    type: "drop",
    title: "Stüssy Spring 2025 Drop",
    summary: "24 pieces · Drops Friday 10 AM",
    timestamp: "6 hours ago",
    priority: "new",
    image:
      "https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/958ae8fb-c27c-4441-9637-eeeb69f1ce78/M+NK+DF+FORM+HD+JKT.png",
    actions: [
      { label: "Shop Collection", actionType: "primary" },
      { label: "Remind Me", variant: "outline", actionType: "secondary" },
      { label: "Not Interested", variant: "ghost", actionType: "dismiss" },
    ],
  },
  {
    id: "dash-outfit",
    type: "outfit",
    title: "Smart Casual Friday Look",
    summary: "4 items · £247 total",
    timestamp: "8 hours ago",
    priority: "new",
    image:
      "https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto,u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/i1-eef263ba-75a2-4bea-8e2f-e19d92bfeb36/M+NSW+CLUB+TEE.png",
    actions: [
      { label: "Buy All", actionType: "primary" },
      { label: "Edit Outfit", variant: "outline", actionType: "secondary" },
      { label: "Save", variant: "outline", actionType: "secondary" },
    ],
  },
  {
    id: "dash-sponsored",
    type: "sponsored",
    title: "ASOS New Season Edit — Up to 30% Off",
    summary: "Sponsored",
    timestamp: "10 hours ago",
    priority: "normal",
    image:
      "https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/77902123-b424-4ad4-a0fd-fb177c82232d/M+NK+DF+MILER+SS.png",
    actions: [
      { label: "Shop Now", actionType: "primary" },
      { label: "Not Interested", variant: "ghost", actionType: "dismiss" },
    ],
  },
];

// ─── Currently running agents ──────────────────────────────────────────────────

export const runningAgents = [
  { id: 1, text: "Scanning 3 stores for price drops...", progress: 67 },
  { id: 2, text: "Monitoring Stüssy drop page...", progress: 42 },
  { id: 3, text: "Building outfit suggestions for Friday...", progress: 88 },
];

// ─── Chat mock data ────────────────────────────────────────────────────────────

export const chatProducts = [
  { name: "Nike Air Max 90 Sail", price: "£129.99", retailer: "END Clothing" },
  {
    name: "Carhartt WIP Michigan Coat",
    price: "£189.00",
    retailer: "Carhartt WIP",
  },
  { name: "New Balance 990v6 Grey", price: "£185.00", retailer: "New Balance" },
];

export const quickActions = [
  "Find deals",
  "Outfit ideas",
  "What's trending",
  "My saved items",
  "Price alerts",
];
