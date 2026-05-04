import type {
  HealthSummary,
  WhoopRecovery,
  WhoopSleepData,
  EightSleepData,
  RenphoData,
  AppleHealthData,
} from "@shared/types/health";
import type { WeatherData } from "@shared/types/weather";
import type { TideData } from "@shared/types/tides";
import type { CalendarResponse } from "@shared/types/calendar";
import type { Reminder, CreateReminderInput } from "@shared/types/reminder";
import type { Goal, CreateGoalInput, UpdateGoalInput, GoalYear, UpdateGoalYearInput, GoalYearIntention, GoalReview, GoalQuarter } from "@shared/types/goal";
import type {
  Contact,
  Interaction,
  CreateContactInput,
  CreateInteractionInput,
  CrmStats,
} from "@shared/types/crm";
import type { VisionBoardItem, Category } from "@shared/types/visionBoard";
import type { DreamHomeImage, DreamHomeScrapeJob, DreamHomeTagCount } from "@shared/types/dreamHome";
import type { WishlistItem, UpdateWishlistInput } from "@shared/types/dreamHomeWishlist";
import type { AiConversation, AiConversationWithMessages } from "@shared/types/chat";
import type { Equipment, CreateEquipmentInput, UpdateEquipmentInput, EquipmentNote, ScrapedProductInfo } from "@shared/types/equipment";
import type { Asset, Loan, CreateAssetInput, UpdateAssetInput, CreateLoanInput, UpdateLoanInput } from "@shared/types/finance";
import type { ShoppingItem, CreateShoppingItemInput } from "@shared/types/shopping";
import type { Task, CreateTaskInput, UpdateTaskInput, TaskAttachment, CreateAttachmentInput } from "@shared/types/task";
import type { LoyaltyProgram } from "@shared/types/loyalty";
import type { WardrobeItem, CreateWardrobeInput, UpdateWardrobeInput } from "@shared/types/wardrobe";
import type { HouseholdDocument } from "@shared/types/document";
import type { LifeScript, LifeScriptVersion, UpdateLifeScriptInput } from "@shared/types/lifeScript";
import type {
  Investment, InvestmentWithDetails, CreateInvestmentInput, UpdateInvestmentInput,
  InvestmentPayment, CreatePaymentInput,
  InvestmentDocument, CreateDocumentInput as CreateInvDocInput,
  InvestmentTask, CreateTaskInput as CreateInvTaskInput,
} from "@shared/types/investment";
import type { Restaurant, CreateRestaurantInput, UpdateRestaurantInput, ScrapedRestaurantInfo, GoogleReview } from "@shared/types/restaurant";

export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = "APIError";
  }
}

// =============================================================================
// Health & Wellness API Functions
// =============================================================================

export async function fetchHealthSummary(): Promise<HealthSummary> {
  try {
    const response = await fetch("/api/health/summary");
    if (response.ok) {
      return response.json();
    }
  } catch {
    // Fall through to empty summary
  }

  return {
    whoop: null,
    whoopSleep: null,
    eightSleep: null,
    renpho: null,
    appleHealth: null,
    lastUpdated: new Date().toISOString(),
  };
}

export async function fetchWhoopStatus(): Promise<{ connected: boolean } | null> {
  try {
    const response = await fetch("/api/health/whoop/status");
    if (response.ok) {
      return response.json();
    }
  } catch {
    // Service not available
  }
  return null;
}

export async function fetchWhoopRecovery(): Promise<WhoopRecovery | null> {
  try {
    const response = await fetch("/api/health/whoop/recovery");
    if (response.ok) {
      return response.json();
    }
  } catch {
    // Service not available
  }
  return null;
}

export async function fetchWhoopSleep(): Promise<WhoopSleepData | null> {
  try {
    const response = await fetch("/api/health/whoop/sleep");
    if (response.ok) {
      return response.json();
    }
  } catch {
    // Service not available
  }
  return null;
}

export async function fetchWhoopHistory(days: number = 7): Promise<{
  history: Array<{
    date: string;
    recoveryScore: number;
    hrv: number;
    restingHr: number;
  }>;
}> {
  try {
    const response = await fetch(`/api/health/whoop/history?days=${days}`);
    if (response.ok) {
      return response.json();
    }
  } catch {
    // Service not available
  }
  return { history: [] };
}

export async function fetchEightSleepData(): Promise<EightSleepData | null> {
  try {
    const response = await fetch("/api/health/eightsleep/sleep");
    if (response.ok) {
      return response.json();
    }
  } catch {
    // Service not available
  }
  return null;
}

