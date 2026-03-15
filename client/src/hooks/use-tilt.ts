import { useRef, useCallback } from "react";

export function useTilt(maxDeg = 6) {
  const ref = useRef<HTMLElement>(null);
  const rafRef = useRef<number | null>(null);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    const rotX = -y * maxDeg;
    const rotY = x * maxDeg;
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      if (ref.current) {
        ref.current.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02, 1.02, 1.02)`;
        ref.current.style.transition = "transform 0.1s ease-out";
      }
    });
  }, [maxDeg]);

  const onMouseLeave = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    if (ref.current) {
      ref.current.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
      ref.current.style.transition = "transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
    }
  }, []);

  return { ref, onMouseMove, onMouseLeave } as {
    ref: React.RefObject<HTMLElement>;
    onMouseMove: (e: React.MouseEvent) => void;
    onMouseLeave: () => void;
  };
}
