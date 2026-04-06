import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { RelationshipBadge } from "@/components/crm/RelationshipBadge";
import { ContactForm } from "@/components/crm/ContactForm";
import { InteractionForm } from "@/components/crm/InteractionForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  GlassCard,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardContent,
} from "@/components/ui/glass-card";
import {
  fetchCrmContact,
  fetchCrmContacts,
  updateCrmContact,
  deleteCrmContact,
  createCrmInteraction,
} from "@/lib/api";
import { format, parseISO, differenceInDays, differenceInYears } from "date-fns";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  MessageCircle,
  MapPin,
  Briefcase,
  Mail,
  Phone,
  Cake,
  Users,
  Video,
  Calendar,
  Heart,
  Globe,
  Loader2,
  Instagram,
  Facebook,
  Linkedin,
} from "lucide-react";
import { useLocation } from "wouter";
import type { Contact, Interaction, CreateInteractionInput } from "@shared/types/crm";

interface CrmContactDetailProps {
  params: { id: string };
}

const INTERACTION_ICONS: Record<string, typeof Users> = {
  "In Person": Users,
  Phone: Phone,
  "Video Call": Video,
  Message: MessageCircle,
  Event: Calendar,
};

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export function CrmContactDetail({ params }: CrmContactDetailProps) {
  const [, navigate] = useLocation();
  const [contact, setContact] = useState<Contact | null>(null);
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [interactionOpen, setInteractionOpen] = useState(false);
  const [deleteStage, setDeleteStage] = useState(0);

  const loadContact = async () => {
    setIsLoading(true);
    const [data, contacts] = await Promise.all([
      fetchCrmContact(params.id),
      fetchCrmContacts(),
    ]);
    if (data) {
      const { interactions: contactInteractions, ...contactData } = data;
      setContact(contactData);
      setInteractions(contactInteractions);
    }
    setAllContacts(contacts);
    setIsLoading(false);
  };

  useEffect(() => {
    loadContact();
  }, [params.id]);

  const handleSaveContact = async (input: Partial<Contact>) => {
    if (!contact) return;
    const updated = await updateCrmContact(contact.id, input);
    if (updated) setContact(updated);
    setEditOpen(false);
  };

  const handleSaveInteraction = async (input: CreateInteractionInput) => {
    const interaction = await createCrmInteraction(input);
    if (interaction) {
      setInteractions((prev) => [interaction, ...prev]);
      // Update lastSeenDate locally
      if (contact) {
        const interactionDate = new Date(interaction.date);
        const lastSeen = new Date(contact.lastSeenDate);
        if (interactionDate >= lastSeen) {
          setContact({ ...contact, lastSeenDate: interaction.date });
        }
      }
    }
    setInteractionOpen(false);
  };

  const handleDelete = async () => {
    if (deleteStage < 2) {
      setDeleteStage((s) => s + 1);
      return;
    }
    if (!contact) return;
    await deleteCrmContact(contact.id);
    navigate("/family/crm");
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Contact">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (!contact) {
    return (
      <DashboardLayout title="Contact">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Contact not found.</p>
          <Button variant="ghost" className="mt-4" onClick={() => navigate("/family/crm")}>
            <ArrowLeft className="size-4 mr-2" />
            Back to Contacts
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const daysSince = differenceInDays(new Date(), parseISO(contact.lastSeenDate));
  const age = contact.birthday
    ? differenceInYears(new Date(), parseISO(contact.birthday))
    : null;

  return (
    <DashboardLayout title={contact.fullName}>
      <div className="space-y-6">
        {/* Back + Actions */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/family/crm")}
          >
            <ArrowLeft className="size-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInteractionOpen(true)}
            >
              <MessageCircle className="size-4 mr-2" />
              Log Interaction
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditOpen(true)}
            >
              <Pencil className="size-4 mr-2" />
              Edit
            </Button>
            <Button
              variant={deleteStage === 0 ? "ghost" : "destructive"}
              size="sm"
              onClick={handleDelete}
              onMouseLeave={() => setDeleteStage(0)}
            >
              <Trash2 className="size-4 mr-1" />
              {deleteStage === 0
                ? "Delete"
                : deleteStage === 1
                  ? "Are you sure?"
                  : "Confirm Delete"}
            </Button>
          </div>
        </div>

        {/* Profile Header */}
        <GlassCard>
          <GlassCardContent className="p-6">
            <div className="flex items-start gap-5">
              {contact.avatarUrl ? (
                <img
                  src={contact.avatarUrl}
                  alt={contact.fullName}
                  className="size-20 rounded-full object-cover border-2 border-border"
                />
              ) : (
                <div className="size-20 rounded-full bg-muted flex items-center justify-center text-2xl font-bold text-muted-foreground">
                  {getInitials(contact.fullName)}
                </div>
              )}

              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold">
                    {contact.fullName}
                  </h1>
                  <Badge variant="outline">{contact.relationshipType}</Badge>
                  <RelationshipBadge
                    lastSeen={contact.lastSeenDate}
                    cadence={contact.cadenceDays}
                  />
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {contact.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="size-3.5" />
                      {contact.location}
                    </span>
                  )}
                  {contact.occupation && (
                    <span className="flex items-center gap-1.5">
                      <Briefcase className="size-3.5" />
                      {contact.occupation}
                    </span>
                  )}
                  {contact.birthday && (
                    <span className="flex items-center gap-1.5">
                      <Cake className="size-3.5" />
                      {format(parseISO(contact.birthday), "d MMM yyyy")}
                      {age !== null && ` (${age})`}
                    </span>
                  )}
                  {contact.email && (
                    <a
                      href={`mailto:${contact.email}`}
                      className="flex items-center gap-1.5 hover:text-foreground"
                    >
                      <Mail className="size-3.5" />
                      {contact.email}
                    </a>
                  )}
                  {contact.phone && (
                    <a
                      href={`tel:${contact.phone}`}
                      className="flex items-center gap-1.5 hover:text-foreground"
                    >
                      <Phone className="size-3.5" />
                      {contact.phone}
                    </a>
                  )}
                </div>

                {/* Social Links */}
                {contact.socials && Object.values(contact.socials).some(Boolean) && (
                  <div className="flex gap-3">
                    {contact.socials.instagram && (
                      <a
                        href={`https://instagram.com/${contact.socials.instagram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Instagram className="size-4" />
                      </a>
                    )}
                    {contact.socials.facebook && (
                      <a
                        href={`https://facebook.com/${contact.socials.facebook}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Facebook className="size-4" />
                      </a>
                    )}
                    {contact.socials.linkedin && (
                      <a
                        href={`https://linkedin.com/in/${contact.socials.linkedin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Linkedin className="size-4" />
                      </a>
                    )}
                    {contact.socials.x && (
                      <a
                        href={`https://x.com/${contact.socials.x}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Globe className="size-4" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Info panels */}
          <div className="lg:col-span-1 space-y-4">
            {/* Cadence */}
            <GlassCard>
              <GlassCardContent className="p-4 space-y-2">
                <h3 className="text-sm font-semibold">Cadence</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>
                    Target: Every <strong>{contact.cadenceDays}</strong> days
                  </p>
                  <p>
                    Last seen: <strong>{daysSince}</strong> days ago
                  </p>
                  <p>
                    Strength: <strong>{contact.relationshipStrength}/10</strong>
                  </p>
                </div>
              </GlassCardContent>
            </GlassCard>

            {/* Partner */}
            {contact.spouseName && (
              <GlassCard>
                <GlassCardContent className="p-4 space-y-2">
                  <h3 className="text-sm font-semibold flex items-center gap-1.5">
                    <Heart className="size-3.5 text-pink-500" />
                    Partner
                  </h3>
                  {(() => {
                    const partnerId = contact.spouseId || allContacts.find((c) => c.fullName === contact.spouseName)?.id;
                    return partnerId ? (
                      <button
                        onClick={() => navigate(`/family/crm/${partnerId}`)}
                        className="text-sm text-primary hover:underline text-left"
                      >
                        {contact.spouseName}
                      </button>
                    ) : (
                      <p className="text-sm">{contact.spouseName}</p>
                    );
                  })()}
                  {contact.relationshipStatus && (
                    <p className="text-xs text-muted-foreground">
                      {contact.relationshipStatus}
                    </p>
                  )}
                  {contact.weddingAnniversary && (
                    <p className="text-xs text-muted-foreground">
                      Anniversary:{" "}
                      {format(
                        parseISO(contact.weddingAnniversary),
                        "d MMM yyyy"
                      )}
                    </p>
                  )}
                </GlassCardContent>
              </GlassCard>
            )}

            {/* Personality */}
            {(contact.dietary.length > 0 ||
              contact.loveLanguages.length > 0 ||
              contact.languages.length > 0 ||
              contact.myersBriggs ||
              contact.humanDesign) && (
              <GlassCard>
                <GlassCardContent className="p-4 space-y-3">
                  <h3 className="text-sm font-semibold">Identity</h3>
                  {contact.dietary.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Dietary
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {contact.dietary.map((d) => (
                          <Badge key={d} variant="outline" className="text-xs">
                            {d}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {contact.loveLanguages.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Love Languages
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {contact.loveLanguages.map((l) => (
                          <Badge key={l} variant="outline" className="text-xs">
                            {l}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {contact.languages.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Languages
                      </p>
                      <p className="text-sm">{contact.languages.join(", ")}</p>
                    </div>
                  )}
                  {contact.myersBriggs && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        MBTI
                      </p>
                      <p className="text-sm font-medium">
                        {contact.myersBriggs}
                      </p>
                    </div>
                  )}
                  {contact.humanDesign && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Human Design
                      </p>
                      <p className="text-sm font-medium">
                        {contact.humanDesign}
                      </p>
                    </div>
                  )}
                </GlassCardContent>
              </GlassCard>
            )}

            {/* Groups */}
            {contact.groups.length > 0 && (
              <GlassCard>
                <GlassCardContent className="p-4">
                  <h3 className="text-sm font-semibold mb-2">Groups</h3>
                  <div className="flex flex-wrap gap-1">
                    {contact.groups.map((g) => (
                      <Badge key={g} variant="secondary" className="text-xs">
                        {g}
                      </Badge>
                    ))}
                  </div>
                </GlassCardContent>
              </GlassCard>
            )}

            {/* Notes */}
            {(contact.howWeMet || contact.notes) && (
              <GlassCard>
                <GlassCardContent className="p-4 space-y-3">
                  {contact.howWeMet && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        How We Met
                      </p>
                      <p className="text-sm">{contact.howWeMet}</p>
                    </div>
                  )}
                  {contact.notes && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Notes
                      </p>
                      <p className="text-sm">{contact.notes}</p>
                    </div>
                  )}
                </GlassCardContent>
              </GlassCard>
            )}
          </div>

          {/* Right: Interaction history */}
          <div className="lg:col-span-2">
            <GlassCard>
              <GlassCardHeader className="flex flex-row items-center justify-between">
                <GlassCardTitle className="text-base">
                  Activity ({interactions.length})
                </GlassCardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInteractionOpen(true)}
                >
                  <MessageCircle className="size-4 mr-2" />
                  Log
                </Button>
              </GlassCardHeader>
              <GlassCardContent>
                {interactions.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">
                    No interactions logged yet.
                  </p>
                ) : (
                  <div className="space-y-1">
                    {interactions.map((interaction) => {
                      const Icon =
                        INTERACTION_ICONS[interaction.type] || MessageCircle;
                      return (
                        <div
                          key={interaction.id}
                          className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50"
                        >
                          <div className="size-8 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                            <Icon className="size-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-medium">
                                {interaction.type}
                              </p>
                              <span className="text-xs text-muted-foreground shrink-0">
                                {format(
                                  parseISO(interaction.date),
                                  "d MMM yyyy"
                                )}
                              </span>
                            </div>
                            {interaction.notes && (
                              <p className="text-sm text-muted-foreground mt-0.5">
                                {interaction.notes}
                              </p>
                            )}
                            {interaction.location && (
                              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                                <MapPin className="size-3" />
                                {interaction.location}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </GlassCardContent>
            </GlassCard>
          </div>
        </div>
      </div>

      <ContactForm
        open={editOpen}
        onOpenChange={setEditOpen}
        initialData={contact}
        onSave={handleSaveContact}
        allContacts={allContacts}
      />

      {contact && (
        <InteractionForm
          open={interactionOpen}
          onOpenChange={setInteractionOpen}
          contact={contact}
          onSave={handleSaveInteraction}
        />
      )}
    </DashboardLayout>
  );
}
