import { useState, useEffect, useCallback, useMemo } from "react";
import type {
  Contact,
  Interaction,
  CreateContactInput,
  CreateInteractionInput,
  CrmStats,
} from "@shared/types/crm";
import {
  fetchCrmContacts,
  fetchCrmInteractions,
  fetchCrmStats,
  createCrmContact,
  updateCrmContact,
  deleteCrmContact,
  createCrmInteraction,
} from "@/lib/api";
import { differenceInDays, parseISO } from "date-fns";

interface UseCrmReturn {
  contacts: Contact[];
  interactions: Interaction[];
  stats: CrmStats;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addContact: (input: CreateContactInput) => Promise<Contact | null>;
  editContact: (id: string, input: Partial<Contact>) => Promise<Contact | null>;
  removeContact: (id: string) => Promise<void>;
  addInteraction: (input: CreateInteractionInput) => Promise<Interaction | null>;
  overdueContacts: Contact[];
}

export function useCrm(): UseCrmReturn {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [stats, setStats] = useState<CrmStats>({
    totalContacts: 0,
    overdueCount: 0,
    atRiskCount: 0,
    upcomingBirthdays: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [contactsData, interactionsData, statsData] = await Promise.all([
        fetchCrmContacts(),
        fetchCrmInteractions(),
        fetchCrmStats(),
      ]);
      setContacts(contactsData);
      setInteractions(interactionsData);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch CRM data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addContact = useCallback(async (input: CreateContactInput) => {
    const contact = await createCrmContact(input);
    if (contact) {
      setContacts((prev) => [...prev, contact].sort((a, b) => a.fullName.localeCompare(b.fullName)));
    }
    return contact;
  }, []);

  const editContact = useCallback(async (id: string, input: Partial<Contact>) => {
    const contact = await updateCrmContact(id, input);
    if (contact) {
      setContacts((prev) =>
        prev.map((c) => (c.id === id ? contact : c))
      );
    }
    return contact;
  }, []);

  const removeContact = useCallback(async (id: string) => {
    const success = await deleteCrmContact(id);
    if (success) {
      setContacts((prev) => prev.filter((c) => c.id !== id));
      setInteractions((prev) => prev.filter((i) => i.contactId !== id));
    }
  }, []);

  const addInteraction = useCallback(async (input: CreateInteractionInput) => {
    const interaction = await createCrmInteraction(input);
    if (interaction) {
      setInteractions((prev) => [interaction, ...prev]);
      // Update lastSeenDate locally
      const interactionDate = new Date(interaction.date);
      setContacts((prev) =>
        prev.map((c) => {
          if (c.id === interaction.contactId) {
            const lastSeen = new Date(c.lastSeenDate);
            if (interactionDate >= lastSeen) {
              return { ...c, lastSeenDate: interaction.date };
            }
          }
          return c;
        })
      );
    }
    return interaction;
  }, []);

  const overdueContacts = useMemo(() => {
    return contacts
      .filter((c) => {
        const days = differenceInDays(new Date(), parseISO(c.lastSeenDate));
        return days > c.cadenceDays;
      })
      .sort((a, b) => {
        const daysA = differenceInDays(new Date(), parseISO(a.lastSeenDate)) - a.cadenceDays;
        const daysB = differenceInDays(new Date(), parseISO(b.lastSeenDate)) - b.cadenceDays;
        return daysB - daysA;
      });
  }, [contacts]);

  return {
    contacts,
    interactions,
    stats,
    isLoading,
    error,
    refresh,
    addContact,
    editContact,
    removeContact,
    addInteraction,
    overdueContacts,
  };
}
