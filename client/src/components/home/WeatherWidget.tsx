import { Cloud, Droplets, Wind } from "lucide-react";
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from "@/components/ui/glass-card";
import { AnimatedWeatherIcon } from "./AnimatedWeatherIcon";
import type { WeatherData } from "@shared/types/weather";

interface WeatherWidgetProps {
  weather: WeatherData | null;
  isLoading?: boolean;
}

export function WeatherWidget({ weather, isLoading }: WeatherWidgetProps) {
  if (isLoading) {
    return (
      <GlassCard>
        <GlassCardHeader>
          <GlassCardTitle>Weather</GlassCardTitle>
        </GlassCardHeader>
        <GlassCardContent>
          <div className="flex items-center justify-center h-20">
            <div className="animate-pulse text-muted-foreground">Loading weather...</div>
          </div>
        </GlassCardContent>
      </GlassCard>
    );
  }

  if (!weather) {
    return (
      <GlassCard>
        <GlassCardHeader>
          <GlassCardTitle>Weather</GlassCardTitle>
        </GlassCardHeader>
        <GlassCardContent>
          <div className="flex flex-col items-center justify-center h-20 text-muted-foreground text-center">
            <Cloud className="size-8 mb-2 opacity-50" />
            <p className="text-sm">Weather data unavailable</p>
            <p className="text-xs opacity-70">API key may need activation</p>
          </div>
        </GlassCardContent>
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <GlassCardHeader>
        <GlassCardTitle>{weather.location} Weather</GlassCardTitle>
      </GlassCardHeader>
      <GlassCardContent className="space-y-4">
        {/* Current Weather */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AnimatedWeatherIcon condition={weather.current.condition} size={40} />
            <div>
              <div className="text-3xl font-bold stat-number">{weather.current.temp}°C</div>
              <div className="text-sm text-muted-foreground">
                Feels like {weather.current.feelsLike}° · {weather.current.condition}
              </div>
            </div>
          </div>
          <div className="text-right space-y-1 text-sm">
            <div className="flex items-center justify-end gap-1.5 text-muted-foreground">
              <Droplets className="size-3.5" />
              <span>{weather.current.humidity}%</span>
            </div>
            <div className="flex items-center justify-end gap-1.5 text-muted-foreground">
              <Wind className="size-3.5" />
              <span>{weather.current.windSpeed} km/h {weather.current.windDirection}</span>
            </div>
          </div>
        </div>

        {/* Forecast */}
        <div className="flex gap-2 pt-2 border-t border-border/50">
          {weather.forecast.map((day) => (
            <div
              key={day.date}
              className="flex-1 text-center p-2 rounded-lg bg-secondary/50"
            >
              <div className="text-xs text-muted-foreground mb-1">{day.dayName}</div>
              <div className="flex justify-center mb-1">
                <AnimatedWeatherIcon condition={day.condition} size={24} />
              </div>
              <div className="text-sm font-medium">{day.high}°</div>
              <div className="text-xs text-muted-foreground">{day.low}°</div>
              {day.chanceOfRain > 0 && (
                <div className="text-xs text-primary mt-1">{day.chanceOfRain}%</div>
              )}
            </div>
          ))}
        </div>
      </GlassCardContent>
    </GlassCard>
  );
}
