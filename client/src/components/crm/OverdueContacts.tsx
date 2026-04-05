import type { Contact } from "@shared/types/crm";
import { RelationshipBadge } from "./RelationshipBadge";
import {
  GlassCard,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardContent,
} from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { differenceInDays, parseISO } from "date-fns";
import { MessageCircle } from "lucide-react";

interface OverdueContactsProps {
  contacts: Contact[];
  onContactClick: (contact: Contact) => void;
  onLogInteraction: (contact: Contact) => void;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function OverdueContacts({
  contacts,
  onContactClick,
  onLogInteraction,
}: OverdueContactsProps) {
  if (contacts.length === 0) return null;

  return (
    <GlassCard>
      <GlassCardHeader>
        <GlassCardTitle className="text-base">Overdue Catch-ups</GlassCardTitle>
      </GlassCardHeader>
      <GlassCardContent className="space-y-2">
        {contacts.slice(0, 8).map((contact) => {
          const daysSince = differenceInDays(
            new Date(),
            parseISO(contact.lastSeenDate)
          );
          const daysOverdue = daysSince - contact.cadenceDays;

          return (
            <div
              key={contact.id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => onContactClick(contact)}
            >
              {contact.avatarUrl ? (
                <img
                  src={contact.avatarUrl}
                  alt={contact.fullName}
                  className="size-9 rounded-full object-cover border border-border"
                />
              ) : (
                <div className="size-9 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground">
                  {getInitials(contact.fullName)}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {contact.fullName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {daysOverdue}d overdue · Last seen {daysSince}d ago
                </p>
              </div>

              <div className="flex items-center gap-2">
                <RelationshipBadge
                  lastSeen={contact.lastSeenDate}
                  cadence={contact.cadenceDays}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    onLogInteraction(contact);
                  }}
                >
                  <MessageCircle className="size-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </GlassCardContent>
    </GlassCard>
  );
}
