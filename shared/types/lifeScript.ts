export interface LifeScript {
  id: string;
  owner: "ryan" | "emily";
  title: string;
  content: string;
  updatedAt: string;
  createdAt: string;
}

export interface LifeScriptVersion {
  id: string;
  scriptId: string;
  content: string;
  savedAt: string;
}

export interface UpdateLifeScriptInput {
  title?: string;
  content?: string;
}
