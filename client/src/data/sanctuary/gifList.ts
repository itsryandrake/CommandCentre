// Visual Inspiration GIF List - Typed wrapper for gif-list.json

export type GifCategory =
  | 'Anal Sex'
  | 'Blowjobs & Hand Jobs'
  | 'Bondage'
  | 'Hardcore'
  | 'Oral Sex'
  | 'Penetration'
  | 'Pussy Play'
  | 'Squirting';

export interface GifEntry {
  readonly path: string;
  readonly name: string;
  readonly category: GifCategory;
}

export interface GifList {
  readonly gifs: readonly GifEntry[];
}

export const gifCategories: readonly GifCategory[] = [
  'Anal Sex',
  'Blowjobs & Hand Jobs',
  'Bondage',
  'Hardcore',
  'Oral Sex',
  'Penetration',
  'Pussy Play',
  'Squirting',
] as const;

// Helper to load and type the GIF data from a JSON source
export function parseGifList(data: { gifs: Array<{ path: string; name: string; category: string }> }): GifList {
  return data as GifList;
}

// Helper to get GIFs filtered by category
export function getGifsByCategory(gifs: readonly GifEntry[], category: GifCategory): readonly GifEntry[] {
  return gifs.filter(gif => gif.category === category);
}

// Helper to get a random GIF from a list
export function getRandomGif(gifs: readonly GifEntry[]): GifEntry | undefined {
  if (gifs.length === 0) return undefined;
  return gifs[Math.floor(Math.random() * gifs.length)];
}
