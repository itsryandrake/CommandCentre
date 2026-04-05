import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useUser } from "@/context/UserContext";
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/ui/glass-card";
import {
  fetchLifeScript,
  updateLifeScript,
  fetchLifeScriptVersions,
  restoreLifeScriptVersion,
} from "@/lib/api";
import type { LifeScript, LifeScriptVersion } from "@shared/types/lifeScript";
import { Pencil, Save, X, Clock, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";

function formatTimestamp(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function ScriptSection({ owner, label }: { owner: "ryan" | "emily"; label: string }) {
  const [script, setScript] = useState<LifeScript | null>(null);
  const [versions, setVersions] = useState<LifeScriptVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [showVersions, setShowVersions] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    const data = await fetchLifeScript(owner);
    setScript(data);
    setIsLoading(false);
  }, [owner]);

  useEffect(() => { load(); }, [load]);

  const loadVersions = async () => {
    const v = await fetchLifeScriptVersions(owner);
    setVersions(v);
    setShowVersions(true);
  };

  const startEditing = () => {
    setEditContent(script?.content || "");
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditContent("");
  };

  const handleSave = async () => {
    setIsSaving(true);
    const updated = await updateLifeScript(owner, { content: editContent });
    if (updated) {
      setScript(updated);
      setIsEditing(false);
      // Refresh versions if panel is open
      if (showVersions) {
        const v = await fetchLifeScriptVersions(owner);
        setVersions(v);
      }
    }
    setIsSaving(false);
  };

  const handleRestore = async (versionId: string) => {
    const restored = await restoreLifeScriptVersion(owner, versionId);
    if (restored) {
      setScript(restored);
      const v = await fetchLifeScriptVersions(owner);
      setVersions(v);
    }
  };

  if (isLoading) {
    return (
      <GlassCard>
        <GlassCardContent className="py-8 text-center text-muted-foreground text-sm">
          Loading...
        </GlassCardContent>
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <GlassCardHeader>
        <div className="flex items-center justify-between w-full">
          <GlassCardTitle>{label}'s Life Script</GlassCardTitle>
          <div className="flex items-center gap-2">
            {script?.updatedAt && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="size-3" />
                Updated {formatTimestamp(script.updatedAt)}
              </span>
            )}
            {!isEditing ? (
              <button
                onClick={startEditing}
                className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
              >
                <Pencil className="size-3" />
                Edit
              </button>
            ) : (
              <div className="flex gap-1.5">
                <button
                  onClick={cancelEditing}
                  className="flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
                >
                  <X className="size-3" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-1 rounded-lg bg-primary text-primary-foreground px-3 py-1.5 text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  <Save className="size-3" />
                  {isSaving ? "Saving..." : "Save"}
                </button>
              </div>
            )}
          </div>
        </div>
      </GlassCardHeader>
      <GlassCardContent>
        {isEditing ? (
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full min-h-[400px] rounded-lg border bg-background px-4 py-3 text-sm leading-relaxed outline-none focus:border-primary resize-y"
          />
        ) : script?.content ? (
          <div className="prose prose-sm max-w-none text-foreground/90 whitespace-pre-wrap leading-relaxed">
            {script.content}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>No life script written yet.</p>
            <button onClick={startEditing} className="mt-2 text-primary hover:underline text-sm">
              Write your script
            </button>
          </div>
        )}

        {/* Version history toggle */}
        {script && (
          <div className="mt-6 border-t pt-4">
            <button
              onClick={() => showVersions ? setShowVersions(false) : loadVersions()}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <RotateCcw className="size-3" />
              Version History
              {showVersions ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
            </button>

            {showVersions && (
              <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
                {versions.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No previous versions.</p>
                ) : (
                  versions.map((v) => (
                    <div key={v.id} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                      <div>
                        <p className="text-xs font-medium">{formatTimestamp(v.savedAt)}</p>
                        <p className="text-[11px] text-muted-foreground truncate max-w-md">
                          {v.content.slice(0, 100)}...
                        </p>
                      </div>
                      <button
                        onClick={() => handleRestore(v.id)}
                        className="text-xs text-primary hover:underline shrink-0 ml-3"
                      >
                        Restore
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </GlassCardContent>
    </GlassCard>
  );
}

export function LifeScriptPage() {
  const { user } = useUser();

  return (
    <DashboardLayout title="Life Script">
      <div className="space-y-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Life Script</h1>
          <p className="text-muted-foreground">
            Your personal declaration — speak life over your future
          </p>
        </div>

        {/* Show current user's script first, then partner's */}
        {user === "emily" ? (
          <>
            <ScriptSection owner="emily" label="Emily" />
            <ScriptSection owner="ryan" label="Ryan" />
          </>
        ) : (
          <>
            <ScriptSection owner="ryan" label="Ryan" />
            <ScriptSection owner="emily" label="Emily" />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
