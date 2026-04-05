export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  description?: string;
  location?: string;
  attendees?: string[];
  isAllDay: boolean;
}

export interface CalendarResponse {
  events: CalendarEvent[];
  todayCount: number;
  startDate: string;
  endDate: string;
}
