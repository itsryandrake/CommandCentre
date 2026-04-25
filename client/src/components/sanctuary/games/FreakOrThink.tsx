import { useState, useEffect, useCallback, useRef } from "react";
import { freaks, thinks, type FreakOrThinkCard } from "@/data/sanctuary/freakOrThinkData";
import {
  GlassCard,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardContent,
} from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type GamePhase = "idle" | "playing" | "results";

const QUESTIONS_PER_ROUND = 10;
const TIMER_SECONDS = 10;

function shuffleArray<T>(arr: readonly T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

interface Question {
  card: FreakOrThinkCard;
  type: "freak" | "think";
}

function buildQuestionDeck(): Question[] {
  const shuffledFreaks = shuffleArray(freaks);
  const shuffledThinks = shuffleArray(thinks);
  const deck: Question[] = [];

  for (let i = 0; i < QUESTIONS_PER_ROUND; i++) {
    if (i % 2 === 0 && shuffledFreaks.length > 0) {
      deck.push({ card: shuffledFreaks.pop()!, type: "freak" });
    } else if (shuffledThinks.length > 0) {
      deck.push({ card: shuffledThinks.pop()!, type: "think" });
    } else if (shuffledFreaks.length > 0) {
      deck.push({ card: shuffledFreaks.pop()!, type: "freak" });
    }
  }

  return deck;
}

export function FreakOrThink() {
  const [phase, setPhase] = useState<GamePhase>("idle");
  const [deck, setDeck] = useState<Question[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentQuestion = deck[questionIndex] ?? null;

  // Timer logic
  useEffect(() => {
    if (phase !== "playing" || !currentQuestion) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time ran out — wrong answer
          advanceQuestion(false);
          return TIMER_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, questionIndex]);

  const advanceQuestion = useCallback(
    (correct: boolean) => {
      if (timerRef.current) clearInterval(timerRef.current);

      if (correct) setScore((prev) => prev + 1);

      if (questionIndex + 1 >= deck.length) {
        // Include this answer in final score
        if (correct) {
          setScore((prev) => {
            // Already incremented above, so just transition
            return prev;
          });
        }
        setPhase("results");
      } else {
        setQuestionIndex((prev) => prev + 1);
        setTimeLeft(TIMER_SECONDS);
      }
    },
    [questionIndex, deck.length]
  );

  const startGame = useCallback(() => {
    const newDeck = buildQuestionDeck();
    setDeck(newDeck);
    setQuestionIndex(0);
    setScore(0);
    setTimeLeft(TIMER_SECONDS);
    setPhase("playing");
  }, []);

  const handleAnswer = useCallback(
    (choice: "freak" | "think") => {
      if (!currentQuestion) return;
      const correct = choice === currentQuestion.type;
      advanceQuestion(correct);
    },
    [currentQuestion, advanceQuestion]
  );

  const timerPercent = (timeLeft / TIMER_SECONDS) * 100;

  return (
    <div className="flex flex-col items-center gap-6">
      {phase === "idle" && (
        <GlassCard className="w-full max-w-md border-primary/30">
          <GlassCardHeader className="text-center">
            <GlassCardTitle className="text-primary">
              Freak or Think
            </GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent className="flex flex-col items-center gap-4">
            <p className="text-sm text-muted-foreground text-center">
              You'll be shown a card — is it a <strong className="text-primary">Freak</strong>{" "}
              (dare/challenge) or a <strong className="text-primary">Think</strong>{" "}
              (truth/question)? Answer before the timer runs out!
            </p>
            <p className="text-xs text-muted-foreground text-center">
              {QUESTIONS_PER_ROUND} questions per round &middot; {TIMER_SECONDS}s per question
            </p>
            <Button
              onClick={startGame}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Start
            </Button>
          </GlassCardContent>
        </GlassCard>
      )}

      {phase === "playing" && currentQuestion && (
        <GlassCard className="w-full max-w-md border-primary/30">
          <GlassCardHeader>
            <div className="flex items-center justify-between w-full">
              <GlassCardTitle className="text-primary text-sm">
                Question {questionIndex + 1}/{deck.length}
              </GlassCardTitle>
              <Badge variant="outline" className="border-primary/30 text-primary">
                Score: {score}
              </Badge>
            </div>
            {/* Timer bar */}
            <div className="w-full h-2 bg-white/10 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${timerPercent}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground text-right mt-1">{timeLeft}s</p>
          </GlassCardHeader>
          <GlassCardContent className="flex flex-col items-center gap-6">
            <p className="text-center text-foreground/90 text-base leading-relaxed min-h-[5rem] flex items-center">
              {currentQuestion.card.text}
            </p>

            <div className="flex gap-4 w-full">
              <Button
                onClick={() => handleAnswer("freak")}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Freak
              </Button>
              <Button
                onClick={() => handleAnswer("think")}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Think
              </Button>
            </div>
          </GlassCardContent>
        </GlassCard>
      )}

      {phase === "results" && (
        <GlassCard className="w-full max-w-md border-primary/30">
          <GlassCardHeader className="text-center">
            <GlassCardTitle className="text-primary">
              Results
            </GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent className="flex flex-col items-center gap-4">
            <p className="text-4xl font-bold stat-number text-foreground">
              {score} / {deck.length}
            </p>
            <p className="text-sm text-muted-foreground">
              {score === deck.length
                ? "Perfect! You really know your stuff."
                : score >= deck.length * 0.7
                  ? "Nice work — you've got a good feel for this."
                  : "Better luck next round!"}
            </p>
            <Button
              onClick={startGame}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Play Again
            </Button>
          </GlassCardContent>
        </GlassCard>
      )}
    </div>
  );
}
