import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useConversation } from "@/hooks/useChat";
import { useUser } from "@/context/UserContext";
import { useRoute, useLocation } from "wouter";
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card";
import { ArrowLeft, Send, Clock } from "lucide-react";
import { useState } from "react";

function formatTimestamp(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-AU", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }) + " " + date.toLocaleTimeString("en-AU", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function ChatConversation() {
  const [, params] = useRoute("/chat/:id");
  const [, navigate] = useLocation();
  const { user } = useUser();
  const { conversation, isLoading, isSending, sendMessage } = useConversation(params?.id);
  const [followUp, setFollowUp] = useState("");

  const handleSend = async () => {
    if (!followUp.trim() || !user) return;
    await sendMessage(followUp.trim(), user);
    setFollowUp("");
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Chat">
        <p className="text-muted-foreground">Loading...</p>
      </DashboardLayout>
    );
  }

  if (!conversation) {
    return (
      <DashboardLayout title="Chat">
        <p className="text-muted-foreground">Conversation not found.</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Chat">
      <div className="space-y-8 max-w-3xl">
        {/* Back button */}
        <button
          onClick={() => navigate("/chat")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          <span className="text-sm">Back to history</span>
        </button>

        {/* Title */}
        <div>
          <h1 className="text-3xl font-normal leading-tight">{conversation.title}</h1>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
            <Clock className="size-3.5" />
            {formatTimestamp(conversation.createdAt)}
          </p>
        </div>

        {/* Messages */}
        <div className="space-y-6">
          {conversation.messages.map((msg) => (
            <div key={msg.id}>
              {msg.role === "user" ? (
                <div className="flex items-start gap-3">
                  <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium shrink-0 mt-0.5">
                    {msg.role === "user" ? (conversation.askedBy === "ryan" ? "RD" : "ED") : "AI"}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground capitalize mb-1">{conversation.askedBy}</p>
                    <p className="text-foreground">{msg.content}</p>
                  </div>
                </div>
              ) : (
                <div className="pl-11">
                  <div className="prose prose-sm max-w-none text-foreground/90 whitespace-pre-wrap">
                    {msg.content}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {isSending && (
          <p className="text-sm text-muted-foreground pl-11">Thinking...</p>
        )}

        {/* Follow-up input */}
        <div className="flex items-center rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm px-4 py-3 shadow-sm transition-colors focus-within:border-primary/30">
          <input
            type="text"
            value={followUp}
            onChange={(e) => setFollowUp(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask a follow-up question..."
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-base"
            disabled={isSending}
          />
          <button
            onClick={handleSend}
            disabled={!followUp.trim() || isSending}
            className="ml-2 p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors disabled:opacity-30"
          >
            <Send className="size-5" />
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
