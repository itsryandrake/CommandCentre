import { useState, useEffect, useCallback } from "react";
import { useUser } from "@/context/UserContext";
import { fetchEquipmentNotes, addEquipmentNote, deleteEquipmentNote } from "@/lib/api";
import type { EquipmentNote } from "@shared/types/equipment";
import { Send, Trash2 } from "lucide-react";

function formatTimestamp(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }) + " at " + date.toLocaleTimeString("en-AU", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

interface EquipmentNotesProps {
  equipmentId: string;
}

export function EquipmentNotes({ equipmentId }: EquipmentNotesProps) {
  const { user } = useUser();
  const [notes, setNotes] = useState<EquipmentNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newNote, setNewNote] = useState("");
  const [isSending, setIsSending] = useState(false);

  const loadNotes = useCallback(async () => {
    setIsLoading(true);
    const data = await fetchEquipmentNotes(equipmentId);
    setNotes(data);
    setIsLoading(false);
  }, [equipmentId]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const handleAdd = async () => {
    if (!newNote.trim()) return;
    setIsSending(true);
    const note = await addEquipmentNote(equipmentId, newNote.trim(), user || undefined);
    if (note) {
      setNotes((prev) => [note, ...prev]);
      setNewNote("");
    }
    setIsSending(false);
  };

  const handleDelete = async (noteId: string) => {
    const success = await deleteEquipmentNote(noteId);
    if (success) {
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Notes Log</h3>

      {/* Add note input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Add a note..."
          className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          disabled={isSending}
        />
        <button
          onClick={handleAdd}
          disabled={!newNote.trim() || isSending}
          className="rounded-lg bg-primary/10 text-primary p-2 hover:bg-primary/20 transition-colors disabled:opacity-40"
        >
          <Send className="size-4" />
        </button>
      </div>

      {/* Notes list */}
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading notes...</p>
      ) : notes.length === 0 ? (
        <p className="text-sm text-muted-foreground">No notes yet.</p>
      ) : (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {notes.map((note) => (
            <div key={note.id} className="flex items-start gap-2 rounded-lg bg-muted/50 p-3 group">
              <div className="flex-1 min-w-0">
                <p className="text-sm">{note.content}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {note.createdBy && <span className="capitalize">{note.createdBy} \u00B7 </span>}
                  {formatTimestamp(note.createdAt)}
                </p>
              </div>
              <button
                onClick={() => handleDelete(note.id)}
                className="p-1 rounded text-muted-foreground/0 group-hover:text-muted-foreground hover:text-destructive transition-colors shrink-0"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
