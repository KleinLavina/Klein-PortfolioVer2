import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type SkillLevel = 1 | 2 | 3 | 4;

interface SkillIndicatorProps {
  level: SkillLevel;
  className?: string;
}

const levelColors = {
  1: "bg-green-500 shadow-green-500/50",
  2: "bg-yellow-500 shadow-yellow-500/50",
  3: "bg-orange-500 shadow-orange-500/50",
  4: "bg-red-500 shadow-red-500/50",
};

const levelLabels = {
  1: "Basic Knowledge",
  2: "Moderate",
  3: "Advanced",
  4: "Expert",
};

export function SkillIndicator({ level, className }: SkillIndicatorProps) {
  return (
    <div className={cn("flex gap-1.5", className)}>
      {[1, 2, 3, 4].map((bar) => (
        <motion.div
          key={bar}
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true }}
          transition={{ delay: bar * 0.1, duration: 0.3 }}
          className={cn(
            "h-1 flex-1 rounded-full transition-all duration-300",
            bar <= level
              ? cn(levelColors[level], "shadow-md")
              : "bg-muted/30 dark:bg-muted/20"
          )}
        />
      ))}
    </div>
  );
}

export function SkillLegend() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="mb-8 p-6 rounded-3xl glass-card"
    >
      <h3 className="text-lg font-bold text-foreground mb-4">Skill Level Legend</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((level) => (
          <div key={level} className="flex items-center gap-3">
            <div className="flex gap-1 w-16">
              {[1, 2, 3, 4].map((bar) => (
                <div
                  key={bar}
                  className={cn(
                    "h-1 flex-1 rounded-full",
                    bar <= level
                      ? cn(levelColors[level as SkillLevel], "shadow-sm")
                      : "bg-muted/30 dark:bg-muted/20"
                  )}
                />
              ))}
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              {levelLabels[level as SkillLevel]}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