export async function fetchEightSleepStatus(): Promise<{
  leftSide: { currentTemp: number; targetTemp: number; isOn: boolean };
  rightSide: { currentTemp: number; targetTemp: number; isOn: boolean };
  priming: boolean;
} | null> {
  try {
    const response = await fetch("/api/health/eightsleep/status");
    if (response.ok) {
      return response.json();
    }
  } catch {
    // Service not available
  }
  return null;
}

export async function fetchRenphoData(): Promise<RenphoData | null> {
  try {
    const response = await fetch("/api/health/renpho/latest");
    if (response.ok) {
      return response.json();
    }
  } catch {
    // Service not available
  }
  return null;
}

export async function fetchRenphoTrend(days: number = 30): Promise<{
  trend: Array<{ date: string; weight: number; bodyFatPercent: number }>;
  summary: {
    startWeight: number;
    currentWeight: number;
    weightChange: number;
    bodyFatChange: number;
    measurementCount: number;
  };
}> {
  try {
    const response = await fetch(`/api/health/renpho/trend?days=${days}`);
    if (response.ok) {
      return response.json();
    }
  } catch {
    // Service not available
  }
  return {
    trend: [],
    summary: {
      startWeight: 0,
      currentWeight: 0,
      weightChange: 0,
      bodyFatChange: 0,
      measurementCount: 0,
    },
  };
}

export async function fetchAppleHealthData(): Promise<AppleHealthData | null> {
  try {
    const response = await fetch("/api/health/apple/latest");
    if (response.ok) {
      return response.json();
    }
  } catch {
    // Service not available
  }
  return null;
}

export async function fetchAppleHealthHistory(days: number = 7): Promise<{
  history: AppleHealthData[];
  summary: {
    totalSteps: number;
    avgSteps: number;
    totalExercise: number;
    avgSleep: number;
    daysTracked: number;
  };
}> {
  try {
    const response = await fetch(`/api/health/apple/history?days=${days}`);
    if (response.ok) {
      return response.json();
    }
  } catch {
    // Service not available
  }
  return {
    history: [],
    summary: {
      totalSteps: 0,
      avgSteps: 0,
      totalExercise: 0,
      avgSleep: 0,
      daysTracked: 0,
    },
  };
}

export async function fetchHealthStatus(): Promise<{
  whoop: { configured: boolean; connected: boolean; authUrl?: string | null };
  eightSleep: { configured: boolean; connected: boolean };
  renpho: { configured: boolean; connected: boolean };
  appleHealth: { configured: boolean; connected: boolean; webhookUrl: string };
}> {
  try {
    const response = await fetch("/api/health/status");
    if (response.ok) {
      return response.json();
    }
  } catch {
    // Service not available
  }
  return {
    whoop: { configured: false, connected: false },
    eightSleep: { configured: false, connected: false },
    renpho: { configured: false, connected: false },
    appleHealth: { configured: true, connected: false, webhookUrl: "/api/health/apple/ingest" },
  };
}

export async function triggerHealthSync(): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch("/api/health/sync", { method: "POST" });
    if (response.ok) {
      return response.json();
    }
  } catch {
    // Service not available
  }
  return { success: false, message: "Sync failed" };
}

// =============================================================================
// Weather API Functions
// =============================================================================

export async function fetchWeather(): Promise<WeatherData | null> {
  try {
    const response = await fetch("/api/weather");
    if (response.ok) {
      return response.json();
    }
  } catch {
    // Service not available
  }
  return null;
}

// =============================================================================
// Tides API Functions
// =============================================================================

export async function fetchTides(): Promise<TideData | null> {
  try {
    const response = await fetch("/api/tides");
    if (response.ok) {
      return response.json();
    }
  } catch {
    // Service not available
  }
  return null;
}

// =============================================================================
// Calendar API Functions
// =============================================================================

export async function fetchCalendarEvents(start?: string, end?: string): Promise<CalendarResponse | null> {
  try {
    const params = new URLSearchParams();
    if (start) params.set("start", start);
    if (end) params.set("end", end);
    const query = params.toString();
    const response = await fetch(`/api/calendar/events${query ? `?${query}` : ""}`);
    if (response.ok) {
      return response.json();
    }
  } catch {
    // Service not available
  }
  return null;
}

// =============================================================================
// Reminders API Functions
// =============================================================================

export async function fetchReminders(): Promise<Reminder[]> {
  try {
    const response = await fetch("/api/reminders");
    if (response.ok) {
      return response.json();
    }
  } catch {
    // Service not available
  }
  return [];
}

export async function createReminder(input: CreateReminderInput): Promise<Reminder | null> {
  try {
    const response = await fetch("/api/reminders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (response.ok) {
      return response.json();
    }
  } catch {
    // Service not available
  }
  return null;
}

