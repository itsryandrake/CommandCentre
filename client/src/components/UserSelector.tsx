import { useUser, type FamilyUser } from "@/context/UserContext";
import { User } from "lucide-react";

const users: { id: FamilyUser; name: string; initials: string }[] = [
  { id: "ryan", name: "Ryan", initials: "RD" },
  { id: "emily", name: "Emily", initials: "ED" },
];

export function UserSelector() {
  const { user, setUser } = useUser();

  return (
    <div className="flex items-center gap-2 px-2">
      {users.map((u) => (
        <button
          key={u.id}
          onClick={() => setUser(u.id)}
          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
            user === u.id
              ? "bg-primary/10 text-primary font-medium"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <div
            className={`flex size-7 items-center justify-center rounded-full text-xs font-medium ${
              user === u.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted-foreground/20 text-muted-foreground"
            }`}
          >
            {u.initials}
          </div>
          <span className="group-data-[collapsible=icon]:hidden">{u.name}</span>
        </button>
      ))}
    </div>
  );
}

export function UserPickerOverlay() {
  const { user, setUser } = useUser();

  if (user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border bg-card p-8 shadow-lg">
        <h2 className="text-2xl font-normal text-center mb-2">Welcome</h2>
        <p className="text-muted-foreground text-center mb-8">Who's using the CommandCentre?</p>
        <div className="flex gap-4 justify-center">
          {users.map((u) => (
            <button
              key={u.id}
              onClick={() => setUser(u.id)}
              className="flex flex-col items-center gap-3 rounded-xl border border-border/50 p-6 hover:bg-muted transition-colors min-w-[120px]"
            >
              <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary text-xl font-medium">
                {u.initials}
              </div>
              <span className="text-lg font-medium">{u.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
