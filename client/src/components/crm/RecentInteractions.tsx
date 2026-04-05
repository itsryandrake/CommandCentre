import type { Contact, Interaction } from "@shared/types/crm";
import {
  GlassCard,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardContent,
} from "@/components/ui/glass-card";
import { format, parseISO } from "date-fns";
import {
  Users,
  Phone,
  Video,
  MessageCircle,
  Calendar,
} from "lucide-react";

interface RecentInteractionsProps {
  interactions: Interaction[];
  contacts: Contact[];
  onContactClick: (contact: Contact) => void;
}

const INTERACTION_ICONS = {
  "In Person": Users,
  Phone: Phone,
  "Video Call": Video,
  Message: MessageCircle,
  Event: Calendar,
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function RecentInteractions({
  interactions,
  contacts,
  onContactClick,
}: RecentInteractionsProps) {
  const recentInteractions = interactions
    .filter((i) => new Date(i.date) <= new Date())
    .slice(0, 10);

  if (recentInteractions.length === 0) return null;

  return (
    <GlassCard>
      <GlassCardHeader>
        <GlassCardTitle className="text-base">Recent Activity</GlassCardTitle>
      </GlassCardHeader>
      <GlassCardContent className="space-y-2">
        {recentInteractions.map((interaction) => {
          const contact = contacts.find((c) => c.id === interaction.contactId);
          if (!contact) return null;

          const Icon =
            INTERACTION_ICONS[interaction.type] || MessageCircle;

          return (
            <div
              key={interaction.id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => onContactClick(contact)}
            >
              {contact.avatarUrl ? (
                <img
                  src={contact.avatarUrl}
                  alt={contact.fullName}
                  className="size-8 rounded-full object-cover border border-border"
                />
              ) : (
                <div className="size-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground">
                  {getInitials(contact.fullName)}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {contact.fullName}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {interaction.notes || interaction.type}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Icon className="size-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {format(parseISO(interaction.date), "MMM d")}
                </span>
              </div>
            </div>
          );
        })}
      </GlassCardContent>
    </GlassCard>
  );
}
