import { AlertTriangle, Shield, Wrench, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AppNotification } from "@/hooks/useNotifications";

interface NotificationItemProps {
  notification: AppNotification;
  onDismiss: (id: string) => void;
  onClick: (href: string) => void;
}

const typeIcons = {
  "task-overdue": AlertTriangle,
  "warranty-expiring": Shield,
  "service-due": Wrench,
} as const;

export function NotificationItem({ notification, onDismiss, onClick }: NotificationItemProps) {
  const Icon = typeIcons[notification.type];
  const iconColour = notification.severity === "critical"
    ? "text-destructive"
    : "text-amber-500";

  return (
    <div
      className="flex items-start gap-3 px-4 py-3 hover:bg-muted/50 cursor-pointer border-b last:border-b-0 transition-colors"
      onClick={() => onClick(notification.href)}
    >
      <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${iconColour}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{notification.title}</p>
        <p className="text-xs text-muted-foreground">{notification.description}</p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 shrink-0"
        onClick={(e) => {
          e.stopPropagation();
          onDismiss(notification.id);
        }}
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
