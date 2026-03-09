import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SectionProps {
  id: string;
  className?: string;
  children: ReactNode;
}

export function Section({ id, className, children }: SectionProps) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn("min-h-screen py-20 flex flex-col justify-center", className)}
    >
      {children}
    </motion.section>
  );
}

export function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-12 relative">
      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.4 }}
        className="text-4xl md:text-5xl font-black text-foreground"
      >
        {title}
        <span className="text-primary text-5xl leading-none">.</span>
      </motion.h2>
      {subtitle && (
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="mt-4 text-lg text-muted-foreground max-w-2xl"
        >
          {subtitle}
        </motion.p>
      )}
      <div className="absolute -left-4 top-2 bottom-2 w-1 bg-gradient-brand rounded-full hidden md:block"></div>
    </div>
  );
}
