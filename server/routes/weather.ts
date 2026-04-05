import { Router, Request, Response } from "express";
import type { WeatherData, WeatherForecast } from "../../shared/types/weather.ts";

const router = Router();

// Cache for weather data (10 minute TTL)
let weatherCache: { data: WeatherData; timestamp: number } | null = null;
const CACHE_TTL = 10 * 60 * 1000;

// Brisbane coordinates
const BRISBANE_LAT = -27.4698;
const BRISBANE_LON = 153.0251;

function getConditionFromCode(code: number): string {
  if (code === 800) return "Clear";
  if (code >= 801 && code <= 802) return "Partly Cloudy";
  if (code >= 803 && code <= 804) return "Cloudy";
  if (code >= 500 && code <= 531) return "Rain";
  if (code >= 300 && code <= 321) return "Drizzle";
  if (code >= 200 && code <= 232) return "Thunderstorm";
  if (code >= 600 && code <= 622) return "Snow";
  if (code >= 701 && code <= 781) return "Fog";
  return "Unknown";
}

function getWindDirection(degrees: number): string {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

function getDayName(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
  return date.toLocaleDateString("en-AU", { weekday: "short" });
}

router.get("/", async (_req: Request, res: Response) => {
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    return res.status(503).json({
      error: "Weather service not configured",
      message: "OPENWEATHER_API_KEY not set",
    });
  }

  // Check cache
  if (weatherCache && Date.now() - weatherCache.timestamp < CACHE_TTL) {
    return res.json(weatherCache.data);
  }

  try {
    const [currentRes, forecastRes] = await Promise.all([
      fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${BRISBANE_LAT}&lon=${BRISBANE_LON}&units=metric&appid=${apiKey}`
      ),
      fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${BRISBANE_LAT}&lon=${BRISBANE_LON}&units=metric&appid=${apiKey}`
      ),
    ]);

    if (!currentRes.ok || !forecastRes.ok) {
      const errorData = await currentRes.json().catch(() => ({}));
      if (currentRes.status === 401) {
        return res.status(503).json({
          error: "Weather API key not activated",
          message: "New OpenWeatherMap API keys take 2-4 hours to activate",
        });
      }
      throw new Error(errorData.message || "Failed to fetch weather data");
    }

    const currentData = await currentRes.json();
    const forecastData = await forecastRes.json();

    // Process forecast into daily data (take midday reading for each day)
    const dailyMap = new Map<string, typeof forecastData.list[0]>();
    for (const item of forecastData.list) {
      const date = item.dt_txt.split(" ")[0];
      const hour = parseInt(item.dt_txt.split(" ")[1].split(":")[0]);
      if (!dailyMap.has(date) || hour === 12) {
        dailyMap.set(date, item);
      }
    }

    const forecast: WeatherForecast[] = Array.from(dailyMap.entries())
      .slice(0, 3)
      .map(([date, item]) => ({
        date,
        dayName: getDayName(date),
        high: Math.round(item.main.temp_max),
        low: Math.round(item.main.temp_min),
        condition: getConditionFromCode(item.weather[0].id),
        icon: item.weather[0].icon,
        chanceOfRain: Math.round((item.pop || 0) * 100),
      }));

    const weatherData: WeatherData = {
      location: "Brisbane",
      current: {
        temp: Math.round(currentData.main.temp),
        feelsLike: Math.round(currentData.main.feels_like),
        humidity: currentData.main.humidity,
        condition: getConditionFromCode(currentData.weather[0].id),
        icon: currentData.weather[0].icon,
        windSpeed: Math.round(currentData.wind.speed * 3.6),
        windDirection: getWindDirection(currentData.wind.deg),
      },
      forecast,
      lastUpdated: new Date().toISOString(),
    };

    weatherCache = { data: weatherData, timestamp: Date.now() };
    res.json(weatherData);
  } catch (error) {
    console.error("[Weather] Error fetching weather:", error);
    res.status(500).json({
      error: "Failed to fetch weather data",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
