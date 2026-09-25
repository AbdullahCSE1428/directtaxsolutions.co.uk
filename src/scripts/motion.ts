/** True when the visitor has asked their OS/browser to minimise motion. */
export const prefersReducedMotion = (): boolean =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** True for mouse/trackpad users — pointer-driven effects are skipped on touch. */
export const hasFinePointer = (): boolean => window.matchMedia('(hover: hover) and (pointer: fine)').matches;

export const clamp = (value: number, min = 0, max = 1): number => Math.min(max, Math.max(min, value));
