import { Router, Request, Response } from "express";
import {
  listConversations,
  getConversation,
  createConversation,
  addMessage,
  getConversationMessages,
  deleteConversation,
} from "../db/chat.ts";

const router = Router();

const SYSTEM_PROMPT = `You are a helpful family assistant for the Drake family (Ryan and Emily) in Brisbane, Australia. You help with home management, budgeting, equipment maintenance, property questions, and general household queries.

Keep responses practical, friendly, and concise. Use Australian English spelling (colour, organise, centre, etc.). When discussing finances, use AUD ($). If you don't have specific data about their home or finances, provide general guidance and suggest they check their records.`;

async function callOpenAI(messages: { role: string; content: string }[]): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not configured");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      max_tokens: 2000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${err}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";
}

// GET /api/chat/conversations - List all conversations
router.get("/conversations", async (_req: Request, res: Response) => {
  try {
    const conversations = await listConversations();
    res.json(conversations);
  } catch (error) {
    console.error("[Chat] Error listing conversations:", error);
    res.status(500).json({ error: "Failed to list conversations" });
  }
});

// GET /api/chat/conversations/:id - Get conversation with messages
router.get("/conversations/:id", async (req: Request, res: Response) => {
  try {
    const conversation = await getConversation(req.params.id);
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }
    res.json(conversation);
  } catch (error) {
    console.error("[Chat] Error getting conversation:", error);
    res.status(500).json({ error: "Failed to get conversation" });
  }
});

// POST /api/chat/conversations - Create new conversation and get AI response
router.post("/conversations", async (req: Request, res: Response) => {
  try {
    const { message, user } = req.body;
    if (!message || !user) {
      return res.status(400).json({ error: "message and user are required" });
    }

    // Use first 80 chars of the message as the title
    const title = message.length > 80 ? message.substring(0, 77) + "..." : message;

    const conversation = await createConversation(title, user);
    await addMessage(conversation.id, "user", message);

    // Call OpenAI
    const aiResponse = await callOpenAI([{ role: "user", content: message }]);
    await addMessage(conversation.id, "assistant", aiResponse);

    // Return the full conversation
    const full = await getConversation(conversation.id);
    res.status(201).json(full);
  } catch (error) {
    console.error("[Chat] Error creating conversation:", error);
    res.status(500).json({ error: "Failed to create conversation" });
  }
});

// POST /api/chat/conversations/:id/messages - Send message in existing conversation
router.post("/conversations/:id/messages", async (req: Request, res: Response) => {
  try {
    const { message, user } = req.body;
    if (!message) {
      return res.status(400).json({ error: "message is required" });
    }

    const conversation = await getConversation(req.params.id);
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    await addMessage(req.params.id, "user", message);

    // Build context from last 20 messages
    const allMessages = await getConversationMessages(req.params.id);
    const recentMessages = allMessages.slice(-20).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const aiResponse = await callOpenAI(recentMessages);
    await addMessage(req.params.id, "assistant", aiResponse);

    const full = await getConversation(req.params.id);
    res.json(full);
  } catch (error) {
    console.error("[Chat] Error sending message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// DELETE /api/chat/conversations/:id - Delete conversation
router.delete("/conversations/:id", async (req: Request, res: Response) => {
  try {
    const success = await deleteConversation(req.params.id);
    if (!success) {
      return res.status(404).json({ error: "Conversation not found" });
    }
    res.json({ success: true });
  } catch (error) {
    console.error("[Chat] Error deleting conversation:", error);
    res.status(500).json({ error: "Failed to delete conversation" });
  }
});

export default router;
