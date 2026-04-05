import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import type { HealthDateFilter as FilterType } from "@shared/types/health";

interface HealthDateFilterProps {
  value: FilterType;
  onChange: (filter: FilterType) => void;
  presets?: ("7d" | "30d" | "90d" | "custom")[];
}

const PRESET_LABELS = {
  "7d": "7 Days",
  "30d": "30 Days",
  "90d": "90 Days",
  custom: "Custom",
} as const;

export function HealthDateFilter({
  value,
  onChange,
  presets = ["7d", "30d", "90d"],
}: HealthDateFilterProps) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [tempRange, setTempRange] = useState<{ start?: Date; end?: Date }>({});

  const handlePresetClick = (preset: "7d" | "30d" | "90d" | "custom") => {
    if (preset === "custom") {
      setShowCalendar(true);
      return;
    }

    const days = parseInt(preset);
    onChange({ type: "days", days });
    setShowCalendar(false);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    if (!tempRange.start) {
      setTempRange({ start: date });
    } else if (!tempRange.end) {
      const start = tempRange.start < date ? tempRange.start : date;
      const end = tempRange.start < date ? date : tempRange.start;
      setTempRange({});
      onChange({
        type: "range",
        startDate: start.toISOString().split("T")[0],
        endDate: end.toISOString().split("T")[0],
      });
      setShowCalendar(false);
    }
  };

  const isActive = (preset: "7d" | "30d" | "90d" | "custom") => {
    if (preset === "custom") {
      return value.type === "range";
    }
    return value.type === "days" && value.days === parseInt(preset);
  };

  const getDisplayText = () => {
    if (value.type === "range" && value.startDate && value.endDate) {
      return `${value.startDate} to ${value.endDate}`;
    }
    return null;
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1 rounded-lg border bg-background p-1">
        {presets.map((preset) => (
          <Button
            key={preset}
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 px-3 text-sm",
              isActive(preset) && "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
            onClick={() => handlePresetClick(preset)}
          >
            {preset === "custom" ? (
              <CalendarIcon className="size-4 mr-1" />
            ) : null}
            {PRESET_LABELS[preset]}
          </Button>
        ))}
      </div>

      {value.type === "range" && getDisplayText() && (
        <span className="text-sm text-muted-foreground">
          {getDisplayText()}
        </span>
      )}

      {showCalendar && (
        <div className="absolute z-50 mt-2 top-full">
          <div className="rounded-lg border bg-background shadow-lg p-3">
            <p className="text-sm text-muted-foreground mb-2">
              {tempRange.start ? "Select end date" : "Select start date"}
            </p>
            <Calendar
              mode="single"
              selected={tempRange.end || tempRange.start}
              onSelect={handleDateSelect}
              disabled={(date) => date > new Date()}
            />
            <div className="flex justify-end mt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowCalendar(false);
                  setTempRange({});
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