export async function toggleReminder(id: number, completed: boolean): Promise<Reminder | null> {
  try {
    const response = await fetch(`/api/reminders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed }),
    });
    if (response.ok) {
      return response.json();
    }
  } catch {
    // Service not available
  }
  return null;
}

export async function deleteReminder(id: number): Promise<boolean> {
  try {
    const response = await fetch(`/api/reminders/${id}`, { method: "DELETE" });
    return response.ok;
  } catch {
    return false;
  }
}

// =============================================================================
// Goals API Functions
// =============================================================================

export async function fetchGoals(year?: number): Promise<Goal[]> {
  try {
    const params = year ? `?year=${year}` : "";
    const response = await fetch(`/api/goals${params}`);
    if (response.ok) {
      return response.json();
    }
  } catch {
    // Service not available
  }
  return [];
}

export async function createGoal(input: CreateGoalInput): Promise<Goal | null> {
  try {
    const response = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (response.ok) {
      return response.json();
    }
  } catch {
    // Service not available
  }
  return null;
}

export async function updateGoal(id: number, input: UpdateGoalInput): Promise<Goal | null> {
  try {
    const response = await fetch(`/api/goals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (response.ok) {
      return response.json();
    }
  } catch {
    // Service not available
  }
  return null;
}

export async function deleteGoal(id: number): Promise<boolean> {
  try {
    const response = await fetch(`/api/goals/${id}`, { method: "DELETE" });
    return response.ok;
  } catch {
    return false;
  }
}

// Goal Years
export async function fetchGoalYears(): Promise<number[]> {
  try {
    const response = await fetch("/api/goals/years");
    if (response.ok) {
      return response.json();
    }
  } catch {
    // Service not available
  }
  return [new Date().getFullYear()];
}

export async function fetchGoalYear(year: number): Promise<GoalYear | null> {
  try {
    const response = await fetch(`/api/goals/years/${year}`);
    if (response.ok) {
      return response.json();
    }
  } catch {
    // Service not available
  }
  return null;
}

export async function upsertGoalYear(year: number, input: UpdateGoalYearInput): Promise<GoalYear | null> {
  try {
    const response = await fetch(`/api/goals/years/${year}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (response.ok) {
      return response.json();
    }
  } catch {
    // Service not available
  }
  return null;
}

// Goal Year Intentions
export async function fetchGoalIntentions(year: number): Promise<GoalYearIntention[]> {
  try {
    const response = await fetch(`/api/goals/years/${year}/intentions`);
    if (response.ok) {
      return response.json();
    }
  } catch {
    // Service not available
  }
  return [];
}

export async function upsertGoalIntention(year: number, category: string, intention: string): Promise<GoalYearIntention | null> {
  try {
    const response = await fetch(`/api/goals/years/${year}/intentions/${category}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ intention }),
    });
    if (response.ok) {
      return response.json();
    }
  } catch {
    // Service not available
  }
  return null;
}

// Goal Reviews
export async function fetchGoalReviews(goalId: number): Promise<GoalReview[]> {
  try {
    const response = await fetch(`/api/goals/${goalId}/reviews`);
    if (response.ok) {
      return response.json();
    }
  } catch {
    // Service not available
  }
  return [];
}

