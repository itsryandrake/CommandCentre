import { Calendar, Clock, MapPin } from "lucide-react";
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from "@/components/ui/glass-card";
import type { CalendarEvent } from "@shared/types/calendar";

interface CalendarWidgetProps {
  events: CalendarEvent[];
  isLoading?: boolean;
}

function formatEventTime(start: string, end: string, isAllDay: boolean): string {
  if (isAllDay) return "All day";

  const startDate = new Date(start);
  const endDate = new Date(end);

  const timeOpts: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Australia/Brisbane",
  };

  const startStr = startDate.toLocaleTimeString("en-AU", timeOpts);
  const endStr = endDate.toLocaleTimeString("en-AU", timeOpts);

  return `${startStr} – ${endStr}`;
}

export function CalendarWidget({ events, isLoading }: CalendarWidgetProps) {
  if (isLoading) {
    return (
      <GlassCard>
        <GlassCardHeader>
          <GlassCardTitle>Today's Schedule</GlassCardTitle>
        </GlassCardHeader>
        <GlassCardContent>
          <div className="flex items-center justify-center h-20">
            <div className="animate-pulse text-muted-foreground">Loading calendar...</div>
          </div>
        </GlassCardContent>
      </GlassCard>
    );
  }

  const timedEvents = events.filter((e) => !e.isAllDay);
  const allDayEvents = events.filter((e) => e.isAllDay);

  return (
    <GlassCard>
      <GlassCardHeader>
        <GlassCardTitle>Today's Schedule</GlassCardTitle>
        <span className="text-xs text-muted-foreground">
          {events.length} event{events.length !== 1 ? "s" : ""}
        </span>
      </GlassCardHeader>
      <GlassCardContent>
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-20 text-muted-foreground text-center">
            <Calendar className="size-8 mb-2 opacity-50" />
            <p className="text-sm">No events today</p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* All-day events */}
            {allDayEvents.map((event) => (
              <div
                key={event.id}
                className="p-2 rounded-lg bg-primary/10 border border-primary/20"
              >
                <div className="text-sm font-medium">{event.title}</div>
                <div className="text-xs text-muted-foreground">All day</div>
              </div>
            ))}

            {/* Timed events */}
            {timedEvents.map((event) => (
              <div
                key={event.id}
                className="flex gap-3 p-2 rounded-lg bg-secondary/50"
              >
                <div className="flex flex-col items-center pt-0.5">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <div className="w-px flex-1 bg-border/50 mt-1" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{event.title}</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <Clock className="size-3" />
                    <span>{formatEventTime(event.start, event.end, event.isAllDay)}</span>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                      <MapPin className="size-3" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCardContent>
    </GlassCard>
  );
}
