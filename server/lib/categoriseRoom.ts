import type { WishlistRoom } from "../../shared/types/dreamHomeWishlist.ts";

const DOMAIN_MAP: Record<string, WishlistRoom> = {
  "bbqsgalore.com.au": "Outdoor Area",
  "kitchenwarehouse.com.au": "Kitchen",
  "appliancesonline.com.au": "Kitchen",
  "snooze.com.au": "Bedroom",
  "forty winks.com.au": "Bedroom",
  "sleepy.com.au": "Bedroom",
  "koala.com": "Bedroom",
  "ecosa.com.au": "Bedroom",
};

const KEYWORD_MAP: Record<Exclude<WishlistRoom, "Uncategorised">, string[]> = {
  Bathroom: [
    "vanity", "bathtub", "shower", "toilet", "tap", "faucet", "basin",
    "towel rail", "bath ", "tile", "showerhead", "tapware", "bidet",
    "ensuite", "heated towel", "exhaust fan", "shaving cabinet",
    "wall mirror", "vanity mirror",
  ],
  Bedroom: [
    "mattress", "bed frame", "bedhead", "headboard", "duvet", "doona",
    "pillow", "sheet set", "linen", "dresser", "wardrobe", "nightstand",
    "bedside", "chest of drawers", "quilt", "comforter",
    "bedroom", "ottoman bed", "bed base", "valet",
  ],
  "Games Room": [
    "pool table", "foosball", "table tennis", "ping pong", "arcade",
    "pinball", "dartboard", "snooker", "billiards", "air hockey",
    "shuffleboard", "card table", "poker table",
  ],
  Gym: [
    "treadmill", "dumbbell", "barbell", "kettlebell", "weight bench",
    "yoga mat", "exercise bike", "peloton", "rowing machine", "rower",
    "squat rack", "power rack", "elliptical", "home gym", "weight plate",
    "spin bike", "exercise mat", "boxing bag", "gym mirror",
    "resistance band", "skipping rope",
  ],
  "Home Cinema": [
    "projector", "projection screen", "surround sound", "av receiver",
    "soundbar", "home theatre", "home theater", "cinema chair",
    "recliner", "blu-ray", "media room", "subwoofer",
    "atmos speaker", "ambient lighting",
  ],
  "Home Office": [
    "office desk", "standing desk", "office chair", "ergonomic chair",
    "monitor", "filing cabinet", "bookshelf", "bookcase", "printer",
    "desk lamp", "keyboard tray", "gaming chair", "swivel chair",
    "desk pad", "monitor arm", "computer desk", "study desk",
    "cable tray",
  ],
  Kitchen: [
    "oven", "stove", "cooktop", "dishwasher", "fridge", "refrigerator",
    "microwave", "coffee machine", "espresso", "blender", "toaster",
    "kettle", "pantry", "range hood", "rangehood", "island bench",
    "splashback", "kitchen", "saucepan", "frypan", "induction",
    "wine fridge", "bar fridge", "beverage fridge", "wine cooler",
    "coffee grinder", "sous vide", "stand mixer", "food processor",
    "air fryer", "rice cooker", "thermomix", "ice maker",
    "water filter", "kitchen sink", "tap mixer",
  ],
  Laundry: [
    "washing machine", "dryer", "washer", "ironing board", "laundry",
    "hamper", "drying rack", "vacuum", "vacuum cleaner",
    "robot vacuum", "stick vacuum", "cordless vacuum", "handheld vacuum",
    "steam mop", "mop ", "broom", "cleaning trolley", "laundry basket",
    "laundry sink", "laundry tub",
  ],
  "Living Room": [
    "sofa", "couch", "armchair", "coffee table", "tv unit",
    "television", " tv ", "rug", "floor lamp", "console table",
    "ottoman", "sectional", "modular lounge", "side table",
    "entertainment unit", "tv stand", "media console", "lounge suite",
    "occasional chair", "accent chair", "throw cushion", "drapes",
    "curtain", "blind ", "smart speaker", "smart hub",
    "ceiling fan", "split system", "air conditioner", "air purifier",
    "pendant light", "chandelier", "table lamp", "wall art",
    "framed print", "canvas print",
  ],
  "Outdoor Area": [
    "bbq", "barbecue", "outdoor", "patio", "deck ", "garden",
    "pool ", "fire pit", "pizza oven", "lounger", "umbrella",
    "planter", "trampoline", "outdoor setting", "alfresco",
    "pergola", "decking", "lawn mower", "mower", "hedge trimmer",
    "leaf blower", "whipper snipper", "pressure washer",
    "garden hose", "pool float", "hot tub", "spa pool",
    "outdoor heater", "patio heater", "wood fired", "fire table",
    "outdoor sofa", "outdoor dining",
  ],
};

function extractDomain(domain: string): string {
  return domain.replace(/^www\./, "").toLowerCase();
}

export function categoriseRoom(
  title: string,
  description: string | null,
  domain: string
): WishlistRoom {
  const cleanDomain = extractDomain(domain);

  for (const [domainKey, room] of Object.entries(DOMAIN_MAP)) {
    if (cleanDomain === domainKey || cleanDomain.endsWith(`.${domainKey}`)) {
      return room;
    }
  }

  const text = `${title} ${description || ""}`.toLowerCase();
  const scores: Partial<Record<WishlistRoom, number>> = {};

  for (const [room, keywords] of Object.entries(KEYWORD_MAP)) {
    let score = 0;
    for (const keyword of keywords) {
      if (text.includes(keyword)) score++;
    }
    if (score > 0) scores[room as WishlistRoom] = score;
  }

  const entries = Object.entries(scores) as [WishlistRoom, number][];
  if (entries.length === 0) return "Uncategorised";

  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}

export function parsePrice(priceStr: string | null | undefined): number | null {
  if (!priceStr) return null;
  const cleaned = priceStr.replace(/,/g, "");
  const match = cleaned.match(/(\d+(?:\.\d+)?)/);
  if (!match) return null;
  const num = parseFloat(match[1]);
  return Number.isFinite(num) ? num : null;
}
