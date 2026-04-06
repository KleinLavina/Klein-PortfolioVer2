import { motion, AnimatePresence, useMotionValue, animate } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import { LoadingBlockerMorph } from "@/components/loading-blocker-morph";
import Ripple from "@/components/ui/ripple";

const HELLO_WORLD_PHRASES = [
  { text: "Hello World!!", lang: "English" },
  { text: "你好世界!!", lang: "Chinese" },
  { text: "¡Hola Mundo!!", lang: "Spanish" },
  { text: "مرحبا بالعالم!!", lang: "Arabic" },
  { text: "नमस्ते दुनिया!!", lang: "Hindi" },
  { text: "Kumusta Kalibutan!!", lang: "Bisaya" },
  { text: "Bonjour le Monde!!", lang: "French" },
  { text: "Привет Мир!!", lang: "Russian" },
  { text: "こんにちは世界!!", lang: "Japanese" },
  { text: "Kumusta Mundo!!", lang: "Filipino" },
];

const BASE_DURATION = 800;
const SPEED_FACTOR = 0.68;
const SEGMENT_COUNT = 6;

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getDelay(index: number): number {
  let delay = 0;
  for (let i = 0; i < index; i++) {
    delay += BASE_DURATION * Math.pow(SPEED_FACTOR, i);
  }
  return delay;
}

type Props = {
  isLoaded: boolean;
  onComplete: () => void;
};

const LAST_PAUSE = 450;

export function LoadingBlocker({ isLoaded, onComplete }: Props) {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayPct, setDisplayPct] = useState(0);
  const progress = useMotionValue(0);

  // Randomize the phrases order each time the component mounts
  const randomizedPhrases = useMemo(() => shuffleArray(HELLO_WORLD_PHRASES), []);
  const TOTAL_DURATION = getDelay(randomizedPhrases.length - 1) + LAST_PAUSE;

  useEffect(() => {
    if (isLoaded) return;

    setPhraseIndex(0);
    progress.set(0);
    setDisplayPct(0);

    const timers: ReturnType<typeof setTimeout>[] = [];

    // Schedule language switches
    randomizedPhrases.forEach((_, i) => {
      if (i === 0) return;
      const t = setTimeout(() => setPhraseIndex(i), getDelay(i));
      timers.push(t);
    });

    // Animate progress bar 0 → 100 over total duration
    const controls = animate(progress, 100, {
      duration: TOTAL_DURATION / 1000,
      ease: "linear",
      onUpdate: (v) => setDisplayPct(Math.round(v)),
    });

    // Dismiss when complete
    const doneTimer = setTimeout(() => onComplete(), TOTAL_DURATION);
    timers.push(doneTimer);

    return () => {
      timers.forEach(clearTimeout);
      controls.stop();
    };
  }, [isLoaded, onComplete, progress, randomizedPhrases, TOTAL_DURATION]);

  const currentPhrase = randomizedPhrases[phraseIndex];
  const isRTL = currentPhrase.lang === "Arabic";
  const filledSegments = Math.round((displayPct / 100) * SEGMENT_COUNT);

  return (
    <AnimatePresence>
      {!isLoaded && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{
            y: "-100%",
            transition: { duration: 1.35, ease: [0.16, 1, 0.3, 1] },
          }}
          className="fixed inset-0 z-[100] bg-background overflow-hidden"
        >
          {/* Ripple Background */}
          <Ripple
            origin="top-left"
            showOverlay={false}
            mainCircleSize={560}
            circleGap={120}
            originOffsetX="-3.5rem"
            originOffsetY="-3.5rem"
            className="pointer-events-none absolute inset-0"
          />

          <LoadingBlockerMorph />

          <div className="fixed bottom-8 right-8 z-10 flex flex-col items-end gap-4 text-right">
            {/* Animated Pet GIF */}
            <div className="relative flex items-center justify-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-24 h-24 flex items-center justify-center"
              >
                <img 
                  src="/ezgif-61ee79b0fb3d6b0b.gif" 
                  alt="Loading pet"
                  className="w-full h-full object-contain"
                  style={{ backgroundColor: 'transparent' }}
                />
              </motion.div>
            </div>

            {/* Progress bar + percentage */}
            <div className="flex w-[176px] flex-col items-end gap-2">
              <div className="flex w-full items-center justify-end gap-[2px]">
                {Array.from({ length: SEGMENT_COUNT }, (_, index) => {
                  const isFilled = index < filledSegments;
                  return (
                    <div
                      key={index}
                      className={
                        isFilled
                          ? "h-2 flex-1 rounded-[2px] border border-primary/75 bg-primary shadow-[0_0_10px_hsl(var(--primary)/0.22)]"
                          : "h-2 flex-1 rounded-[2px] border border-border/35 bg-background"
                      }
                    />
                  );
                })}
              </div>
              <span className="text-[11px] font-mono font-semibold tabular-nums uppercase tracking-[0.24em] text-muted-foreground">
                {displayPct}%
              </span>
            </div>

            {/* Language phrase */}
            <div className="flex min-h-[3.2rem] w-[176px] items-start justify-end">
              <AnimatePresence mode="wait">
                <motion.div
                  key={phraseIndex}
                  initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                  dir={isRTL ? "rtl" : "ltr"}
                  className="flex w-full justify-end"
                >
                  <h1 className="max-w-[176px] text-[1.05rem] font-black leading-tight tracking-tight text-foreground sm:text-[1.15rem]">
                    {currentPhrase.text}
                  </h1>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
