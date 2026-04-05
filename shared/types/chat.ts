export interface AiConversation {
  id: string;
  title: string;
  askedBy: "ryan" | "emily";
  createdAt: string;
  updatedAt: string;
}

export interface AiMessage {
  id: string;
  conversationId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface AiConversationWithMessages extends AiConversation {
  messages: AiMessage[];
}

export interface CreateChatInput {
  message: string;
  user: "ryan" | "emily";
}

export interface SendMessageInput {
  message: string;
  user: "ryan" | "emily";
}