export async function upsertGoalReview(goalId: number, quarter: GoalQuarter, year: number, notes: string): Promise<GoalReview | null> {
  try {
    const response = await fetch(`/api/goals/${goalId}/reviews/${quarter}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes, year }),
    });
    if (response.ok) {
      return response.json();
    }
  } catch {
    // Service not available
  }
  return null;
}

// AI Next Step
export async function generateNextStep(goalId: number): Promise<string | null> {
  try {
    const response = await fetch(`/api/goals/${goalId}/generate-next-step`, {
      method: "POST",
    });
    if (response.ok) {
      const data = await response.json();
      return data.next_step;
    }
  } catch {
    // Service not available
  }
  return null;
}

// =============================================================================
// CRM API Functions
// =============================================================================

export async function fetchCrmContacts(): Promise<Contact[]> {
  try {
    const response = await fetch("/api/crm/contacts");
    if (response.ok) {
      return response.json();
    }
  } catch {
    // Service not available
  }
  return [];
}

export async function fetchCrmContact(id: string): Promise<(Contact & { interactions: Interaction[] }) | null> {
  try {
    const response = await fetch(`/api/crm/contacts/${id}`);
    if (response.ok) {
      return response.json();
    }
  } catch {
    // Service not available
  }
  return null;
}

export async function createCrmContact(input: CreateContactInput): Promise<Contact | null> {
  try {
    const response = await fetch("/api/crm/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (response.ok) {
      return response.json();
    }
  } catch {
    // Service not available
  }
  return null;
}

export async function updateCrmContact(id: string, input: Partial<Contact>): Promise<Contact | null> {
  try {
    const response = await fetch(`/api/crm/contacts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (response.ok) {
      return response.json();
    }
  } catch {
    // Service not available
  }
  return null;
}

export async function deleteCrmContact(id: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/crm/contacts/${id}`, { method: "DELETE" });
    return response.ok;
  } catch {
    return false;
  }
}

export async function fetchCrmInteractions(contactId?: string): Promise<Interaction[]> {
  try {
    const params = contactId ? `?contactId=${contactId}` : "";
    const response = await fetch(`/api/crm/interactions${params}`);
    if (response.ok) {
      return response.json();
    }
  } catch {
    // Service not available
  }
  return [];
}

export async function createCrmInteraction(input: CreateInteractionInput): Promise<Interaction | null> {
  try {
    const response = await fetch("/api/crm/interactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (response.ok) {
      return response.json();
    }
  } catch {
    // Service not available
  }
  return null;
}

export async function fetchCrmStats(): Promise<CrmStats> {
  try {
    const response = await fetch("/api/crm/stats");
    if (response.ok) {
      return response.json();
    }
  } catch {
    // Service not available
  }
  return {
    totalContacts: 0,
    overdueCount: 0,
    atRiskCount: 0,
    upcomingBirthdays: [],
  };
}

// =============================================================================
// Vision Board API Functions
// =============================================================================

export async function fetchVisionBoardItems(): Promise<VisionBoardItem[]> {
  try {
    const response = await fetch("/api/vision-board");
    if (response.ok) return response.json();
  } catch {}
  return [];
}

export async function scrapeVisionBoardItem(url: string): Promise<VisionBoardItem | null> {
  try {
    const response = await fetch("/api/vision-board/scrape", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    if (response.ok) return response.json();
    const data = await response.json().catch(() => null);
    throw new Error(data?.error || "Failed to scrape URL");
  } catch (error) {
    throw error;
  }
}

export async function updateVisionBoardItem(
  id: string,
  fields: { category?: Category; price?: string | null }
): Promise<boolean> {
  try {
    const response = await fetch(`/api/vision-board/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function deleteVisionBoardItem(id: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/vision-board/${id}`, { method: "DELETE" });
    return response.ok;
  } catch {
    return false;
  }
}

// =============================================================================
// Dream Home API Functions
// =============================================================================

export async function fetchDreamHomeImages(tags?: string[]): Promise<DreamHomeImage[]> {
  try {
    const params = tags && tags.length > 0 ? `?tags=${tags.join(",")}` : "";
    const response = await fetch(`/api/dream-home${params}`);
    if (response.ok) return response.json();
  } catch {}
  return [];
}

export async function fetchDreamHomeTagCounts(): Promise<DreamHomeTagCount[]> {
  try {
    const response = await fetch("/api/dream-home/tags");
    if (response.ok) return response.json();
  } catch {}
  return [];
}

export async function scrapeDreamHomeListing(url: string): Promise<{ jobId?: string; job?: DreamHomeScrapeJob }> {
  const response = await fetch("/api/dream-home/scrape", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });

  if (response.status === 201) {
    // Direct image — completed immediately
    const job = await response.json();
    return { job };
  }

  if (response.status === 202) {
    const { jobId } = await response.json();
    return { jobId };
  }

  const data = await response.json().catch(() => null);
  throw new Error(data?.error || "Failed to scrape URL");
}

export async function pollDreamHomeJob(jobId: string): Promise<DreamHomeScrapeJob> {
  const response = await fetch(`/api/dream-home/scrape/status/${jobId}`);
  if (!response.ok) throw new Error("Failed to check job status");
  return response.json();
}

export async function addDreamHomeDirectImage(imageUrl: string): Promise<DreamHomeImage> {
  const response = await fetch("/api/dream-home/image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageUrl }),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error || "Failed to add image");
  }
  return response.json();
}

export async function uploadDreamHomeFiles(files: File[]): Promise<{ jobId: string }> {
  const formData = new FormData();
  for (const file of files) {
    formData.append("images", file);
  }
  const response = await fetch("/api/dream-home/upload", {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error || "Failed to upload files");
  }
  return response.json();
}

export async function importDreamHomeUrls(
  urls: string[],
  sourceUrl?: string,
  title?: string
): Promise<{ jobId: string }> {
  const response = await fetch("/api/dream-home/import-urls", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ urls, sourceUrl, title }),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error || "Failed to import URLs");
  }
  return response.json();
}

export async function updateDreamHomeImage(
  id: string,
  fields: { title?: string; notes?: string }
): Promise<boolean> {
  try {
    const response = await fetch(`/api/dream-home/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function updateDreamHomeTags(id: string, tags: string[]): Promise<boolean> {
  try {
    const response = await fetch(`/api/dream-home/${id}/tags`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tags }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function deleteDreamHomeImage(id: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/dream-home/${id}`, { method: "DELETE" });
    return response.ok;
  } catch {
    return false;
  }
}

export async function bulkUpdateDreamHomeTags(
  imageIds: string[],
  addTags?: string[],
  removeTags?: string[]
): Promise<boolean> {
  try {
    const response = await fetch("/api/dream-home/bulk/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageIds, addTags, removeTags }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function bulkDeleteDreamHomeImages(imageIds: string[]): Promise<boolean> {
  try {
    const response = await fetch("/api/dream-home/bulk/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageIds }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

// =============================================================================
// Dream Home Wishlist API Functions
// =============================================================================

export async function fetchWishlistItems(filters?: {
  room?: string;
  status?: string;
}): Promise<WishlistItem[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.room) params.set("room", filters.room);
    if (filters?.status) params.set("status", filters.status);
    const qs = params.toString() ? `?${params.toString()}` : "";
    const response = await fetch(`/api/dream-home-wishlist${qs}`);
    if (response.ok) return response.json();
  } catch {}
  return [];
}

export async function scrapeWishlistItem(url: string): Promise<WishlistItem> {
  const response = await fetch("/api/dream-home-wishlist/scrape", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error || "Failed to scrape URL");
  }
  return response.json();
}

export async function updateWishlistItem(
  id: string,
  patch: UpdateWishlistInput
): Promise<WishlistItem | null> {
  try {
    const response = await fetch(`/api/dream-home-wishlist/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (response.ok) return response.json();
  } catch {}
  return null;
}

export async function deleteWishlistItem(id: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/dream-home-wishlist/${id}`, { method: "DELETE" });
    return response.ok;
  } catch {
    return false;
  }
}

export async function bulkDeleteWishlistItems(ids: string[]): Promise<boolean> {
  try {
    const response = await fetch("/api/dream-home-wishlist/bulk/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

// =============================================================================
// AI Chat API Functions
// =============================================================================

export async function fetchConversations(): Promise<AiConversation[]> {
  try {
    const response = await fetch("/api/chat/conversations");
    if (response.ok) {
      return response.json();
    }
  } catch {
    // Service not available
  }
  return [];
}

export async function fetchConversation(id: string): Promise<AiConversationWithMessages | null> {
  try {
    const response = await fetch(`/api/chat/conversations/${id}`);
    if (response.ok) {
      return response.json();
    }
  } catch {
    // Service not available
  }
  return null;
}

export async function createChatConversation(message: string, user: string): Promise<AiConversationWithMessages | null> {
  try {
    const response = await fetch("/api/chat/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, user }),
    });
    if (response.ok) {
      return response.json();
    }
  } catch {
    // Service not available
  }
  return null;
}

export async function sendChatMessage(conversationId: string, message: string, user: string): Promise<AiConversationWithMessages | null> {
  try {
    const response = await fetch(`/api/chat/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, user }),
    });
    if (response.ok) {
      return response.json();
    }
  } catch {
    // Service not available
  }
  return null;
}

