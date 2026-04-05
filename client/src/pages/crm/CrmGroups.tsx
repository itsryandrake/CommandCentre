import { useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useCrm } from "@/hooks/useCrm";
import { RelationshipBadge } from "@/components/crm/RelationshipBadge";
import {
  GlassCard,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardContent,
} from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import type { Contact } from "@shared/types/crm";

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export function CrmGroups() {
  const { contacts, isLoading } = useCrm();
  const [, navigate] = useLocation();

  const groups = useMemo(() => {
    const groupMap = new Map<string, Contact[]>();

    contacts.forEach((contact) => {
      contact.groups.forEach((group) => {
        if (!groupMap.has(group)) {
          groupMap.set(group, []);
        }
        groupMap.get(group)!.push(contact);
      });
    });

    // Also group by relationship type
    const typeMap = new Map<string, Contact[]>();
    contacts.forEach((contact) => {
      const type = contact.relationshipType;
      if (!typeMap.has(type)) {
        typeMap.set(type, []);
      }
      typeMap.get(type)!.push(contact);
    });

    return { custom: groupMap, byType: typeMap };
  }, [contacts]);

  const handleContactClick = (contact: Contact) => {
    navigate(`/crm/contact/${contact.id}`);
  };

  return (
    <DashboardLayout title="Groups">
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Groups</h1>
          <p className="text-muted-foreground">
            View contacts by group and relationship type
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Custom Groups */}
            {groups.custom.size > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Communities & Groups</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {Array.from(groups.custom.entries())
                    .sort((a, b) => a[0].localeCompare(b[0]))
                    .map(([group, members]) => (
                      <GlassCard key={group}>
                        <GlassCardHeader className="pb-2">
                          <GlassCardTitle className="text-base flex items-center justify-between">
                            {group}
                            <Badge variant="secondary">{members.length}</Badge>
                          </GlassCardTitle>
                        </GlassCardHeader>
                        <GlassCardContent className="space-y-1">
                          {members.map((contact) => (
                            <div
                              key={contact.id}
                              className="flex items-center gap-2.5 p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                              onClick={() => handleContactClick(contact)}
                            >
                              {contact.avatarUrl ? (
                                <img
                                  src={contact.avatarUrl}
                                  alt={contact.fullName}
                                  className="size-7 rounded-full object-cover"
                                />
                              ) : (
                                <div className="size-7 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
                                  {getInitials(contact.fullName)}
                                </div>
                              )}
                              <span className="text-sm flex-1 truncate">
                                {contact.fullName}
                              </span>
                              <RelationshipBadge
                                lastSeen={contact.lastSeenDate}
                                cadence={contact.cadenceDays}
                              />
                            </div>
                          ))}
                        </GlassCardContent>
                      </GlassCard>
                    ))}
                </div>
              </div>
            )}

            {/* By Relationship Type */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">By Relationship Type</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from(groups.byType.entries())
                  .sort((a, b) => b[1].length - a[1].length)
                  .map(([type, members]) => (
                    <GlassCard key={type}>
                      <GlassCardHeader className="pb-2">
                        <GlassCardTitle className="text-base flex items-center justify-between">
                          {type}
                          <Badge variant="secondary">{members.length}</Badge>
                        </GlassCardTitle>
                      </GlassCardHeader>
                      <GlassCardContent className="space-y-1">
                        {members.slice(0, 8).map((contact) => (
                          <div
                            key={contact.id}
                            className="flex items-center gap-2.5 p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                            onClick={() => handleContactClick(contact)}
                          >
                            {contact.avatarUrl ? (
                              <img
                                src={contact.avatarUrl}
                                alt={contact.fullName}
                                className="size-7 rounded-full object-cover"
                              />
                            ) : (
                              <div className="size-7 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
                                {getInitials(contact.fullName)}
                              </div>
                            )}
                            <span className="text-sm flex-1 truncate">
                              {contact.fullName}
                            </span>
                            <RelationshipBadge
                              lastSeen={contact.lastSeenDate}
                              cadence={contact.cadenceDays}
                            />
                          </div>
                        ))}
                        {members.length > 8 && (
                          <p className="text-xs text-muted-foreground text-center py-1">
                            +{members.length - 8} more
                          </p>
                        )}
                      </GlassCardContent>
                    </GlassCard>
                  ))}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
