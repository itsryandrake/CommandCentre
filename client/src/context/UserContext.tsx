import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type FamilyUser = "ryan" | "emily";

interface UserContextValue {
  user: FamilyUser | null;
  userName: string;
  setUser: (user: FamilyUser) => void;
}

const UserContext = createContext<UserContextValue | null>(null);

const STORAGE_KEY = "drake_active_user";

const USER_NAMES: Record<FamilyUser, string> = {
  ryan: "Ryan",
  emily: "Emily",
};

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<FamilyUser | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "ryan" || stored === "emily") return stored;
    return null;
  });

  const setUser = (u: FamilyUser) => {
    setUserState(u);
    localStorage.setItem(STORAGE_KEY, u);
  };

  const userName = user ? USER_NAMES[user] : "";

  return (
    <UserContext.Provider value={{ user, userName, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
