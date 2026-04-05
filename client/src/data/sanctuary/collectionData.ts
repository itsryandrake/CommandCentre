// Collection & Wishlist Data

export type CollectionItemType = 'collection' | 'wishlist';

export type CollectionCategory =
  | 'Accessories'
  | 'Ambiance'
  | 'Anal Play'
  | 'Bondage'
  | 'Dildo'
  | 'Games'
  | 'Lingerie'
  | 'Other'
  | 'Toys'
  | 'Vibrator';

export interface CollectionItem {
  readonly id: number;
  readonly name: string;
  readonly url: string;
  readonly image: string;
  readonly category: CollectionCategory;
  readonly price: string;
  readonly type: CollectionItemType;
}

export interface PlayIdea {
  readonly title: string;
  readonly desc: string;
}

export interface CategoryContent {
  readonly playIdeas: readonly PlayIdea[];
  readonly suggestions: readonly string[];
  readonly questions: readonly string[];
}

export const defaultCollection: readonly CollectionItem[] = [
  {
    id: 1,
    name: "Tush Toy & Tail",
    url: "https://www.honeybirdette.com/products/tush-toy-and-tail-red",
    image: "https://www.honeybirdette.com/cdn/shop/files/TushToy_Tail.jpg?v=1759286319&width=400",
    category: "Accessories",
    price: "$90",
    type: "collection",
  },
  {
    id: 2,
    name: "Shibari Black Rope",
    url: "https://www.honeybirdette.com/products/shibari-black-rope",
    image: "https://www.honeybirdette.com/cdn/shop/products/SHIBARI_BLACK_1.jpg?v=1668667515&width=400",
    category: "Bondage",
    price: "",
    type: "collection",
  },
  {
    id: 3,
    name: "Gold Tassel Nipple Clamps",
    url: "https://www.honeybirdette.com/products/gold-tassel-nipple-clamps",
    image: "https://www.honeybirdette.com/cdn/shop/products/GOLD_TASSEL_NIPPLE_CLAMPS_1.jpg?v=1668664988&width=400",
    category: "Bondage",
    price: "",
    type: "collection",
  },
  {
    id: 4,
    name: "Dirty Vanilla Candle",
    url: "https://www.honeybirdette.com/products/dirty-vanilla-candle",
    image: "https://www.honeybirdette.com/cdn/shop/products/HoneyBirdette-Nov22-Shot02-002.jpg?v=1670988648&width=400",
    category: "Ambiance",
    price: "",
    type: "collection",
  },
  {
    id: 5,
    name: "Do Not Disturb Kit",
    url: "https://www.honeybirdette.com/collections/toys",
    image: "https://www.honeybirdette.com/cdn/shop/files/DO_NOT_DISTURB_KIT_1.jpg?v=1711418507&width=400",
    category: "Toys",
    price: "",
    type: "collection",
  },
  {
    id: 6,
    name: "Taurus",
    url: "https://www.honeybirdette.com/products/taurus-hot-pink",
    image: "https://www.honeybirdette.com/cdn/shop/files/TAURUS_HOT_PINK_1.jpg?v=1700014229&width=400",
    category: "Vibrator",
    price: "",
    type: "collection",
  },
  {
    id: 7,
    name: "Harley",
    url: "https://www.honeybirdette.com/products/harley-hot-pink",
    image: "https://www.honeybirdette.com/cdn/shop/files/HARLEY_HOT_PINK_1.jpg?v=1700012759&width=400",
    category: "Vibrator",
    price: "",
    type: "collection",
  },
  {
    id: 8,
    name: "IOU Cards",
    url: "https://www.honeybirdette.com/products/just-for-you-iou-cards",
    image: "https://www.honeybirdette.com/cdn/shop/products/JUST_FOR_YOU_IOU_CARDS_1.jpg?v=1668665269&width=400",
    category: "Games",
    price: "",
    type: "collection",
  },
  {
    id: 9,
    name: "Sacred Squirter",
    url: "https://yonipleasurepalace.com/collections/glass-wands/products/the-sacred-squirter",
    image: "https://yonipleasurepalace.com/cdn/shop/files/SacredSquirterGlassPleasureWandPinkMidnightBlackLilac6.jpg?v=1761699703&width=1024",
    category: "Toys",
    price: "$139",
    type: "collection",
  },
  {
    id: 10,
    name: "Octopussy 2.0",
    url: "https://yonipleasurepalace.com/collections/glass-wands/products/optopussy-shape-bigger-size",
    image: "https://yonipleasurepalace.com/cdn/shop/files/TheOctopussy2.0GlassDildoPleasureWand1.jpg?v=1759978795&width=1024",
    category: "Toys",
    price: "$144",
    type: "collection",
  },
  {
    id: 11,
    name: "Medusa Pleasure Wand",
    url: "https://yonipleasurepalace.com/collections/glass-wands/products/the-medusa",
    image: "https://yonipleasurepalace.com/cdn/shop/files/The-Medusa-Glass-Pleasure-Wand-Clear_1.jpg?v=1765768392&width=1024",
    category: "Toys",
    price: "$129",
    type: "collection",
  },
  {
    id: 12,
    name: "Pussy Paddle",
    url: "https://yonipleasurepalace.com/collections/glass-wands/products/the-pussy-paddle",
    image: "https://yonipleasurepalace.com/cdn/shop/products/ThePussyPaddleGlassPleasureWandLilacPurpleClear3.jpg?v=1764386849&width=1024",
    category: "Toys",
    price: "$144",
    type: "collection",
  },
  {
    id: 13,
    name: "Cervix Wand",
    url: "https://yonipleasurepalace.com/collections/glass-wands/products/the-cervix-serpent",
    image: "https://yonipleasurepalace.com/cdn/shop/products/CervixSerpentGlassPleasureWandClear12.jpg?v=1760674701&width=1024",
    category: "Toys",
    price: "$109",
    type: "collection",
  },
  {
    id: 14,
    name: "Octopussy Pleasure Wand",
    url: "https://yonipleasurepalace.com/collections/glass-wands/products/the-octopussy-r-glass-dildo-pleasure-wand-aqua",
    image: "https://yonipleasurepalace.com/cdn/shop/products/OctopussyGlassPleasureWandAqua3.jpg?v=1759977431&width=1024",
    category: "Toys",
    price: "$122",
    type: "collection",
  },
  {
    id: 15,
    name: "Dare Me",
    url: "https://www.honeybirdette.com/products/dare-me-game",
    image: "https://www.honeybirdette.com/cdn/shop/products/HB_DareMe_New_Close.jpg?v=1647815151&width=2480",
    category: "Games",
    price: "$50",
    type: "collection",
  },
  {
    id: 16,
    name: "Dice",
    url: "https://www.honeybirdette.com/products/game-on-dice",
    image: "https://www.honeybirdette.com/cdn/shop/products/HB_Dice_New3.jpg?v=1625729598&width=2480",
    category: "Games",
    price: "$30",
    type: "collection",
  },
  {
    id: 17,
    name: "Gold Crystal Whip Kit",
    url: "https://www.honeybirdette.com/products/hb-crystal-whip-kit-gold",
    image: "https://www.honeybirdette.com/cdn/shop/files/CrystalWhipKit_Trio.jpg?v=1763942020&width=2480",
    category: "Bondage",
    price: "$380",
    type: "wishlist",
  },
  {
    id: 18,
    name: "Crystal Cat Mask",
    url: "https://www.honeybirdette.com/products/hb-cat-mask-crystal",
    image: "https://www.honeybirdette.com/cdn/shop/files/Crystal_CatMask.jpg?v=1763942092&width=2480",
    category: "Accessories",
    price: "$180",
    type: "wishlist",
  },
  {
    id: 19,
    name: "Charlize Choker & Cuff Kit",
    url: "https://www.honeybirdette.com/products/charlize-choker-and-cuffs-red",
    image: "https://www.honeybirdette.com/cdn/shop/files/Charlize_Bondage_4.jpg?v=1766014909&width=2480",
    category: "Bondage",
    price: "$250",
    type: "wishlist",
  },
  {
    id: 20,
    name: "Leather Spreader Bar",
    url: "https://www.honeybirdette.com/products/fashion-fetish-leather-spreader-bar",
    image: "https://www.honeybirdette.com/cdn/shop/products/SpreaderBar.jpg?v=1740706061&width=2480",
    category: "Bondage",
    price: "$350",
    type: "wishlist",
  },
  {
    id: 21,
    name: "Chastity Gold Cuff Links",
    url: "https://www.honeybirdette.com/products/chastity-gold-bondage-cuffs",
    image: "https://www.honeybirdette.com/cdn/shop/products/HB_ChastityCuff.jpg?v=1639437193&width=2480",
    category: "Bondage",
    price: "$150",
    type: "wishlist",
  },
  {
    id: 22,
    name: "Lovehoney Butt Plug",
    url: "https://www.lovehoney.com.au/sex-toys/butt-plugs/jewelled-butt-plugs/p/lovehoney-jewelled-heart-metal-butt-plug-2.5-inch/a40367g73770.html",
    image: "https://media.lovehoneyassets.com/i/lovehoney/73770_a40367_silver_000?$primary$&h=1260&w=945&fmt=auto&qlt=80",
    category: "Anal Play",
    price: "$40",
    type: "collection",
  },
  {
    id: 23,
    name: "Dildo",
    url: "https://www.lovehoney.com.au/sex-toys/dildos/realistic-dildos/p/lifelike-lover-classic-realistic-dildo-6-inch/a22814g81744.html",
    image: "https://media.lovehoneyassets.com/i/lovehoney/81744_a22814_flesh-tan_000?$primary$&h=1260&w=945&fmt=auto&qlt=80",
    category: "Dildo",
    price: "$44",
    type: "collection",
  },
  {
    id: 24,
    name: "Glass Dildo",
    url: "https://www.lovehoney.com.au/sex-toys/dildos/glass-dildos/p/icicles-no-5-sapphire-spiral-glass-dildo-7-inch/a12036g12036.html",
    image: "https://media.lovehoneyassets.com/i/lovehoney/12036_a12036_blue_000?$primary$&h=1260&w=945&fmt=auto&qlt=80",
    category: "Dildo",
    price: "$60",
    type: "collection",
  },
  {
    id: 25,
    name: "We-Vibe Moxie",
    url: "https://www.lovehoney.com.au/sex-toys/vibrators/vibrating-knickers/p/we-vibe-x-lovehoney-moxie-app-and-remote-controlled-wearable-clitoral-vibrator/a48995g86960.html",
    image: "https://media.lovehoneyassets.com/i/lovehoney/86960_a48995_hot-pink_002?$primary$&h=1260&w=945&fmt=auto&qlt=80",
    category: "Vibrator",
    price: "",
    type: "collection",
  },
  {
    id: 26,
    name: "Gold Tassel Nipple Clamps",
    url: "https://www.honeybirdette.com/products/nipple-clamps-gold-tassel",
    image: "https://www.honeybirdette.com/cdn/shop/files/Nipple_Clamps_Box.jpg?v=1736306240&width=2480",
    category: "Bondage",
    price: "$40",
    type: "wishlist",
  },
] as const;

