import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useCrm } from "@/hooks/useCrm";
import { CrmStatsCards } from "@/components/crm/CrmStatsCards";
import { OverdueContacts } from "@/components/crm/OverdueContacts";
import { RecentInteractions } from "@/components/crm/RecentInteractions";
import { ContactCard } from "@/components/crm/ContactCard";
import { ContactForm } from "@/components/crm/ContactForm";
import { InteractionForm } from "@/components/crm/InteractionForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Loader2, Search } from "lucide-react";
import { useLocation } from "wouter";
import type { Contact, RelationshipType, CreateContactInput, CreateInteractionInput } from "@shared/types/crm";

const RELATIONSHIP_TYPES: RelationshipType[] = [
  "Family",
  "Friend",
  "Work-Friend",
  "Neighbour",
  "Acquaintance",
  "Other",
];

export function CrmHub() {
  const {
    contacts,
    interactions,
    stats,
    isLoading,
    overdueContacts,
    addContact,
    editContact,
    addInteraction,
    refresh,
  } = useCrm();

  const [, navigate] = useLocation();
  const [contactFormOpen, setContactFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | undefined>();
  const [interactionContact, setInteractionContact] = useState<Contact | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<RelationshipType | "all">("all");

  const handleContactClick = (contact: Contact) => {
    navigate(`/family/crm/${contact.id}`);
  };

  const handleSaveContact = async (input: CreateContactInput | Partial<Contact>) => {
    if (editingContact) {
      await editContact(editingContact.id, input);
    } else {
      await addContact(input as CreateContactInput);
    }
    setEditingContact(undefined);
    await refresh();
  };

  const handleSaveInteraction = async (input: CreateInteractionInput) => {
    await addInteraction(input);
    setInteractionContact(null);
    await refresh();
  };

  const filteredContacts = useMemo(() => {
    let filtered = contacts;
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.fullName.toLowerCase().includes(q) ||
          c.location?.toLowerCase().includes(q) ||
          c.occupation?.toLowerCase().includes(q) ||
          c.groups.some((g) => g.toLowerCase().includes(q))
      );
    }
    if (typeFilter !== "all") {
      filtered = filtered.filter((c) => c.relationshipType === typeFilter);
    }
    return filtered;
  }, [contacts, search, typeFilter]);

  return (
    <DashboardLayout title="CRM">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold">CRM</h1>
            <p className="text-muted-foreground">
              Keep your personal network healthy
            </p>
          </div>
          <Button onClick={() => { setEditingContact(undefined); setContactFormOpen(true); }}>
            <Plus className="size-4 mr-2" />
            Add Contact
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Stats */}
            <CrmStatsCards stats={stats} isLoading={isLoading} />

            {/* Overdue + Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <OverdueContacts
                contacts={overdueContacts}
                onContactClick={handleContactClick}
                onLogInteraction={setInteractionContact}
              />
              <RecentInteractions
                interactions={interactions}
                contacts={contacts}
                onContactClick={handleContactClick}
              />
            </div>

            {/* Contacts section */}
            <div className="space-y-4 pt-2">
              <h2 className="text-xl font-semibold">Contacts</h2>

              {/* Search & Filter */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Search contacts..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Badge
                    variant={typeFilter === "all" ? "default" : "outline"}
                    className="cursor-pointer select-none"
                    onClick={() => setTypeFilter("all")}
                  >
                    All ({contacts.length})
                  </Badge>
                  {RELATIONSHIP_TYPES.map((type) => {
                    const count = contacts.filter((c) => c.relationshipType === type).length;
                    if (count === 0) return null;
                    return (
                      <Badge
                        key={type}
                        variant={typeFilter === type ? "default" : "outline"}
                        className="cursor-pointer select-none"
                        onClick={() => setTypeFilter(type)}
                      >
                        {type} ({count})
                      </Badge>
                    );
                  })}
                </div>
              </div>

              {/* Contact grid */}
              {filteredContacts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>
                    {contacts.length === 0
                      ? "No contacts yet. Add one to get started."
                      : "No contacts match your search."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredContacts.map((contact) => (
                    <ContactCard
                      key={contact.id}
                      contact={contact}
                      onClick={handleContactClick}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <ContactForm
        open={contactFormOpen}
        onOpenChange={setContactFormOpen}
        initialData={editingContact}
        onSave={handleSaveContact}
        allContacts={contacts}
      />

      {interactionContact && (
        <InteractionForm
          open={!!interactionContact}
          onOpenChange={(open) => {
            if (!open) setInteractionContact(null);
          }}
          contact={interactionContact}
          onSave={handleSaveInteraction}
        />
      )}
    </DashboardLayout>
  );
}
