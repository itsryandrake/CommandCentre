import { Router } from "express";
import { google } from "googleapis";
import type { CalendarEvent } from "../../shared/types/calendar.ts";

const router = Router();

function getOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Google Calendar credentials not configured");
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  return oauth2Client;
}

function formatDateForAPI(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}T00:00:00+10:00`;
}

function formatDateEndForAPI(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}T23:59:59+10:00`;
}

function extractLocationFromConference(event: any): string | undefined {
  const conferenceData = event.conferenceData;
  if (!conferenceData) return undefined;

  const entryPoint = conferenceData.entryPoints?.find(
    (ep: any) => ep.entryPointType === "video"
  );

  if (entryPoint?.uri) {
    if (entryPoint.uri.includes("zoom")) return "Zoom";
    if (entryPoint.uri.includes("meet.google")) return "Google Meet";
    if (entryPoint.uri.includes("teams.microsoft")) return "Microsoft Teams";
    return "Video Call";
  }

  return undefined;
}

function mapEvent(event: any): CalendarEvent {
  const isAllDay = !event.start?.dateTime;
  const startStr = event.start?.dateTime || event.start?.date || "";
  const endStr = event.end?.dateTime || event.end?.date || "";

  return {
    id: event.id || "",
    title: event.summary || "Untitled Event",
    start: startStr,
    end: endStr,
    description: event.description,
    location: event.location || extractLocationFromConference(event),
    attendees: event.attendees?.map((a: any) => a.displayName || a.email || "").filter(Boolean),
    isAllDay,
  };
}

router.get("/events", async (req, res) => {
  try {
    const auth = getOAuth2Client();
    const calendar = google.calendar({ version: "v3", auth });
    const timeZone = "Australia/Brisbane";

    const startParam = req.query.start as string;
    const endParam = req.query.end as string;

    let timeMin: string;
    let timeMax: string;

    if (startParam && endParam) {
      timeMin = `${startParam}T00:00:00+10:00`;
      timeMax = `${endParam}T23:59:59+10:00`;
    } else {
      const now = new Date();
      const brisbaneNow = new Date(now.toLocaleString("en-US", { timeZone }));
      timeMin = formatDateForAPI(brisbaneNow);
      timeMax = formatDateEndForAPI(brisbaneNow);
    }

    const calendarId = (req.query.calendar as string) || process.env.FAMILY_CALENDAR_ID || "primary";

    const response = await calendar.events.list({
      calendarId,
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: "startTime",
      timeZone,
    });

    const events: CalendarEvent[] = (response.data.items || []).map(mapEvent);

    res.json({
      events,
      todayCount: events.filter((e) => !e.isAllDay).length,
      startDate: startParam || timeMin.split("T")[0],
      endDate: endParam || timeMax.split("T")[0],
    });
  } catch (error) {
    console.error("[Calendar] API error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to fetch calendar events",
    });
  }
});

export default router;