export async function deleteChatConversation(id: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/chat/conversations/${id}`, { method: "DELETE" });
    return response.ok;
  } catch {
    return false;
  }
}

// =============================================================================
// Equipment API Functions
// =============================================================================

export async function fetchEquipment(category?: string): Promise<Equipment[]> {
  try {
    const params = category ? `?category=${encodeURIComponent(category)}` : "";
    const response = await fetch(`/api/equipment${params}`);
    if (response.ok) {
      return response.json();
    }
  } catch {
    // Service not available
  }
  return [];
}

export async function createEquipmentItem(input: CreateEquipmentInput): Promise<Equipment | null> {
  try {
    const response = await fetch("/api/equipment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (response.ok) {
      return response.json();
    }
  } catch {
    // Service not available
  }
  return null;
}

export async function updateEquipmentItem(id: string, input: UpdateEquipmentInput): Promise<Equipment | null> {
  try {
    const response = await fetch(`/api/equipment/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (response.ok) {
      return response.json();
    }
  } catch {
    // Service not available
  }
  return null;
}

export async function deleteEquipmentItem(id: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/equipment/${id}`, { method: "DELETE" });
    return response.ok;
  } catch {
    return false;
  }
}

export async function fetchEquipmentNotes(equipmentId: string): Promise<EquipmentNote[]> {
  try {
    const response = await fetch(`/api/equipment/${equipmentId}/notes`);
    if (response.ok) {
      return response.json();
    }
  } catch {
    // Service not available
  }
  return [];
}

export async function addEquipmentNote(equipmentId: string, content: string, user?: string): Promise<EquipmentNote | null> {
  try {
    const response = await fetch(`/api/equipment/${equipmentId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, user }),
    });
    if (response.ok) {
      return response.json();
    }
  } catch {
    // Service not available
  }
  return null;
}