export const itemContent: Record<string, CategoryContent> = {
  Bondage: {
    playIdeas: [
      { title: "Slow Surrender", desc: "Blindfold your partner first. Let anticipation build before introducing any restraints. Take your time." },
      { title: "Power Play Evening", desc: "Establish roles early in the evening. Use restraints as a reward for following instructions." },
      { title: "Sensory Journey", desc: "Combine with ice, feathers, or warm oil. Restraint heightens every other sensation." },
      { title: "Photography Session", desc: "Take tasteful photos together. The rope or restraints become art on the body." },
    ],
    suggestions: [
      "Always establish a safe word before beginning — green/yellow/red works well",
      "Check in frequently, especially the first few times. Connection matters more than intensity",
      "Keep safety scissors nearby when using rope or anything that binds",
      "Start with wrists in front before progressing to more restrictive positions",
      "Two fingers should always fit between restraint and skin",
      "Incorporate praise and reassurance throughout — vulnerability needs to feel safe",
    ],
    questions: [
      "What does surrender mean to you tonight?",
      "Where do you want to feel my control most?",
      "Tell me a fantasy you've never shared before...",
      "How do you want to feel when we're finished?",
      "What word would you use if you want more?",
      "Do you trust me to take you somewhere new?",
    ],
  },
  Toys: {
    playIdeas: [
      { title: "Discovery Night", desc: "Take turns being the one in control of the toy. Switch every 10 minutes." },
      { title: "Tease & Denial", desc: "Use the toy to bring your partner close, then stop. Build anticipation over an extended session." },
      { title: "Guided Exploration", desc: "One partner gives verbal instructions only while the other uses the toy on themselves." },
      { title: "Morning Surprise", desc: "Wake your partner slowly with gentle stimulation. No rush, nowhere to be." },
    ],
    suggestions: [
      "Warm up with hands and mouth first — toys enhance, they don't replace intimacy",
      "Use plenty of high-quality lubricant for comfort and enhanced sensation",
      "Clean thoroughly before and after each use",
      "Start on lower settings and build gradually",
      "Pay attention to non-verbal cues — adjust pressure and speed accordingly",
      "Make eye contact. Stay present. The connection is what makes it memorable",
    ],
    questions: [
      "Show me where you want to feel this...",
      "Faster or slower? Tell me exactly what you need.",
      "What's a sensation you've been curious about?",
      "Do you want to watch, or close your eyes?",
      "How long do you want me to make you wait?",
      "What would make tonight unforgettable?",
    ],
  },
  Vibrator: {
    playIdeas: [
      { title: "Edge Play", desc: "See how many times you can bring each other to the edge before allowing release." },
      { title: "Hands-Free Challenge", desc: "Position the vibrator and use only words and eye contact to guide the experience." },
      { title: "Mutual Pleasure", desc: "Use during intimacy together — the vibrations enhance sensation for both." },
      { title: "Long Distance Tease", desc: "If app-controlled, take turns controlling from another room. Send voice notes." },
    ],
    suggestions: [
      "Explore different areas — not just the obvious ones. Inner thighs, nipples, neck...",
      "Pulsing patterns often feel more intense than constant vibration",
      "Use over underwear first for a gentler, teasing sensation",
      "Combine with oral for intensified experience",
      "Keep the charger accessible — nothing kills the mood like a dead battery",
      "Communicate about pressure — lighter is often more effective than harder",
    ],
    questions: [
      "Do you want to be teased or satisfied?",
      "What pattern feels best right now?",
      "Should I go slower... or do you want more?",
      "Tell me when you're getting close...",
      "Do you want to finish like this, or together?",
      "What are you thinking about right now?",
    ],
  },
  Accessories: {
    playIdeas: [
      { title: "Dress Up Night", desc: "Both partners prepare separately, then reveal. Set the scene with music and candlelight." },
      { title: "Role Play Scenario", desc: "Create characters and a story. The accessories become part of the narrative." },
      { title: "Photo Shoot", desc: "Take turns being photographer and model. Keep the best ones for yourselves." },
      { title: "Slow Reveal", desc: "Wear the accessory under regular clothes during dinner out. Only you two know." },
    ],
    suggestions: [
      "Take time to put it on together — the preparation is part of the experience",
      "Adjust for comfort first. If something pinches or pulls, fix it before continuing",
      "Compliment your partner when they wear something new. Confidence is attractive",
      "Store items properly to maintain their quality and longevity",
      "Consider the sensory experience — how does it feel against skin?",
      "Incorporate mirrors so you can both appreciate the visual",
    ],
    questions: [
      "How does wearing this make you feel?",
      "What do you want me to do when I see you like this?",
      "Is there something you've wanted to try but haven't asked?",
      "Do you feel powerful or vulnerable right now?",
      "What would your fantasy version of tonight look like?",
      "Tell me what you see when you look in the mirror...",
    ],
  },
  Ambiance: {
    playIdeas: [
      { title: "Spa Night In", desc: "Draw a bath together. Use candles, oils, and soft music. Let relaxation lead to intimacy." },
      { title: "Massage Exchange", desc: "Take turns giving 30-minute massages. No expectations — let things unfold naturally." },
      { title: "Candlelit Meditation", desc: "Sit facing each other by candlelight. Breathe together. Let connection build without words." },
      { title: "Scent Journey", desc: "Explore different scented oils on each other's skin. Associate new scents with new memories." },
    ],
    suggestions: [
      "Set the scene before your partner arrives — atmosphere shows intention",
      "Dim lighting is universally flattering and creates intimacy",
      "Music sets the pace — choose tempo that matches the energy you want",
      "Temperature matters — warm room, cool sheets, or the contrast of both",
      "Remove visual clutter — a tidy space allows mental space for connection",
      "Engage all five senses for a truly immersive experience",
    ],
    questions: [
      "What atmosphere makes you feel most relaxed and open?",
      "What scent reminds you of our best moments together?",
      "How can I make you feel more present right now?",
      "What music puts you in the mood?",
      "What does your ideal evening look like from start to finish?",
      "How do you want to feel when we blow out the candles?",
    ],
  },
  Games: {
    playIdeas: [
      { title: "Tournament Night", desc: "Play multiple rounds with escalating stakes. The overall winner gets a special reward." },
      { title: "Truth or Dare Remix", desc: "Use the game cards as a starting point, then add your own personal dares." },
      { title: "Strip Rules", desc: "Add a strip element to any game. Losing a round means losing an item." },
      { title: "Drinking Game Version", desc: "Combine with wine or cocktails. Alternate between sips and dares." },
    ],
    suggestions: [
      "Set the mood first — games are better with music and low lighting",
      "Don't take it too seriously — laughter is foreplay",
      "Use games to discover new things about each other",
      "If a dare feels too much, offer an alternative — comfort always comes first",
      "Mix competitive games with cooperative ones for variety",
      "End the game when the energy peaks — don't let it fizzle out",
    ],
    questions: [
      "What's the most daring thing you'd be willing to do tonight?",
      "What stakes would make this game more exciting for you?",
      "If you win, what do you want as your prize?",
      "What game from our childhood could we make naughty?",
      "Truth or dare — which one scares you more?",
      "What's something you've wanted to dare me to do?",
    ],
  },
};
