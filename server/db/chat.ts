import { getSupabase } from "./supabase.ts";
import type { AiConversation, AiMessage, AiConversationWithMessages } from "../../shared/types/chat.ts";

function dbToConversation(row: any): AiConversation {
  return {
    id: row.id,
    title: row.title,
    askedBy: row.asked_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function dbToMessage(row: any): AiMessage {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    role: row.role,
    content: row.content,
    createdAt: row.created_at,
  };
}

export async function listConversations(): Promise<AiConversation[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("ai_conversations")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data || []).map(dbToConversation);
}

export async function getConversation(id: string): Promise<AiConversationWithMessages | null> {
  const supabase = getSupabase();

  const { data: conv, error: convError } = await supabase
    .from("ai_conversations")
    .select("*")
    .eq("id", id)
    .single();

  if (convError || !conv) return null;

  const { data: messages, error: msgError } = await supabase
    .from("ai_messages")
    .select("*")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true });

  if (msgError) throw msgError;

  return {
    ...dbToConversation(conv),
    messages: (messages || []).map(dbToMessage),
  };
}

export async function createConversation(title: string, askedBy: string): Promise<AiConversation> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("ai_conversations")
    .insert({ title, asked_by: askedBy })
    .select()
    .single();

  if (error) throw error;
  return dbToConversation(data);
}

export async function addMessage(
  conversationId: string,
  role: "user" | "assistant",
  content: string
): Promise<AiMessage> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("ai_messages")
    .insert({ conversation_id: conversationId, role, content })
    .select()
    .single();

  if (error) throw error;

  // Update conversation's updated_at
  await supabase
    .from("ai_conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId);

  return dbToMessage(data);
}

export async function getConversationMessages(conversationId: string): Promise<AiMessage[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("ai_messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data || []).map(dbToMessage);
}

export async function deleteConversation(id: string): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("ai_conversations")
    .delete()
    .eq("id", id);

  return !error;
}
