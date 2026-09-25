import { prefersReducedMotion } from './motion';

declare global {
  interface Window {
    __dtsReady?: boolean;
  }
}

/**
 * Adds `.is-visible` to every `[data-reveal]` element the first time it
 * scrolls into view. CSS handles the actual transitions.
 */
export function initReveal(): void {
  window.__dtsReady = true;
  const elements = document.querySelectorAll<HTMLElement>('[data-reveal]');

  if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
    elements.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -12% 0px' },
  );

  elements.forEach((el) => observer.observe(el));
}
