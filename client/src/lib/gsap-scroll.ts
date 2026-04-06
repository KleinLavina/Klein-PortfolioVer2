import gsap from "gsap";
import { Observer, ScrollSmoother, ScrollToPlugin, ScrollTrigger } from "gsap/all";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, Observer, ScrollSmoother);

let smoother: ScrollSmoother | null = null;
let observer: Observer | null = null;

function setDocumentScrollMeta(direction: "up" | "down", input: string) {
  document.documentElement.dataset.scrollDirection = direction;
  document.documentElement.dataset.scrollInput = input;
}

export function setupGsapScroll(
  wrapper: HTMLElement,
  content: HTMLElement,
): ScrollSmoother | null {
  destroyGsapScroll();

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  smoother = ScrollSmoother.create({
    wrapper,
    content,
    smooth: prefersReducedMotion ? 0 : 1.08,
    smoothTouch: 0.12,
    effects: false,
    normalizeScroll: true,
    ignoreMobileResize: true,
  });

  observer = Observer.create({
    target: window,
    type: "wheel,touch,pointer",
    tolerance: 3,
    onChangeY: (self) => {
      if (self.deltaY === 0) return;
      const eventType = self.event?.type ?? "wheel";
      setDocumentScrollMeta(self.deltaY > 0 ? "down" : "up", eventType);
    },
  });

  ScrollTrigger.refresh();
  return smoother;
}

export function destroyGsapScroll() {
  observer?.kill();
  observer = null;
  smoother?.kill();
  smoother = null;
  delete document.documentElement.dataset.scrollDirection;
  delete document.documentElement.dataset.scrollInput;
}

export function getScrollY(): number {
  return smoother ? smoother.scrollTop() : window.scrollY || window.pageYOffset || 0;
}

function resolveTargetY(target: string | Element, offset = 0): number | null {
  const element =
    typeof target === "string" ? document.querySelector(target) : target;

  if (!(element instanceof HTMLElement)) {
    return null;
  }

  const top = element.getBoundingClientRect().top + getScrollY() - offset;
  return Math.max(0, top);
}

type ScrollOptions = {
  offset?: number;
  duration?: number;
  ease?: string;
  immediate?: boolean;
  onComplete?: () => void;
};

export function scrollToTarget(
  target: string | Element,
  {
    offset = 0,
    duration = 1,
    ease = "power3.out",
    immediate = false,
    onComplete,
  }: ScrollOptions = {},
) {
  const targetY = resolveTargetY(target, offset);
  if (targetY === null) return;

  if (smoother) {
    if (immediate) {
      smoother.scrollTo(targetY, false);
      onComplete?.();
      return;
    }

    const state = { y: getScrollY() };
    gsap.to(state, {
      y: targetY,
      duration,
      ease,
      overwrite: "auto",
      onUpdate: () => {
        smoother?.scrollTo(state.y, false);
      },
      onComplete,
    });
    return;
  }

  if (immediate) {
    window.scrollTo({ top: targetY, behavior: "auto" });
    onComplete?.();
    return;
  }

  gsap.to(window, {
    duration,
    ease,
    overwrite: "auto",
    scrollTo: { y: targetY, autoKill: true },
    onComplete,
  });
}

export function refreshGsapScroll() {
  ScrollTrigger.refresh();
}