export async function deleteEquipmentNote(noteId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/equipment/notes/${noteId}`, { method: "DELETE" });
    return response.ok;
  } catch {
    return false;
  }
}

export async function scrapeProductUrl(url: string): Promise<ScrapedProductInfo | null> {
  try {
    const response = await fetch("/api/equipment/scrape", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    if (response.ok) {
      return response.json();
    }
  } catch {
    // Service not available
  }
  return null;
}

// =============================================================================
// Finance API Functions (Assets & Loans)
// =============================================================================

export async function fetchAssets(): Promise<Asset[]> {
  try {
    const response = await fetch("/api/finance/assets");
    if (response.ok) {
      return response.json();
    }
  } catch {
    // Service not available
  }
  return [];
}

export async function createAssetItem(input: CreateAssetInput): Promise<Asset | null> {
  try {
    const response = await fetch("/api/finance/assets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (response.ok) {
      return response.json();
    }
  } catch {
    // Service not available
  }
  return null;
}

export async function updateAssetItem(id: string, input: UpdateAssetInput): Promise<Asset | null> {
  try {
    const response = await fetch(`/api/finance/assets/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (response.ok) {
      return response.json();
    }
  } catch {
    // Service not available
  }
  return null;
}

export async function deleteAssetItem(id: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/finance/assets/${id}`, { method: "DELETE" });
    return response.ok;
  } catch {
    return false;
  }
}

export async function fetchLoans(assetId?: string): Promise<Loan[]> {
  try {
    const params = assetId ? `?assetId=${assetId}` : "";
    const response = await fetch(`/api/finance/loans${params}`);
    if (response.ok) {
      return response.json();
    }
  } catch {
    // Service not available
  }
  return [];
}

export async function createLoanItem(input: CreateLoanInput): Promise<Loan | null> {
  try {
    const response = await fetch("/api/finance/loans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (response.ok) {
      return response.json();
    }
  } catch {
    // Service not available
  }
  return null;
}

export async function updateLoanItem(id: string, input: UpdateLoanInput): Promise<Loan | null> {
  try {
    const response = await fetch(`/api/finance/loans/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (response.ok) {
      return response.json();
    }
  } catch {
    // Service not available
  }
  return null;
}

export async function deleteLoanItem(id: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/finance/loans/${id}`, { method: "DELETE" });
    return response.ok;
  } catch {
    return false;
  }
}

// =============================================================================
// Loyalty Programs API Functions
// =============================================================================

export async function fetchLoyaltyPrograms(): Promise<LoyaltyProgram[]> {
  try {
    const response = await fetch("/api/loyalty");
    if (response.ok) return response.json();
  } catch {}
  return [];
}

export async function updateLoyaltyProgram(
  id: string,
  fields: { points?: number; statusTier?: string; memberNumber?: string }
): Promise<LoyaltyProgram | null> {
  try {
    const response = await fetch(`/api/loyalty/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });
    if (response.ok) return response.json();
  } catch {}
  return null;
}

// =============================================================================
// Shopping List API Functions
// =============================================================================

export async function fetchShoppingItems(): Promise<ShoppingItem[]> {
  try {
    const response = await fetch("/api/shopping");
    if (response.ok) return response.json();
  } catch {}
  return [];
}

export async function createShoppingItem(input: CreateShoppingItemInput): Promise<ShoppingItem | null> {
  try {
    const response = await fetch("/api/shopping", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (response.ok) return response.json();
  } catch {}
  return null;
}

export async function updateShoppingItem(id: string, updates: Partial<{ name: string; quantity: number; category: string; isChecked: boolean }>): Promise<ShoppingItem | null> {
  try {
    const response = await fetch(`/api/shopping/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (response.ok) return response.json();
  } catch {}
  return null;
}

export async function deleteShoppingItem(id: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/shopping/${id}`, { method: "DELETE" });
    return response.ok;
  } catch { return false; }
}

export async function clearCheckedShoppingItems(): Promise<boolean> {
  try {
    const response = await fetch("/api/shopping/checked", { method: "DELETE" });
    return response.ok;
  } catch { return false; }
}

// =============================================================================
// Tasks API Functions
// =============================================================================

export async function fetchTasks(archived?: boolean): Promise<Task[]> {
  try {
    const params = archived !== undefined ? `?archived=${archived}` : "";
    const response = await fetch(`/api/tasks${params}`);
    if (response.ok) return response.json();
  } catch {}
  return [];
}

export async function createTask(input: CreateTaskInput): Promise<Task | null> {
  try {
    const response = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (response.ok) return response.json();
  } catch {}
  return null;
}

export async function updateTask(id: string, input: UpdateTaskInput): Promise<Task | null> {
  try {
    const response = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (response.ok) return response.json();
  } catch {}
  return null;
}

export async function deleteTask(id: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    return response.ok;
  } catch { return false; }
}

