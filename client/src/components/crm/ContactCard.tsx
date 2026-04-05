import type { Contact } from "@shared/types/crm";
import { RelationshipBadge } from "./RelationshipBadge";
import { Badge } from "@/components/ui/badge";
import {
  GlassCard,
  GlassCardContent,
} from "@/components/ui/glass-card";
import { differenceInDays, parseISO } from "date-fns";
import { MapPin, Briefcase } from "lucide-react";

interface ContactCardProps {
  contact: Contact;
  onClick: (contact: Contact) => void;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const RELATIONSHIP_COLOURS: Record<string, string> = {
  Family: "bg-purple-100 text-purple-700",
  Friend: "bg-blue-100 text-blue-700",
  "Work-Friend": "bg-amber-100 text-amber-700",
  Neighbour: "bg-green-100 text-green-700",
  Acquaintance: "bg-gray-100 text-gray-600",
  Other: "bg-slate-100 text-slate-600",
};

export function ContactCard({ contact, onClick }: ContactCardProps) {
  const daysSince = differenceInDays(new Date(), parseISO(contact.lastSeenDate));

  return (
    <GlassCard
      className="cursor-pointer transition-all hover:shadow-md hover:scale-[1.01]"
      onClick={() => onClick(contact)}
    >
      <GlassCardContent className="p-4">
        <div className="flex items-start gap-3">
          {contact.avatarUrl ? (
            <img
              src={contact.avatarUrl}
              alt={contact.fullName}
              className="size-12 rounded-full object-cover border border-border shrink-0"
            />
          ) : (
            <div className="size-12 rounded-full bg-muted flex items-center justify-center text-sm font-semibold text-muted-foreground shrink-0">
              {getInitials(contact.fullName)}
            </div>
          )}

          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold truncate">{contact.fullName}</h3>
              <RelationshipBadge
                lastSeen={contact.lastSeenDate}
                cadence={contact.cadenceDays}
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className={`text-xs ${RELATIONSHIP_COLOURS[contact.relationshipType] || ""}`}
              >
                {contact.relationshipType}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {daysSince === 0
                  ? "Seen today"
                  : daysSince === 1
                    ? "1 day ago"
                    : `${daysSince}d ago`}
              </span>
            </div>

            {(contact.location || contact.occupation) && (
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {contact.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3" />
                    {contact.location}
                  </span>
                )}
                {contact.occupation && (
                  <span className="flex items-center gap-1">
                    <Briefcase className="size-3" />
                    {contact.occupation}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </GlassCardContent>
    </GlassCard>
  );
}
