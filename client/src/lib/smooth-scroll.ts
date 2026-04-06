const DEFAULT_DURATION_MS = 700;

function easeInOutCubic(value: number) {
  return value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

function getScrollRoot() {
  const main = document.querySelector("main");
  return main instanceof HTMLElement ? main : window;
}

function getCurrentScrollTop(root: HTMLElement | Window) {
  return root instanceof Window ? root.scrollY : root.scrollTop;
}

function setCurrentScrollTop(root: HTMLElement | Window, value: number) {
  if (root instanceof Window) {
    root.scrollTo({ top: value, behavior: "auto" });
    return;
  }

  root.scrollTop = value;
}

function getTargetTop(target: HTMLElement, root: HTMLElement | Window, offset: number) {
  if (root instanceof Window) {
    return Math.max(0, target.getBoundingClientRect().top + window.scrollY - offset);
  }

  return Math.max(0, target.offsetTop - offset);
}

type SmoothScrollOptions = {
  durationMs?: number;
  offset?: number;
};

export function smoothScrollToTarget(
  target: HTMLElement,
  { durationMs = DEFAULT_DURATION_MS, offset = 0 }: SmoothScrollOptions = {},
) {
  const root = getScrollRoot();
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const startTop = getCurrentScrollTop(root);
  const targetTop = getTargetTop(target, root, offset);

  if (prefersReducedMotion || durationMs <= 0 || Math.abs(targetTop - startTop) < 1) {
    setCurrentScrollTop(root, targetTop);
    return;
  }

  const startTime = performance.now();

  const step = (now: number) => {
    const elapsed = now - startTime;
    const progress = Math.min(1, elapsed / durationMs);
    const easedProgress = easeInOutCubic(progress);
    const nextTop = startTop + (targetTop - startTop) * easedProgress;

    setCurrentScrollTop(root, nextTop);

    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };

  window.requestAnimationFrame(step);
}
