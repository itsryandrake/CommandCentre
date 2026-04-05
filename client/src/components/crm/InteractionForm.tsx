import { useState } from "react";
import type { Contact, InteractionType, CreateInteractionInput } from "@shared/types/crm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Users,
  Phone,
  Video,
  MessageCircle,
  Calendar,
} from "lucide-react";

interface InteractionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact: Contact;
  onSave: (input: CreateInteractionInput) => Promise<void>;
}

const INTERACTION_TYPES: { id: InteractionType; icon: typeof Users; label: string }[] = [
  { id: "In Person", icon: Users, label: "In Person" },
  { id: "Phone", icon: Phone, label: "Phone" },
  { id: "Video Call", icon: Video, label: "Video" },
  { id: "Message", icon: MessageCircle, label: "Message" },
  { id: "Event", icon: Calendar, label: "Event" },
];

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export function InteractionForm({
  open,
  onOpenChange,
  contact,
  onSave,
}: InteractionFormProps) {
  const [type, setType] = useState<InteractionType>("In Person");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave({
        contactId: contact.id,
        date: new Date(date).toISOString(),
        type,
        notes,
      });
      // Reset form
      setType("In Person");
      setNotes("");
      setDate(new Date().toISOString().split("T")[0]);
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log Interaction</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
          {contact.avatarUrl ? (
            <img
              src={contact.avatarUrl}
              alt={contact.fullName}
              className="size-10 rounded-full object-cover"
            />
          ) : (
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
              {getInitials(contact.fullName)}
            </div>
          )}
          <div>
            <p className="text-sm font-medium">With {contact.fullName}</p>
            <p className="text-xs text-muted-foreground">Update recency</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Type</label>
            <div className="grid grid-cols-5 gap-2">
              {INTERACTION_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id)}
                  className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-all text-xs ${
                    type === t.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border hover:border-primary/50"
                  }`}
                >
                  <t.icon className="size-4" />
                  <span className="text-[10px] font-medium leading-tight">
                    {t.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Date</label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Notes</label>
            <Textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What did you talk about?"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Interaction"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
