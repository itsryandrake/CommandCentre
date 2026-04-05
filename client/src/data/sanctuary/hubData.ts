// Hub / Dashboard Data - Hub cards, desires, boundaries, and safe words

export interface HubCard {
  readonly icon: string;
  readonly label: string;
  readonly desc: string;
  readonly href: string;
}

export const hubCards: readonly HubCard[] = [
  {
    icon: "👤",
    label: "Partner Profiles",
    desc: "Review desires & blueprints",
    href: "/sanctuary/profiles",
  },
  {
    icon: "🎁",
    label: "Our Collection",
    desc: "Browse toys & treasures",
    href: "/sanctuary#collection",
  },
  {
    icon: "✨",
    label: "Date Night",
    desc: "Get inspired for tonight",
    href: "/sanctuary/date-night",
  },
  {
    icon: "🔥",
    label: "Fun Positions",
    desc: "Try something new",
    href: "/sanctuary/positions",
  },
  {
    icon: "🃏",
    label: "Dare Me",
    desc: "Play the card game",
    href: "/sanctuary/dare-me",
  },
  {
    icon: "🎵",
    label: "Sensual Seduction",
    desc: "Set the mood with music",
    href: "/sanctuary/music",
  },
] as const;

export interface DesireCategory {
  readonly title: string;
  readonly items: readonly string[];
  readonly emptyText?: string;
}

export const desireCategories: readonly DesireCategory[] = [
  {
    title: "TRIED & LOVED",
    items: [
      "Power exchange dynamics",
      "Shibari & rope bondage",
      "D/s rituals & protocols",
      "Sensory deprivation",
      "Role play scenarios",
      "Costume & dress-up",
    ],
  },
  {
    title: "WANT TO TRY",
    items: [
      "Tantra practices",
      "Public teasing",
      "Extended tease & denial",
    ],
    emptyText: "Add more together...",
  },
  {
    title: "CURIOUS ABOUT",
    items: [
      "Temperature play",
      "Wax play",
      "Light impact",
    ],
    emptyText: "Discuss and add...",
  },
  {
    title: "BOUNDARIES",
    items: [],
    emptyText: "Add hard limits here... These are respected absolutely",
  },
] as const;

export interface SafeWord {
  readonly word: string;
  readonly colour: 'green' | 'yellow' | 'red';
  readonly meaning: string;
}

export const safeWords: readonly SafeWord[] = [
  {
    word: "VERT (GREEN)",
    colour: "green",
    meaning: "All good, keep going",
  },
  {
    word: "DOUCEMENT (YELLOW)",
    colour: "yellow",
    meaning: "Slow down, check in",
  },
  {
    word: "STOP (RED)",
    colour: "red",
    meaning: "Stop immediately",
  },
] as const;
