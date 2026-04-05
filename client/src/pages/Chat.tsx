import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useConversations } from "@/hooks/useChat";
import { useUser } from "@/context/UserContext";
import { useLocation } from "wouter";
import { createChatConversation } from "@/lib/api";
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card";
import { MessageSquare, Trash2, Search, ArrowRight, Clock } from "lucide-react";
import { useState } from "react";

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-AU", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("en-AU", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function Chat() {
  const { conversations, isLoading, remove } = useConversations();
  const { user } = useUser();
  const [, navigate] = useLocation();
  const [query, setQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    <DashboardLayout title="AI Chat">
      <div className="space-y-8">
        <div className="space-y-1">
          <h1 className="text-4xl font-normal">AI Assistant</h1>
          <p className="text-muted-foreground">Ask questions and get answers powered by AI. All conversations are shared.</p>
        </div>

        {/* Ask a new question */}
        <div className="relative">
          <div className="flex items-center rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm px-4 py-3 shadow-sm transition-colors focus-within:border-primary/30">
            <Search className="size-5 text-muted-foreground mr-3 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask a new question..."
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
          {isSubmitting && (
            <p className="text-sm text-muted-foreground mt-2">Thinking...</p>
          )}
        </div>

        {/* Conversation history */}
        <div className="space-y-3">
          <h2 className="text-lg font-medium">History</h2>
          {isLoading ? (
            <p className="text-muted-foreground text-sm">Loading conversations...</p>
          ) : conversations.length === 0 ? (
            <GlassCard>
              <GlassCardContent className="py-12">
                <div className="flex flex-col items-center text-center">
                  <MessageSquare className="size-10 text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">No conversations yet. Ask your first question above.</p>
                </div>
              </GlassCardContent>
            </GlassCard>
          ) : (
            <div className="space-y-2">
              {conversations.map((conv) => (
                <GlassCard
                  key={conv.id}
                  className="cursor-pointer hover:bg-card/80 transition-colors"
                >
                  <GlassCardContent className="py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div
                        className="flex-1 min-w-0"
                        onClick={() => navigate(`/chat/${conv.id}`)}
                      >
                        <h3 className="font-medium truncate">{conv.title}</h3>
                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="size-3.5" />
                            {formatDate(conv.createdAt)} at {formatTime(conv.createdAt)}
                          </span>
                          <span className="capitalize">by {conv.askedBy}</span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          remove(conv.id);
                        }}
                        className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </GlassCardContent>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
