import { useState, useEffect, useMemo } from "react";
import type {
  Contact,
  RelationshipType,
  RelationshipStatus,
  Child,
  Pet,
  CreateContactInput,
} from "@shared/types/crm";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Plus, Trash2, ChevronDown, X, Tag, Search, Users } from "lucide-react";

interface ContactFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Contact;
  onSave: (contact: CreateContactInput | Partial<Contact>) => Promise<void>;
  allContacts?: Contact[];
}

const CADENCE_OPTIONS = [30, 60, 90, 120, 150, 180];

const RELATIONSHIP_TYPES: RelationshipType[] = [
  "Family",
  "Friend",
  "Work-Friend",
  "Neighbour",
  "Acquaintance",
  "Other",
];

const RELATIONSHIP_STATUSES: RelationshipStatus[] = [
  "Single",
  "In a Relationship",
  "Engaged",
  "Married",
  "Divorced",
  "Widowed",
  "It's Complicated",
];

const DIETARY_OPTIONS = [
  "Vegetarian", "Vegan", "Gluten Free", "Keto", "Paleo",
  "Dairy Free", "Nut Free", "Halal", "Kosher",
];

const LOVE_LANGUAGES = [
  "Words of Affirmation", "Acts of Service", "Receiving Gifts",
  "Quality Time", "Physical Touch",
];

const LANGUAGE_OPTIONS = [
  "English", "Hindi", "Chinese", "French", "Spanish",
  "Italian", "German", "Portuguese", "Arabic", "Swedish", "Dutch",
];

const MBTI_TYPES = [
  "ISTJ", "ISFJ", "INFJ", "INTJ", "ISTP", "ISFP", "INFP", "INTP",
  "ESTP", "ESFP", "ENFP", "ENTP", "ESTJ", "ESFJ", "ENFJ", "ENTJ",
];

const HUMAN_DESIGN_TYPES = [
  "Manifestor", "Generator", "Manifesting Generator", "Projector", "Reflector",
];

const emptyForm: Partial<Contact> = {
  fullName: "",
  relationshipType: "Friend",
  relationshipStrength: 5,
  cadenceDays: 30,
  isPinned: false,
  children: [],
  pets: [],
  dietary: [],
  loveLanguages: [],
  languages: [],
  friendIds: [],
  siblingIds: [],
  groups: [],
  socials: {},
};

