import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useState, useMemo } from "react";

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

const BASE_DURATION = 1200;
const SPEED_FACTOR = 0.75;

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

const LAST_PAUSE = 900;

export function LoadingBlocker({ isLoaded, onComplete }: Props) {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayPct, setDisplayPct] = useState(0);
  const progress = useMotionValue(0);
  const barWidth = useTransform(progress, [0, 100], ["0%", "100%"]);

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

  return (
    <AnimatePresence>
      {!isLoaded && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.9, ease: "easeInOut" } }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background overflow-hidden"
        >
          {/* Ambient glow blobs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full filter blur-3xl animate-blob pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full filter blur-3xl animate-blob animation-delay-2000 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full filter blur-3xl pointer-events-none" />

          <div className="relative flex flex-col items-center gap-10 px-6 text-center">

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

            {/* Language phrase */}
            <div className="flex flex-col items-center gap-3 min-h-[120px] justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={phraseIndex}
                  initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -16, filter: "blur(6px)" }}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                  dir={isRTL ? "rtl" : "ltr"}
                  className="flex flex-col items-center gap-2"
                >
                  <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-foreground leading-none">
                    {currentPhrase.text}
                  </h1>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Progress bar + percentage */}
            <div className="flex flex-col items-center gap-2 w-64">
              <div className="w-full h-[4px] rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-primary via-secondary to-accent"
                  style={{ width: barWidth }}
                />
              </div>
              <span className="text-xs font-bold tabular-nums text-muted-foreground tracking-widest">
                {displayPct}%
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
