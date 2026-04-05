import { useState, useRef, useEffect } from "react";

interface CategoryIntentionProps {
  year: number;
  category: string;
  intention: string;
  onSave: (category: string, intention: string) => Promise<void>;
}

export function CategoryIntention({ year, category, intention, onSave }: CategoryIntentionProps) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(intention);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setText(intention);
  }, [intention]);

  useEffect(() => {
    if (editing && ref.current) ref.current.focus();
  }, [editing]);

  const save = () => {
    setEditing(false);
    if (text !== intention) {
      onSave(category, text);
    }
  };

  return (
    <div className="mb-4 text-sm text-muted-foreground">
      <span>In {year}, I will... </span>
      {editing ? (
        <input
          ref={ref}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") { setText(intention); setEditing(false); }
          }}
          placeholder="Set your intention for this category"
          className="inline-block w-64 bg-background border rounded px-2 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        />
      ) : (
        <span
          className={`cursor-pointer hover:bg-muted/50 rounded px-1 -mx-1 transition-colors italic ${!intention ? "text-muted-foreground/50" : ""}`}
          onClick={() => setEditing(true)}
        >
          {intention || "set an intention..."}
        </span>
      )}
    </div>
  );
}
