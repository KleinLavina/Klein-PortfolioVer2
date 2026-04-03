import { useEffect, useRef } from "react";

const INTERACTIVE = [
  "a",
  "button",
  "label",
  "input",
  "textarea",
  "select",
  "[role='button']",
  "[tabindex]",
  "h1",
  "h2",
  "h3",
  "p",
  "span",
  "li",
  "[data-cursor]",
].join(", ");

const POSITION_LERP = 0.22;
const ROTATION_LERP = 0.2;
const SNAP_DISTANCE = 0.45;
const IDLE_ANGLE_EPSILON = 0.35;
const DEFAULT_ANGLE = 0;
const DEFAULT_SCALE = 1;
const HOVER_SCALE = 1.05;
const HEAD_OFFSET_X = 24;
const HEAD_OFFSET_Y = 14;

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -120, y: -120 });
  const rendered = useRef({ x: -120, y: -120 });
  const scaleRef = useRef(DEFAULT_SCALE);
  const angleRef = useRef(DEFAULT_ANGLE);
  const targetAngleRef = useRef(DEFAULT_ANGLE);
  const rafRef = useRef<number | null>(null);
  const hiddenRef = useRef(true);
  const hoveredRef = useRef(false);
  const lastPointerRef = useRef({ x: -120, y: -120 });

  useEffect(() => {
    const cursorEl = cursorRef.current;
    if (!cursorEl) return;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const lerpAngle = (from: number, to: number, amount: number) => {
      let delta = ((to - from + 540) % 360) - 180;
      return from + delta * amount;
    };

    const applyAppearance = () => {
      cursorEl.style.opacity = hiddenRef.current ? "0" : "1";
      scaleRef.current = hoveredRef.current ? HOVER_SCALE : DEFAULT_SCALE;
    };

    const updateHovered = (target: EventTarget | null) => {
      const isInteractive =
        target instanceof Element && Boolean(target.closest(INTERACTIVE));

      if (hoveredRef.current !== isInteractive) {
        hoveredRef.current = isInteractive;
        applyAppearance();
        ensureAnimation();
      }
    };

    const tick = () => {
      rendered.current.x = lerp(rendered.current.x, pos.current.x, POSITION_LERP);
      rendered.current.y = lerp(rendered.current.y, pos.current.y, POSITION_LERP);
      angleRef.current = lerpAngle(angleRef.current, targetAngleRef.current, ROTATION_LERP);

      cursorEl.style.transform =
        `translate3d(${rendered.current.x}px, ${rendered.current.y}px, 0) translate(-${HEAD_OFFSET_X}px, -${HEAD_OFFSET_Y}px) rotate(${angleRef.current}deg) scale(${scaleRef.current})`;

      const dx = pos.current.x - rendered.current.x;
      const dy = pos.current.y - rendered.current.y;
      const distance = Math.hypot(dx, dy);
      const angleDelta = Math.abs((((targetAngleRef.current - angleRef.current) % 360) + 540) % 360 - 180);

      if (!hiddenRef.current && (distance > SNAP_DISTANCE || angleDelta > IDLE_ANGLE_EPSILON)) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      rafRef.current = null;
    };

    const ensureAnimation = () => {
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      const prev = lastPointerRef.current;
      pos.current.x = e.clientX;
      pos.current.y = e.clientY;

      const moveX = e.clientX - prev.x;
      const moveY = e.clientY - prev.y;
      if (Math.abs(moveX) > 0.01 || Math.abs(moveY) > 0.01) {
        targetAngleRef.current = (Math.atan2(moveY, moveX) * 180) / Math.PI;
      }

      lastPointerRef.current = { x: e.clientX, y: e.clientY };

      if (hiddenRef.current) {
        hiddenRef.current = false;
        rendered.current.x = e.clientX;
        rendered.current.y = e.clientY;
        angleRef.current = targetAngleRef.current;
        applyAppearance();
      }

      ensureAnimation();
    };

    const onPointerOver = (e: PointerEvent) => {
      updateHovered(e.target);
    };

    const onPointerOut = (e: PointerEvent) => {
      updateHovered(e.relatedTarget);
    };

    const onLeave = () => {
      if (!hiddenRef.current) {
        hiddenRef.current = true;
        applyAppearance();
      }
    };

    const onEnter = () => {
      if (hiddenRef.current) {
        hiddenRef.current = false;
        applyAppearance();
        ensureAnimation();
      }
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        onLeave();
      }
    };

    applyAppearance();

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerover", onPointerOver, { passive: true });
    document.addEventListener("pointerout", onPointerOut, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);
    window.addEventListener("blur", onLeave);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerover", onPointerOver);
      document.removeEventListener("pointerout", onPointerOut);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      window.removeEventListener("blur", onLeave);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
    return null;
  }

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      className="fixed top-0 left-0 pointer-events-none z-[9999] will-change-transform transform-gpu"
      style={{
        opacity: 0,
        transform: `translate3d(-120px, -120px, 0) translate(-${HEAD_OFFSET_X}px, -${HEAD_OFFSET_Y}px) rotate(${DEFAULT_ANGLE}deg) scale(1)`,
        transition: "opacity 0.15s ease-out",
      }}
    >
      <div
        className="absolute inset-0 rounded-full blur-xl"
        style={{
          background: "hsl(var(--primary) / 0.15)",
          transform: "translate(-1px, 1px) scale(0.78)",
        }}
      />
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: "visible" }}
      >
        <path
          d="M4.25 4.4L24 14L4.25 23.6L9.15 14L4.25 4.4Z"
          fill="transparent"
          stroke="hsl(var(--primary))"
          strokeWidth="1.45"
          strokeLinejoin="round"
          strokeLinecap="round"
          style={{
            filter:
              "drop-shadow(0 0 2px hsl(var(--primary) / 0.98)) drop-shadow(0 0 7px hsl(var(--primary) / 0.85)) drop-shadow(0 0 16px hsl(var(--primary) / 0.42))",
          }}
        />
        <path
          d="M9.1 14L18.25 14M9.1 14L6.1 8.2M9.1 14L6.1 19.8"
          stroke="hsl(var(--primary) / 0.82)"
          strokeWidth="0.95"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            filter: "drop-shadow(0 0 6px hsl(var(--primary) / 0.4))",
          }}
        />
      </svg>
    </div>
  );
}