export function ContactForm({
  open,
  onOpenChange,
  initialData,
  onSave,
  allContacts = [],
}: ContactFormProps) {
  const [formData, setFormData] = useState<Partial<Contact>>(emptyForm);
  const [newGroupTag, setNewGroupTag] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [siblingSearch, setSiblingSearch] = useState("");

  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData(initialData);
        setIsAdvanced(true);
      } else {
        setFormData(emptyForm);
        setIsAdvanced(false);
      }
      setSiblingSearch("");
    }
  }, [initialData, open]);

  const siblingResults = useMemo(() => {
    if (!siblingSearch.trim()) return [];
    const q = siblingSearch.toLowerCase();
    const currentSiblings = formData.siblingIds || [];
    return allContacts
      .filter(
        (c) =>
          c.id !== (initialData?.id || "") &&
          !currentSiblings.includes(c.id) &&
          c.fullName.toLowerCase().includes(q)
      )
      .slice(0, 5);
  }, [siblingSearch, allContacts, formData.siblingIds, initialData]);

  const addSibling = (contactId: string) => {
    handleChange("siblingIds", [...(formData.siblingIds || []), contactId]);
    setSiblingSearch("");
  };

  const removeSibling = (contactId: string) => {
    handleChange(
      "siblingIds",
      (formData.siblingIds || []).filter((id) => id !== contactId)
    );
  };

  const handleChange = (field: keyof Contact, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSocialChange = (network: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      socials: { ...prev.socials, [network]: value },
    }));
  };

  const toggleArrayItem = (
    field: "dietary" | "loveLanguages" | "languages",
    item: string
  ) => {
    const current = (formData[field] as string[]) || [];
    if (current.includes(item)) {
      handleChange(field, current.filter((i) => i !== item));
    } else {
      handleChange(field, [...current, item]);
    }
  };

  const addChild = () => {
    const newChild: Child = {
      id: Math.random().toString(36).substring(2, 11),
      name: "",
      dob: "",
    };
    handleChange("children", [...(formData.children || []), newChild]);
  };

  const updateChild = (id: string, field: keyof Child, value: string) => {
    const updated = (formData.children || []).map((c) =>
      c.id === id ? { ...c, [field]: value } : c
    );
    handleChange("children", updated);
  };

  const removeChild = (id: string) => {
    handleChange("children", (formData.children || []).filter((c) => c.id !== id));
  };

  const addPet = () => {
    const newPet: Pet = {
      id: Math.random().toString(36).substring(2, 11),
      name: "",
      type: "",
    };
    handleChange("pets", [...(formData.pets || []), newPet]);
  };

  const updatePet = (id: string, field: keyof Pet, value: string) => {
    const updated = (formData.pets || []).map((p) =>
      p.id === id ? { ...p, [field]: value } : p
    );
    handleChange("pets", updated);
  };

  const removePet = (id: string) => {
    handleChange("pets", (formData.pets || []).filter((p) => p.id !== id));
  };

  const addGroup = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newGroupTag.trim()) {
      e.preventDefault();
      if (!(formData.groups || []).includes(newGroupTag.trim())) {
        handleChange("groups", [...(formData.groups || []), newGroupTag.trim()]);
      }
      setNewGroupTag("");
    }
  };

  const removeGroup = (tag: string) => {
    handleChange("groups", (formData.groups || []).filter((g) => g !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName?.trim()) return;
    setIsSaving(true);
    try {
      await onSave(formData);
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              {initialData ? "Edit Contact" : "Add New Contact"}
            </DialogTitle>
            <button
              type="button"
              onClick={() => setIsAdvanced(!isAdvanced)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                isAdvanced
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted text-muted-foreground border-border hover:border-primary/50"
              }`}
            >
              Advanced
            </button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-sm font-medium mb-1.5 block">
                  Full Name *
                </label>
                <Input
                  required
                  value={formData.fullName || ""}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  placeholder="Name"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Type</label>
                <Select
                  value={formData.relationshipType || "Friend"}
                  onValueChange={(v) => handleChange("relationshipType", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RELATIONSHIP_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {isAdvanced && (
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Birthday
                  </label>
                  <Input
                    type="date"
                    value={formData.birthday || ""}
                    onChange={(e) => handleChange("birthday", e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Health Metrics */}
          {isAdvanced && (<>
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold text-sm">Health Metrics</h4>
            <div>
              <label className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Strength</span>
                <span>{formData.relationshipStrength}/10</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.relationshipStrength || 5}
                onChange={(e) =>
                  handleChange("relationshipStrength", parseInt(e.target.value))
                }
                className="w-full accent-primary h-2 bg-muted rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Cadence Target
              </label>
              <Select
                value={String(formData.cadenceDays || 30)}
                onValueChange={(v) => handleChange("cadenceDays", parseInt(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CADENCE_OPTIONS.map((days) => (
                    <SelectItem key={days} value={String(days)}>
                      Every {days} days
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm">Contact Details</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                type="email"
                placeholder="Email"
                value={formData.email || ""}
                onChange={(e) => handleChange("email", e.target.value)}
              />
              <Input
                type="tel"
                placeholder="Phone"
                value={formData.phone || ""}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
              <Input
                placeholder="Location"
                value={formData.location || ""}
                onChange={(e) => handleChange("location", e.target.value)}
              />
              <Input
                placeholder="Occupation"
                value={formData.occupation || ""}
                onChange={(e) => handleChange("occupation", e.target.value)}
              />
            </div>
          </div>

          {/* Social Media */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Social Media</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                placeholder="Instagram"
                value={formData.socials?.instagram || ""}
                onChange={(e) => handleSocialChange("instagram", e.target.value)}
              />
              <Input
                placeholder="Facebook"
                value={formData.socials?.facebook || ""}
                onChange={(e) => handleSocialChange("facebook", e.target.value)}
              />
              <Input
                placeholder="LinkedIn"
                value={formData.socials?.linkedin || ""}
                onChange={(e) => handleSocialChange("linkedin", e.target.value)}
              />
              <Input
                placeholder="X / Twitter"
                value={formData.socials?.x || ""}
                onChange={(e) => handleSocialChange("x", e.target.value)}
              />
              <Input
                placeholder="TikTok"
                value={formData.socials?.tiktok || ""}
                onChange={(e) => handleSocialChange("tiktok", e.target.value)}
              />
            </div>
          </div>

          {/* Groups */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Groups / Communities</h4>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.groups?.map((g) => (
                <span
                  key={g}
                  className="inline-flex items-center gap-1 pl-2 pr-1 py-1 rounded-md bg-muted text-sm"
                >
                  <Tag className="size-3" />
                  {g}
                  <button
                    type="button"
                    onClick={() => removeGroup(g)}
                    className="p-0.5 hover:bg-muted-foreground/20 rounded"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
            <Input
              value={newGroupTag}
              onChange={(e) => setNewGroupTag(e.target.value)}
              onKeyDown={addGroup}
              placeholder="Type group name and press Enter..."
            />
          </div>

          {/* Relationship Status */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Relationship Status</h4>
            <Select
              value={formData.relationshipStatus || ""}
              onValueChange={(v) => handleChange("relationshipStatus", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                {RELATIONSHIP_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Spouse / Partner Name"
              value={formData.spouseName || ""}
              onChange={(e) => handleChange("spouseName", e.target.value)}
            />
            {formData.relationshipStatus === "Married" && (
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">
                  Wedding Anniversary
                </label>
                <Input
                  type="date"
                  value={formData.weddingAnniversary || ""}
                  onChange={(e) =>
                    handleChange("weddingAnniversary", e.target.value)
                  }
                />
              </div>
            )}
          </div>

          {/* Personality & Lifestyle (collapsible) */}
          <Collapsible>
            <CollapsibleTrigger className="flex items-center gap-2 font-semibold text-sm w-full">
              <ChevronDown className="size-4" />
              Personality & Lifestyle
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-4">
              {/* Dietary */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Dietary Requirements
                </label>
                <div className="flex flex-wrap gap-2">
                  {DIETARY_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleArrayItem("dietary", opt)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        (formData.dietary || []).includes(opt)
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-background border-border hover:border-primary/50"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Love Languages */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Love Languages
                </label>
                <div className="flex flex-wrap gap-2">
                  {LOVE_LANGUAGES.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleArrayItem("loveLanguages", opt)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        (formData.loveLanguages || []).includes(opt)
                          ? "bg-pink-50 text-pink-700 border-pink-200"
                          : "bg-background border-border hover:border-primary/50"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Languages Spoken
                </label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGE_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleArrayItem("languages", opt)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        (formData.languages || []).includes(opt)
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-background border-border hover:border-primary/50"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* MBTI & Human Design */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Myers-Briggs
                  </label>
                  <Select
                    value={formData.myersBriggs || ""}
                    onValueChange={(v) => handleChange("myersBriggs", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {MBTI_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Human Design
                  </label>
                  <Select
                    value={formData.humanDesign || ""}
                    onValueChange={(v) => handleChange("humanDesign", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {HUMAN_DESIGN_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Children & Pets (collapsible) */}
          <Collapsible>
            <CollapsibleTrigger className="flex items-center gap-2 font-semibold text-sm w-full">
              <ChevronDown className="size-4" />
              Family & Pets
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-4">
              {/* Children */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Children</label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addChild}
                  >
                    <Plus className="size-4 mr-1" />
                    Add Child
                  </Button>
                </div>
                {formData.children?.map((child) => (
                  <div key={child.id} className="flex gap-2">
                    <Input
                      placeholder="Child Name"
                      value={child.name}
                      onChange={(e) =>
                        updateChild(child.id, "name", e.target.value)
                      }
                      className="flex-1"
                    />
                    <Input
                      type="date"
                      value={child.dob || ""}
                      onChange={(e) =>
                        updateChild(child.id, "dob", e.target.value)
                      }
                      className="w-36"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => removeChild(child.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Pets */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Pets</label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addPet}
                  >
                    <Plus className="size-4 mr-1" />
                    Add Pet
                  </Button>
                </div>
                {formData.pets?.map((pet) => (
                  <div key={pet.id} className="flex gap-2">
                    <Input
                      placeholder="Pet Name"
                      value={pet.name}
                      onChange={(e) =>
                        updatePet(pet.id, "name", e.target.value)
                      }
                      className="flex-1"
                    />
                    <Input
                      placeholder="Type (Dog, Cat...)"
                      value={pet.type}
                      onChange={(e) =>
                        updatePet(pet.id, "type", e.target.value)
                      }
                      className="w-36"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => removePet(pet.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Siblings */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium flex items-center gap-1.5">
                    <Users className="size-4" />
                    Siblings
                  </label>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(formData.siblingIds || []).map((sibId) => {
                    const sib = allContacts.find((c) => c.id === sibId);
                    return (
                      <span
                        key={sibId}
                        className="inline-flex items-center gap-1 pl-2 pr-1 py-1 rounded-md bg-muted text-sm"
                      >
                        {sib?.fullName || sibId}
                        <button
                          type="button"
                          onClick={() => removeSibling(sibId)}
                          className="p-0.5 hover:bg-muted-foreground/20 rounded"
                        >
                          <X className="size-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    value={siblingSearch}
                    onChange={(e) => setSiblingSearch(e.target.value)}
                    placeholder="Search contacts to link as sibling..."
                    className="pl-9"
                  />
                  {siblingResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-lg shadow-md overflow-hidden">
                      {siblingResults.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => addSibling(c.id)}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors"
                        >
                          {c.fullName}
                          <span className="text-muted-foreground ml-2 text-xs">
                            {c.relationshipType}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Context */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Context</h4>
            <Textarea
              placeholder="How we met..."
              rows={2}
              value={formData.howWeMet || ""}
              onChange={(e) => handleChange("howWeMet", e.target.value)}
            />
            <Textarea
              placeholder="General notes..."
              rows={3}
              value={formData.notes || ""}
              onChange={(e) => handleChange("notes", e.target.value)}
            />
          </div>

          {/* Avatar URL */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">
              Avatar URL
            </label>
            <Input
              type="url"
              placeholder="https://example.com/photo.jpg"
              value={formData.avatarUrl || ""}
              onChange={(e) => handleChange("avatarUrl", e.target.value)}
            />
          </div>
          </>
          )}

          <Button type="submit" className="w-full" disabled={isSaving}>
            {isSaving
              ? "Saving..."
              : initialData
                ? "Save Changes"
                : "Create Contact"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
