/**
 * A tiny scheduler for scroll-linked effects. Every effect is measured, then
 * updated, once per animation frame — and only while it is near the viewport.
 */
type Update = (rect: DOMRect, viewportHeight: number) => void;

interface Effect {
  el: Element;
  update: Update;
  active: boolean;
}

const effects: Effect[] = [];
let scheduled = false;
let observer: IntersectionObserver | undefined;

function run(): void {
  scheduled = false;
  const viewportHeight = window.innerHeight;
  const live = effects.filter((effect) => effect.active);
  // Read every rect first, then write, so the browser lays out only once.
  const rects = live.map((effect) => effect.el.getBoundingClientRect());
  live.forEach((effect, index) => effect.update(rects[index]!, viewportHeight));
}

function schedule(): void {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(run);
}

function ensureObserver(): IntersectionObserver {
  if (observer) return observer;
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const effect = effects.find((item) => item.el === entry.target);
        if (effect) effect.active = entry.isIntersecting;
      }
      schedule();
    },
    { rootMargin: '25% 0px' },
  );
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  return observer;
}

export function addScrollEffect(el: Element, update: Update): void {
  effects.push({ el, update, active: false });
  ensureObserver().observe(el);
}
