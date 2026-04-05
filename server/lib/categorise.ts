import type { Category } from "../../shared/types/visionBoard.ts";

const DOMAIN_MAP: Record<string, Category> = {
  "apple.com": "Tech",
  "samsung.com": "Tech",
  "jbhifi.com.au": "Tech",
  "dell.com": "Tech",
  "lenovo.com": "Tech",
  "microsoft.com": "Tech",
  "bestbuy.com": "Tech",
  "logitech.com": "Tech",
  "sony.com": "Tech",
  "bose.com": "Tech",
  "booking.com": "Travel",
  "airbnb.com": "Travel",
  "airbnb.com.au": "Travel",
  "qantas.com": "Travel",
  "expedia.com": "Travel",
  "tripadvisor.com": "Travel",
  "skyscanner.com.au": "Travel",
  "jetstar.com": "Travel",
  "virginaustralia.com": "Travel",
  "nike.com": "Health & Fitness",
  "lululemon.com": "Health & Fitness",
  "gymshark.com": "Health & Fitness",
  "whoop.com": "Health & Fitness",
  "garmin.com": "Health & Fitness",
  "asos.com": "Fashion",
  "zara.com": "Fashion",
  "theiconic.com.au": "Fashion",
  "net-a-porter.com": "Fashion",
  "mrporter.com": "Fashion",
  "uniqlo.com": "Fashion",
  "gucci.com": "Fashion",
  "louisvuitton.com": "Fashion",
  "ikea.com": "Home",
  "ikea.com.au": "Home",
  "bunnings.com.au": "Home",
  "templeandwebster.com.au": "Home",
  "westelm.com": "Home",
  "wayfair.com": "Home",
  "ubereats.com": "Food & Drink",
  "doordash.com": "Food & Drink",
  "nespresso.com": "Food & Drink",
  "danmurphys.com.au": "Food & Drink",
  "carsales.com.au": "Automotive",
  "tesla.com": "Automotive",
  "bmw.com": "Automotive",
  "porsche.com": "Automotive",
  "lego.com": "Family",
  "target.com.au": "Family",
  "bigw.com.au": "Family",
  "kmart.com.au": "Family",
  "ticketmaster.com.au": "Entertainment",
  "eventbrite.com": "Entertainment",
  "playstation.com": "Entertainment",
  "nintendo.com": "Entertainment",
  "steam.com": "Entertainment",
};

const KEYWORD_MAP: Record<Category, string[]> = {
  Tech: [
    "laptop", "phone", "monitor", "keyboard", "headphones", "tablet", "camera",
    "speaker", "wireless", "bluetooth", "macbook", "iphone", "ipad", "airpods",
    "mouse", "smartwatch", "drone", "computer", "gaming",
  ],
  Travel: [
    "hotel", "flight", "luggage", "resort", "vacation", "holiday", "cruise",
    "travel", "booking", "adventure", "tour", "destination", "beach",
  ],
  "Health & Fitness": [
    "vitamin", "supplement", "fitness", "wellness", "gym", "protein", "yoga",
    "running", "exercise", "workout", "treadmill", "weights", "health",
    "skincare", "nutrition",
  ],
  Family: [
    "toy", "kids", "baby", "children", "family", "nursery", "stroller",
    "toddler", "playground", "educational",
  ],
  Fashion: [
    "dress", "shirt", "shoes", "jacket", "sneakers", "handbag", "watch",
    "jewellery", "sunglasses", "boots", "coat", "jeans", "perfume", "designer",
  ],
  Home: [
    "furniture", "sofa", "table", "chair", "bed", "mattress", "lamp", "rug",
    "desk", "kitchen", "garden", "outdoor", "decor", "plant",
  ],
  "Food & Drink": [
    "coffee", "wine", "beer", "whisky", "chocolate", "gourmet", "restaurant",
    "espresso", "cocktail", "tea",
  ],
  Automotive: [
    "car", "vehicle", "motorcycle", "electric vehicle", "suv", "automotive",
  ],
  Entertainment: [
    "concert", "movie", "music", "game", "console", "streaming", "ticket",
    "festival", "book", "podcast",
  ],
  Other: [],
};

function extractDomain(domain: string): string {
  return domain.replace(/^www\./, "").toLowerCase();
}

export function categorise(
  title: string,
  description: string | null,
  domain: string
): Category {
  const cleanDomain = extractDomain(domain);

  for (const [domainKey, category] of Object.entries(DOMAIN_MAP)) {
    if (cleanDomain === domainKey || cleanDomain.endsWith(`.${domainKey}`)) {
      return category;
    }
  }

  const text = `${title} ${description || ""}`.toLowerCase();
  const scores: Partial<Record<Category, number>> = {};

  for (const [category, keywords] of Object.entries(KEYWORD_MAP)) {
    if (category === "Other") continue;
    let score = 0;
    for (const keyword of keywords) {
      if (text.includes(keyword)) score++;
    }
    if (score > 0) scores[category as Category] = score;
  }

  const entries = Object.entries(scores) as [Category, number][];
  if (entries.length === 0) return "Other";

  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}
