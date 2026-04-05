import { useState } from "react";
import { useUser } from "@/context/UserContext";
import { useLocation } from "wouter";
import { createChatConversation } from "@/lib/api";
import { Search, ArrowRight, ClipboardList, CreditCard, Lightbulb, Wrench, Star } from "lucide-react";

const suggestions = [
  { label: "Spring checklist", icon: ClipboardList },
  { label: "Cancel a subscription", icon: CreditCard },
  { label: "Recommended projects", icon: Lightbulb },
  { label: "Equipment tips", icon: Wrench },
  { label: "Recommended services", icon: Star },
];

export function DashboardGreeting() {
  const { user, userName } = useUser();
  const [, navigate] = useLocation();
  const [query, setQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const now = new Date();
  const dayName = now.toLocaleDateString("en-AU", { weekday: "long" });
  const monthName = now.toLocaleDateString("en-AU", { month: "long" });
  const day = now.getDate();

  const handleSubmit = async (text: string) => {
    if (!text.trim() || !user || isSubmitting) return;
    setIsSubmitting(true);
    const result = await createChatConversation(text.trim(), user);
    setIsSubmitting(false);
    if (result) {
      navigate(`/chat/${result.id}`);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit(query);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-4xl font-normal">
          Welcome back, {userName || "there"}.
        </h1>
        <p className="text-2xl font-normal text-foreground/80">
          It's {dayName}, {monthName} {day}. How can we help?
        </p>
      </div>

      <div className="relative">
        <div className="flex items-center rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm px-4 py-3 shadow-sm transition-colors focus-within:border-primary/30">
          <Search className="size-5 text-muted-foreground mr-3 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask a question, find a file, or make a request"
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-base"
            disabled={isSubmitting}
          />
          <button
            onClick={() => handleSubmit(query)}
            disabled={!query.trim() || isSubmitting}
            className="ml-2 p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors disabled:opacity-30"
          >
            <ArrowRight className="size-5" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Suggestions</p>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s.label}
              onClick={() => handleSubmit(s.label)}
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-full border border-border/50 bg-card/30 px-4 py-2 text-sm text-foreground/80 hover:bg-card hover:border-border transition-colors disabled:opacity-50"
            >
              <s.icon className="size-3.5" />
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