export async function fetchTaskAttachments(taskId: string): Promise<TaskAttachment[]> {
  try {
    const response = await fetch(`/api/tasks/${taskId}/attachments`);
    if (response.ok) return response.json();
  } catch {}
  return [];
}

export async function addTaskAttachment(taskId: string, input: CreateAttachmentInput): Promise<TaskAttachment | null> {
  try {
    const response = await fetch(`/api/tasks/${taskId}/attachments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (response.ok) return response.json();
  } catch {}
  return null;
}

export async function deleteTaskAttachment(attachmentId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/tasks/attachments/${attachmentId}`, { method: "DELETE" });
    return response.ok;
  } catch { return false; }
}

// =============================================================================
// Wardrobe API Functions
// =============================================================================

export async function fetchWardrobe(filters?: {
  category?: string;
  brand?: string;
  colour?: string;
  size?: string;
}): Promise<WardrobeItem[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.category) params.set("category", filters.category);
    if (filters?.brand) params.set("brand", filters.brand);
    if (filters?.colour) params.set("colour", filters.colour);
    if (filters?.size) params.set("size", filters.size);
    const qs = params.toString();
    const response = await fetch(`/api/wardrobe${qs ? `?${qs}` : ""}`);
    if (response.ok) return response.json();
  } catch {}
  return [];
}

