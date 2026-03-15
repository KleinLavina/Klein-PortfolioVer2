import { useRef, useCallback } from "react";

export function useMagnetic(strength = 0.28) {
  const ref = useRef<HTMLElement>(null);
  const rafRef = useRef<number | null>(null);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * strength;
    const y = (e.clientY - rect.top - rect.height / 2) * strength;
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      if (ref.current) {
        ref.current.style.transform = `translate(${x}px, ${y}px)`;
        ref.current.style.transition = "transform 0.15s ease-out";
      }
    });
  }, [strength]);

  const onMouseLeave = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    if (ref.current) {
      ref.current.style.transform = "translate(0px, 0px)";
      ref.current.style.transition = "transform 0.55s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
    }
  }, []);

  return { ref, onMouseMove, onMouseLeave } as {
    ref: React.RefObject<HTMLElement>;
    onMouseMove: (e: React.MouseEvent) => void;
    onMouseLeave: () => void;
  };
}
