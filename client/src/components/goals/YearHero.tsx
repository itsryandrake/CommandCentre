import { useState, useRef, useEffect } from "react";
import type { GoalYear, UpdateGoalYearInput } from "@shared/types/goal";
import {
  GlassCard,
  GlassCardContent,
} from "@/components/ui/glass-card";
import { DollarSign } from "lucide-react";

interface YearHeroProps {
  year: number;
  yearData: GoalYear | null;
  onUpdate: (input: UpdateGoalYearInput) => Promise<void>;
}

function InlineEdit({
  value,
  placeholder,
  onSave,
  multiline,
  className,
}: {
  value: string;
  placeholder: string;
  onSave: (value: string) => void;
  multiline?: boolean;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(value);
  const ref = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setText(value);
  }, [value]);

  useEffect(() => {
    if (editing && ref.current) {
      ref.current.focus();
    }
  }, [editing]);

  const save = () => {
    setEditing(false);
    if (text !== value) {
      onSave(text);
    }
  };

  if (!editing) {
    return (
      <span
        className={`cursor-pointer hover:bg-muted/50 rounded px-1 -mx-1 transition-colors ${!value ? "text-muted-foreground/50 italic" : ""} ${className || ""}`}
        onClick={() => setEditing(true)}
      >
        {value || placeholder}
      </span>
    );
  }

  if (multiline) {
    return (
      <textarea
        ref={ref as React.RefObject<HTMLTextAreaElement>}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => { if (e.key === "Escape") { setText(value); setEditing(false); } }}
        placeholder={placeholder}
        rows={2}
        className={`w-full bg-background border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none ${className || ""}`}
      />
    );
  }

  return (
    <input
      ref={ref as React.RefObject<HTMLInputElement>}
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={save}
      onKeyDown={(e) => {
        if (e.key === "Enter") save();
        if (e.key === "Escape") { setText(value); setEditing(false); }
      }}
      placeholder={placeholder}
      className={`bg-background border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-ring ${className || ""}`}
    />
  );
}

function IncomeInput({ value, placeholder, onSave }: { value: number | undefined | null; placeholder: string; onSave: (v: number | null) => void }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(value ? String(value) : "");
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setText(value ? String(value) : "");
  }, [value]);

  useEffect(() => {
    if (editing && ref.current) ref.current.focus();
  }, [editing]);

  const save = () => {
    setEditing(false);
    const num = parseFloat(text);
    const newVal = isNaN(num) ? null : num;
    if (newVal !== (value ?? null)) {
      onSave(newVal);
    }
  };

  if (!editing) {
    return (
      <span
        className="cursor-pointer hover:bg-muted/50 rounded px-1 -mx-1 transition-colors tabular-nums"
        onClick={() => setEditing(true)}
      >
        {value ? `$${value.toLocaleString("en-AU")}` : <span className="text-muted-foreground/50 italic">{placeholder}</span>}
      </span>
    );
  }

  return (
    <input
      ref={ref}
      type="number"
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={save}
      onKeyDown={(e) => {
        if (e.key === "Enter") save();
        if (e.key === "Escape") { setText(value ? String(value) : ""); setEditing(false); }
      }}
      placeholder={placeholder}
      className="w-32 bg-background border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
    />
  );
}

export function YearHero({ year, yearData, onUpdate }: YearHeroProps) {
  return (
    <GlassCard>
      <GlassCardContent className="p-6 space-y-4">
        {/* Theme */}
        <div>
          <p className="text-sm text-muted-foreground mb-1">{year} is the year of...</p>
          <InlineEdit
            value={yearData?.theme || ""}
            placeholder="Set your year theme"
            onSave={(theme) => onUpdate({ theme })}
            className="text-2xl font-bold"
          />
        </div>

        {/* Purpose & Outcomes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Purpose</p>
            <InlineEdit
              value={yearData?.purpose || ""}
              placeholder="Why does this year matter?"
              onSave={(purpose) => onUpdate({ purpose })}
              multiline
              className="text-sm"
            />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Outcomes</p>
            <InlineEdit
              value={yearData?.outcomes || ""}
              placeholder="What does success look like?"
              onSave={(outcomes) => onUpdate({ outcomes })}
              multiline
              className="text-sm"
            />
          </div>
        </div>

        {/* Income Targets */}
        <div className="flex items-center gap-6 pt-2 border-t">
          <DollarSign className="size-4 text-muted-foreground shrink-0" />
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Monthly:</span>
            <IncomeInput
              value={yearData?.target_monthly_income}
              placeholder="Target"
              onSave={(target_monthly_income) => onUpdate({ target_monthly_income: target_monthly_income ?? undefined })}
            />
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Daily:</span>
            <IncomeInput
              value={yearData?.target_daily_income}
              placeholder="Target"
              onSave={(target_daily_income) => onUpdate({ target_daily_income: target_daily_income ?? undefined })}
            />
          </div>
        </div>
      </GlassCardContent>
    </GlassCard>
  );
}
