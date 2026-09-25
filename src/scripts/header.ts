/** Header behaviour: condensing pill, scroll-spy indicator and mobile menu. */
export function initHeader(): void {
  const header = document.querySelector<HTMLElement>('[data-header]');
  if (!header) return;

  const setScrolled = () => header.toggleAttribute('data-scrolled', window.scrollY > 24);
  setScrolled();
  window.addEventListener('scroll', setScrolled, { passive: true });

  initScrollSpy(header);
  initMobileMenu();
}

function initScrollSpy(header: HTMLElement): void {
  const pill = header.querySelector<HTMLElement>('[data-nav-pill]');
  const links = Array.from(header.querySelectorAll<HTMLAnchorElement>('[data-nav-link]'));
  const sections = links
    .map((link) => document.getElementById(link.dataset.navLink ?? ''))
    .filter((section): section is HTMLElement => section !== null);

  // Pages without the in-page sections (404, thank-you) have nothing to track.
  if (!pill || sections.length === 0) return;

  let active: HTMLAnchorElement | undefined;

  const placePill = (animate: boolean) => {
    if (!active) return;
    if (!animate) pill.style.transition = 'none';
    pill.style.setProperty('--pill-x', `${active.offsetLeft}px`);
    pill.style.setProperty('--pill-w', `${active.offsetWidth}px`);
    if (!animate) {
      void pill.offsetWidth; // commit the jump before re-enabling transitions
      pill.style.removeProperty('transition');
    }
    pill.setAttribute('data-ready', '');
  };

  const setActive = (id: string) => {
    const next = links.find((link) => link.dataset.navLink === id);
    if (!next || next === active) return;
    const isFirst = active === undefined;
    active?.removeAttribute('aria-current');
    next.setAttribute('aria-current', 'true');
    active = next;
    placePill(!isFirst);
  };

  const intersecting = new Set<string>();
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) intersecting.add(entry.target.id);
        else intersecting.delete(entry.target.id);
      }
      // The last section (in page order) crossing the band wins.
      const current = sections.filter((section) => intersecting.has(section.id)).at(-1);
      if (current) setActive(current.id);
    },
    { rootMargin: '-40% 0px -55% 0px' },
  );

  sections.forEach((section) => observer.observe(section));
  window.addEventListener('resize', () => placePill(false));
}

function initMobileMenu(): void {
  const menu = document.querySelector<HTMLDialogElement>('[data-menu]');
  const openButton = document.querySelector<HTMLButtonElement>('[data-menu-open]');
  if (!menu || !openButton) return;

  openButton.addEventListener('click', () => {
    menu.showModal();
    openButton.setAttribute('aria-expanded', 'true');
  });

  menu.addEventListener('close', () => openButton.setAttribute('aria-expanded', 'false'));
  menu.querySelector('[data-menu-close]')?.addEventListener('click', () => menu.close());

  // Close before the browser follows the in-page link, so scrolling is unlocked.
  menu.querySelectorAll('[data-menu-link]').forEach((link) => {
    link.addEventListener('click', () => menu.close());
  });

  window.matchMedia('(min-width: 961px)').addEventListener('change', (event) => {
    if (event.matches && menu.open) menu.close();
  });
}
