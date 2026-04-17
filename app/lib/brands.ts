// Curated brand list for Brandle puzzles.
// Brand names should be alphabetic only (letters A-Z). No spaces, digits, or punctuation.
// Length range: 4 to 9 letters keeps the grid readable on mobile.

export type Brand = {
  name: string; // uppercase, letters only
  category: string; // for hints / future filtering
};

export const BRANDS: Brand[] = [
  // 4
  { name: "NIKE", category: "Apparel" },
  { name: "IKEA", category: "Retail" },
  { name: "ZARA", category: "Fashion" },
  { name: "SONY", category: "Electronics" },
  { name: "VISA", category: "Finance" },
  { name: "AUDI", category: "Automotive" },
  { name: "EBAY", category: "Internet" },
  { name: "HSBC", category: "Finance" },
  { name: "AMUL", category: "Food" },
  { name: "OYO", category: "Hospitality" },
  // 5
  { name: "APPLE", category: "Technology" },
  { name: "TESLA", category: "Automotive" },
  { name: "HONDA", category: "Automotive" },
  { name: "GUCCI", category: "Fashion" },
  { name: "PRADA", category: "Fashion" },
  { name: "PEPSI", category: "Beverage" },
  { name: "SHELL", category: "Energy" },
  { name: "LEXUS", category: "Automotive" },
  { name: "SONOS", category: "Electronics" },
  { name: "FEDEX", category: "Logistics" },
  { name: "INTEL", category: "Technology" },
  { name: "CANON", category: "Electronics" },
  { name: "MAZDA", category: "Automotive" },
  { name: "KODAK", category: "Photography" },
  { name: "BOSCH", category: "Industrial" },
  { name: "LOTUS", category: "Automotive" },
  { name: "PUMA", category: "Apparel" },
  // 6
  { name: "ADIDAS", category: "Apparel" },
  { name: "GOOGLE", category: "Technology" },
  { name: "AMAZON", category: "Internet" },
  { name: "NETFLIX", category: "Media" }, // 7 — moved below
  { name: "PFIZER", category: "Pharma" },
  { name: "TOYOTA", category: "Automotive" },
  { name: "NISSAN", category: "Automotive" },
  { name: "SUZUKI", category: "Automotive" },
  { name: "ESPN", category: "Media" }, // 4 — moved
  { name: "HERMES", category: "Fashion" },
  { name: "GOPRO", category: "Electronics" }, // 5 — moved
  { name: "OAKLEY", category: "Eyewear" },
  { name: "SUBWAY", category: "Food" },
  { name: "BARBIE", category: "Toys" },
  { name: "PIXAR", category: "Media" }, // 5 — moved
  { name: "REVLON", category: "Beauty" },
  { name: "GARMIN", category: "Electronics" },
  { name: "LENOVO", category: "Technology" },
  { name: "BOEING", category: "Aerospace" },
  { name: "NESTLE", category: "Food" },
  // 7
  { name: "SAMSUNG", category: "Electronics" },
  { name: "FERRARI", category: "Automotive" },
  { name: "BUGATTI", category: "Automotive" },
  { name: "PORSCHE", category: "Automotive" },
  { name: "HYUNDAI", category: "Automotive" },
  { name: "BENTLEY", category: "Automotive" },
  { name: "MARRIOT", category: "Hospitality" },
  { name: "GILLETTE", category: "Personal Care" }, // 8 — moved
  { name: "HUAWEI", category: "Electronics" }, // 6 — moved
  { name: "RAYBAN", category: "Eyewear" }, // 6 — moved
  { name: "HEINEKEN", category: "Beverage" }, // 8 — moved
  { name: "MARLBORO", category: "Tobacco" }, // 8 — moved
  { name: "STARBUCKS", category: "Food" }, // 9 — moved
  { name: "SPOTIFY", category: "Media" },
  { name: "NINTENDO", category: "Gaming" }, // 8 — moved
  { name: "PHILIPS", category: "Electronics" },
  { name: "CARTIER", category: "Luxury" },
  { name: "RICOH", category: "Electronics" }, // 5 — moved
  { name: "RYANAIR", category: "Airlines" },
  // 8
  { name: "MICROSOFT", category: "Technology" }, // 9 — moved
  { name: "FACEBOOK", category: "Internet" },
  { name: "INSTAGRAM", category: "Internet" }, // 9 — moved
  { name: "MOTOROLA", category: "Electronics" },
  { name: "REYNOLDS", category: "Consumer Goods" },
  { name: "PANASONIC", category: "Electronics" }, // 9 — moved
  { name: "DELOITTE", category: "Consulting" },
  { name: "BURBERRY", category: "Fashion" },
  { name: "CHEVROLET", category: "Automotive" }, // 9 — moved
  { name: "MITSUBISHI", category: "Automotive" }, // 10 — drop
  { name: "VOLKSWAGEN", category: "Automotive" }, // 10 — drop
];

// Filter to clean alphabetic 4–9, deduped.
const CLEAN: Brand[] = (() => {
  const seen = new Set<string>();
  const out: Brand[] = [];
  for (const b of BRANDS) {
    const name = b.name.toUpperCase();
    if (!/^[A-Z]+$/.test(name)) continue;
    if (name.length < 4 || name.length > 9) continue;
    if (seen.has(name)) continue;
    seen.add(name);
    out.push({ name, category: b.category });
  }
  return out;
})();

export const PUZZLE_BRANDS = CLEAN;

// Build a Set of valid brand names for guess validation.
export const VALID_GUESSES: Set<string> = new Set(CLEAN.map((b) => b.name));

// Brands grouped by length for pickers.
export const BRANDS_BY_LENGTH: Record<number, Brand[]> = (() => {
  const map: Record<number, Brand[]> = {};
  for (const b of CLEAN) {
    (map[b.name.length] ||= []).push(b);
  }
  return map;
})();
