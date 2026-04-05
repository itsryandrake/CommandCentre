import { useState, useEffect, useCallback } from "react";
import type { AiConversation, AiConversationWithMessages } from "@shared/types/chat";
import {
  fetchConversations,
  fetchConversation,
  createChatConversation,
  sendChatMessage,
  deleteChatConversation,
} from "@/lib/api";

export function useConversations() {
  const [conversations, setConversations] = useState<AiConversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    const data = await fetchConversations();
    setConversations(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async (id: string) => {
    const success = await deleteChatConversation(id);
    if (success) {
      setConversations((prev) => prev.filter((c) => c.id !== id));
    }
    return success;
  };

  return { conversations, isLoading, reload: load, remove };
}

export function useConversation(id: string | undefined) {
  const [conversation, setConversation] = useState<AiConversationWithMessages | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    const data = await fetchConversation(id);
    setConversation(data);
    setIsLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const sendMessage = async (message: string, user: string) => {
    if (!id) return null;
    setIsSending(true);
    const updated = await sendChatMessage(id, message, user);
    if (updated) {
      setConversation(updated);
    }
    setIsSending(false);
    return updated;
  };

  return { conversation, isLoading, isSending, sendMessage, reload: load };
}
