export interface TideExtreme {
  type: "High" | "Low";
  height: number;       // metres
  timestamp: string;    // ISO string
  time: string;         // formatted time (e.g. "2:34 PM")
}

export interface TideData {
  station: string;
  extremes: TideExtreme[];
  lastUpdated: string;
}