export async function createWardrobeItem(input: CreateWardrobeInput): Promise<WardrobeItem | null> {
  try {
    const response = await fetch("/api/wardrobe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (response.ok) return response.json();
  } catch {}
  return null;
}

export async function updateWardrobeItemApi(id: string, input: UpdateWardrobeInput): Promise<WardrobeItem | null> {
  try {
    const response = await fetch(`/api/wardrobe/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (response.ok) return response.json();
  } catch {}
  return null;
}

export async function deleteWardrobeItemApi(id: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/wardrobe/${id}`, { method: "DELETE" });
    return response.ok;
  } catch { return false; }
}

// =============================================================================
// Life Script API Functions
// =============================================================================

export async function fetchLifeScript(owner: string): Promise<LifeScript | null> {
  try {
    const response = await fetch(`/api/life-scripts/${owner}`);
    if (response.ok) return response.json();
  } catch {}
  return null;
}

export async function updateLifeScript(owner: string, input: UpdateLifeScriptInput): Promise<LifeScript | null> {
  try {
    const response = await fetch(`/api/life-scripts/${owner}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (response.ok) return response.json();
  } catch {}
  return null;
}

export async function fetchLifeScriptVersions(owner: string): Promise<LifeScriptVersion[]> {
  try {
    const response = await fetch(`/api/life-scripts/${owner}/versions`);
    if (response.ok) return response.json();
  } catch {}
  return [];
}

export async function restoreLifeScriptVersion(owner: string, versionId: string): Promise<LifeScript | null> {
  try {
    const response = await fetch(`/api/life-scripts/${owner}/restore/${versionId}`, { method: "POST" });
    if (response.ok) return response.json();
  } catch {}
  return null;
}

// =============================================================================
// Documents API Functions
// =============================================================================

export async function fetchDocuments(category?: string): Promise<HouseholdDocument[]> {
  try {
    const params = category ? `?category=${encodeURIComponent(category)}` : "";
    const response = await fetch(`/api/documents${params}`);
    if (response.ok) return response.json();
  } catch {}
  return [];
}

export async function uploadDocument(file: File, uploadedBy?: string): Promise<HouseholdDocument | null> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    if (uploadedBy) formData.append("uploadedBy", uploadedBy);

    const response = await fetch("/api/documents/upload", {
      method: "POST",
      body: formData,
    });
    if (response.ok) return response.json();
  } catch {}
  return null;
}

export async function updateDocumentItem(id: string, input: Partial<HouseholdDocument>): Promise<HouseholdDocument | null> {
  try {
    const response = await fetch(`/api/documents/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (response.ok) return response.json();
  } catch {}
  return null;
}

export async function deleteDocumentItem(id: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/documents/${id}`, { method: "DELETE" });
    return response.ok;
  } catch {}
  return false;
}

// =============================================================================
// Investment API Functions
// =============================================================================

export async function fetchInvestments(): Promise<Investment[]> {
  try {
    const r = await fetch("/api/investments");
    if (r.ok) return r.json();
  } catch {}
  return [];
}

export async function fetchInvestmentDetail(id: string): Promise<InvestmentWithDetails | null> {
  try {
    const r = await fetch(`/api/investments/${id}`);
    if (r.ok) return r.json();
  } catch {}
  return null;
}

export async function createInvestmentApi(input: CreateInvestmentInput): Promise<Investment | null> {
  try {
    const r = await fetch("/api/investments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
    if (r.ok) return r.json();
  } catch {}
  return null;
}

export async function updateInvestmentApi(id: string, input: UpdateInvestmentInput): Promise<Investment | null> {
  try {
    const r = await fetch(`/api/investments/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
    if (r.ok) return r.json();
  } catch {}
  return null;
}

export async function addInvestmentPayment(investmentId: string, input: CreatePaymentInput): Promise<InvestmentPayment | null> {
  try {
    const r = await fetch(`/api/investments/${investmentId}/payments`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
    if (r.ok) return r.json();
  } catch {}
  return null;
}

export async function updateInvestmentPayment(paymentId: string, updates: any): Promise<InvestmentPayment | null> {
  try {
    const r = await fetch(`/api/investments/payments/${paymentId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updates) });
    if (r.ok) return r.json();
  } catch {}
  return null;
}

export async function deleteInvestmentPayment(paymentId: string): Promise<boolean> {
  try { return (await fetch(`/api/investments/payments/${paymentId}`, { method: "DELETE" })).ok; } catch { return false; }
}

export async function addInvestmentDocument(investmentId: string, input: CreateInvDocInput): Promise<InvestmentDocument | null> {
  try {
    const r = await fetch(`/api/investments/${investmentId}/documents`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
    if (r.ok) return r.json();
  } catch {}
  return null;
}

export async function deleteInvestmentDocument(docId: string): Promise<boolean> {
  try { return (await fetch(`/api/investments/documents/${docId}`, { method: "DELETE" })).ok; } catch { return false; }
}

export async function addInvestmentTaskApi(investmentId: string, input: CreateInvTaskInput): Promise<InvestmentTask | null> {
  try {
    const r = await fetch(`/api/investments/${investmentId}/tasks`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
    if (r.ok) return r.json();
  } catch {}
  return null;
}

export async function updateInvestmentTaskApi(taskId: string, updates: any): Promise<InvestmentTask | null> {
  try {
    const r = await fetch(`/api/investments/tasks/${taskId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updates) });
    if (r.ok) return r.json();
  } catch {}
  return null;
}

export async function deleteInvestmentTaskApi(taskId: string): Promise<boolean> {
  try { return (await fetch(`/api/investments/tasks/${taskId}`, { method: "DELETE" })).ok; } catch { return false; }
}

// =============================================================================
// Restaurant API Functions
// =============================================================================

interface RestaurantFilters {
  city?: string;
  cuisine?: string;
  status?: string;
  priceRange?: number;
  mealType?: string;
}

export async function fetchRestaurants(filters?: RestaurantFilters): Promise<Restaurant[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.city) params.set("city", filters.city);
    if (filters?.cuisine) params.set("cuisine", filters.cuisine);
    if (filters?.status) params.set("status", filters.status);
    if (filters?.priceRange) params.set("priceRange", String(filters.priceRange));
    if (filters?.mealType) params.set("mealType", filters.mealType);
    const qs = params.toString();
    const response = await fetch(`/api/restaurants${qs ? `?${qs}` : ""}`);
    if (response.ok) return response.json();
  } catch {}
  return [];
}

export async function createRestaurantItem(input: CreateRestaurantInput): Promise<Restaurant | null> {
  try {
    const response = await fetch("/api/restaurants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (response.ok) return response.json();
  } catch {}
  return null;
}

export async function updateRestaurantItem(id: string, input: UpdateRestaurantInput): Promise<Restaurant | null> {
  try {
    const response = await fetch(`/api/restaurants/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (response.ok) return response.json();
  } catch {}
  return null;
}

export async function deleteRestaurantItem(id: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/restaurants/${id}`, { method: "DELETE" });
    return response.ok;
  } catch {
    return false;
  }
}

export async function scrapeRestaurantInfo(url?: string, name?: string, city?: string): Promise<ScrapedRestaurantInfo | null> {
  try {
    const response = await fetch("/api/restaurants/scrape", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, name, city }),
    });
    if (response.ok) return response.json();
  } catch {}
  return null;
}

export async function geocodeRestaurantsBatch(): Promise<{ total: number } | null> {
  try {
    const response = await fetch("/api/restaurants/geocode/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (response.ok) return response.json();
  } catch {}
  return null;
}

export async function scrapeRestaurantReviews(id: string): Promise<{ reviews: GoogleReview[]; restaurant: Restaurant } | null> {
  try {
    const response = await fetch(`/api/restaurants/${id}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (response.ok) return response.json();
  } catch {}
  return null;
}
