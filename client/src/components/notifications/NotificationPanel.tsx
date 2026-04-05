import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NotificationItem } from "./NotificationItem";
import type { AppNotification } from "@/hooks/useNotifications";

interface NotificationPanelProps {
  notifications: AppNotification[];
  onDismiss: (id: string) => void;
  onClearAll: () => void;
  onNavigate: (href: string) => void;
}

export function NotificationPanel({
  notifications,
  onDismiss,
  onClearAll,
  onNavigate,
}: NotificationPanelProps) {
  return (
    <div>
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="text-sm font-semibold">Notifications</h3>
        {notifications.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-auto px-2 py-1 text-xs text-muted-foreground"
            onClick={onClearAll}
          >
            Clear all
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="px-4 py-8 text-center text-sm text-muted-foreground">
          All caught up!
        </div>
      ) : (
        <ScrollArea className="max-h-80">
          {notifications.map((n) => (
            <NotificationItem
              key={n.id}
              notification={n}
              onDismiss={onDismiss}
              onClick={onNavigate}
            />
          ))}
        </ScrollArea>
      )}
    </div>
  );
}
