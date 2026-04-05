import { useState } from "react";
import {
  GlassCard,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardContent,
} from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { dateNightContent } from "@/data/sanctuary/dateNightContent";

type Location = "home" | "out" | "away";
type Intensity = "romantic" | "playful" | "passionate" | "adventurous";

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function DateNightGenerator() {
  const [location, setLocation] = useState<Location | "">("");
  const [intensity, setIntensity] = useState<Intensity | "">("");
  const [result, setResult] = useState<{
    plan: string;
    conversation: string;
    firestarter: string;
  } | null>(null);

  const generate = () => {
    if (!location || !intensity) return;

    const plans = dateNightContent.plans[location]?.[intensity] ?? [];
    const plan = plans.length > 0 ? getRandomItem(plans) : "No plans found for this combination.";
    const conversation = getRandomItem(dateNightContent.conversations);
    const firestarter = getRandomItem(dateNightContent.firestarters);

    setResult({ plan, conversation, firestarter });
  };

  const canGenerate = location !== "" && intensity !== "";

  return (
    <div className="space-y-6">
      <GlassCard>
        <GlassCardHeader>
          <GlassCardTitle>Date Night Generator</GlassCardTitle>
        </GlassCardHeader>
        <GlassCardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">Location</label>
              <Select value={location} onValueChange={(val) => setLocation(val as Location)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose location..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home">Home</SelectItem>
                  <SelectItem value="out">Going Out</SelectItem>
                  <SelectItem value="away">Away</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">Intensity</label>
              <Select value={intensity} onValueChange={(val) => setIntensity(val as Intensity)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose intensity..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="romantic">Romantic</SelectItem>
                  <SelectItem value="playful">Playful</SelectItem>
                  <SelectItem value="passionate">Passionate</SelectItem>
                  <SelectItem value="adventurous">Adventurous</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={generate}
            disabled={!canGenerate}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Generate
          </Button>
        </GlassCardContent>
      </GlassCard>

      {result && (
        <div className="space-y-4">
          <GlassCard>
            <GlassCardHeader>
              <GlassCardTitle className="flex items-center gap-2">
                Date Plan
                <Badge className="bg-primary/20 text-primary border-primary/30">
                  {location} · {intensity}
                </Badge>
              </GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent>
              <p className="text-white/90 leading-relaxed">{result.plan}</p>
            </GlassCardContent>
          </GlassCard>

          <GlassCard>
            <GlassCardHeader>
              <GlassCardTitle>Conversation Starter</GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent>
              <p className="text-white/90 italic leading-relaxed">"{result.conversation}"</p>
            </GlassCardContent>
          </GlassCard>

          <GlassCard>
            <GlassCardHeader>
              <GlassCardTitle>Firestarter</GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent>
              <p className="text-white/90 italic leading-relaxed">"{result.firestarter}"</p>
            </GlassCardContent>
          </GlassCard>

          <Button
            onClick={generate}
            variant="outline"
            className="w-full border-primary/30 text-primary hover:bg-primary/10"
          >
            Generate Again
          </Button>
        </div>
      )}
    </div>
  );
}
