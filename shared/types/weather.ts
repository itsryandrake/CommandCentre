export interface WeatherCurrent {
  temp: number;
  feelsLike: number;
  humidity: number;
  condition: string;
  icon: string;
  windSpeed: number;
  windDirection: string;
}

export interface WeatherForecast {
  date: string;
  dayName: string;
  high: number;
  low: number;
  condition: string;
  icon: string;
  chanceOfRain: number;
}

export interface WeatherData {
  location: string;
  current: WeatherCurrent;
  forecast: WeatherForecast[];
  lastUpdated: string;
}
