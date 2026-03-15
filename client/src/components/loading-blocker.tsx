import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

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

export function LoadingBlocker({ isLoaded, onComplete }: Props) {
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    if (isLoaded) return;

    setPhraseIndex(0);
    const timers: ReturnType<typeof setTimeout>[] = [];

    HELLO_WORLD_PHRASES.forEach((_, i) => {
      if (i === 0) return;
      const delay = getDelay(i);
      const t = setTimeout(() => setPhraseIndex(i), delay);
      timers.push(t);
    });

    // After the last phrase has been shown for 900ms, trigger completion
    const lastDelay = getDelay(HELLO_WORLD_PHRASES.length - 1) + 900;
    const doneTimer = setTimeout(() => onComplete(), lastDelay);
    timers.push(doneTimer);

    return () => timers.forEach(clearTimeout);
  }, [isLoaded, onComplete]);

  const currentPhrase = HELLO_WORLD_PHRASES[phraseIndex];
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

            {/* Animated KL Monogram */}
            <div className="relative flex items-center justify-center">
              <motion.div
                className="absolute w-28 h-28 rounded-full border-2 border-primary/20"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, ease: "linear", repeat: Infinity }}
              />
              <motion.div
                className="absolute w-20 h-20 rounded-full border border-secondary/30"
                animate={{ rotate: -360 }}
                transition={{ duration: 5, ease: "linear", repeat: Infinity }}
              />
              <motion.div
                className="absolute w-28 h-28"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, ease: "linear", repeat: Infinity }}
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_10px_rgba(53,211,97,0.8)]" />
              </motion.div>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-14 h-14 flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/10 border border-primary/20 shadow-[0_0_30px_rgba(53,211,97,0.15)]"
              >
                <span className="text-xl font-black tracking-tighter text-gradient">KL</span>
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

            {/* Shimmer bar */}
            <div className="w-48 h-[3px] rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-primary via-secondary to-accent"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
