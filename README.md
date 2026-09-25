# Direct Tax Solutions Ltd — website

The website for [Direct Tax Solutions Ltd](https://directtaxsolutions.co.uk), a London firm of accountants,
tax advisors and business mentors (registered in England & Wales, company number 13431046).

It is a static site built with [Astro](https://astro.build): pages are rendered to plain HTML at build time,
styled with modern CSS and enhanced with a few kilobytes of vanilla TypeScript. There is no client-side
framework, no jQuery and no third-party requests at runtime (fonts are self-hosted).

## Quick start

Requires **Node.js 22.12 or newer** (see `.nvmrc`).

```bash
npm install
npm run dev       # local dev server with hot reload at http://localhost:4321
npm run check     # type-check .astro and .ts files
npm run build     # production build into dist/
npm run preview   # serve the production build locally
```

## Editing the content

Almost everything you might want to change lives in **`src/data/site.ts`**:

| What                                          | Where in `site.ts`         |
| --------------------------------------------- | -------------------------- |
| Company name, number, director, address       | `company`                  |
| Email, phone / WhatsApp number                | `company.email`, `company.phone` |
| Page title and search-engine description     | `seo`                      |
| Hero headline and intro                       | `hero`                     |
| About text, feature cards and vision          | `about`                    |
| “Who we work with” ribbon                     | `clientTypes`              |
| Services (title, description, enquiry topic)  | `services`                 |

Components read from this file, so a change there updates the page, the footer and the structured data
for search engines together. (The wording on the social share image is drawn in `src/lib/images.ts`.)

Other things you might touch:

- **Colours, type scale, spacing** — design tokens at the top of `src/styles/global.css`.
- **Logo mark** — geometry and colours in `src/data/brand.ts` (used by the header, footer, favicons and
  social image).
- **Photos** — `src/assets/images/`; Astro converts them to responsive AVIF/WebP at build time.

## How it is built

```
src/
  components/   one .astro file per section (Header, Hero, About, Services, Contact, Footer…)
  data/         site.ts (content) and brand.ts (logo geometry & colours)
  layouts/      BaseLayout.astro — <head>, SEO/Open Graph tags, JSON-LD, fonts
  lib/          images.ts — draws favicons, app icons and the social image at build time
  pages/        index, 404 and thank-you pages, plus build-time endpoints for
                favicon.svg/.ico, app icons, og-image.png, site.webmanifest and robots.txt
  scripts/      small TypeScript modules: header, reveals, scroll effects, contact form
  styles/       global.css — tokens, base styles and shared utilities
public/         files copied as-is (CNAME)
```

### Animations

The motion is designed to reflect the work: a management-accounts chart that draws itself, VAT/payroll/
company-formation status cards, a company number that rolls into place like an adding machine, a
hand-drawn circle and highlighter strokes, ledger-style illustrations and self-drawing service icons.

- Entrance animations are CSS-only; scroll reveals use `IntersectionObserver`; scroll-linked effects share
  one `requestAnimationFrame` loop that only runs for elements near the viewport.
- Nothing moves on its own indefinitely — continuous motion is tied to scrolling or the pointer.
- `prefers-reduced-motion` turns motion off, `prefers-contrast: more` keeps text at full contrast, and all
  content is visible without JavaScript.

### Contact form

The form posts to [FormSubmit](https://formsubmit.co) (`info@directtaxsolutions.co.uk`), as before.
With JavaScript it validates inline and sends the message in the background, showing a confirmation in the
page. Without JavaScript — or if the background request cannot be made — it falls back to a normal form
post, and FormSubmit redirects to `/thank-you/`. A honeypot field filters simple spam bots.

## Deployment (GitHub Pages)

`.github/workflows/deploy.yml` builds and type-checks every push, and deploys `main` to GitHub Pages.

**One-time setup** — because the site now has a build step, Pages must deploy from the workflow instead
of straight from the branch:

1. In the repository, open **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.
3. Check that **Custom domain** still reads `directtaxsolutions.co.uk` and **Enforce HTTPS** is ticked.

Do this **before** merging the redesign into `main`. If the old “Deploy from a branch” setting is still
active when `main` changes, Pages would publish the repository files (this README) instead of the site.

After that, every push to `main` redeploys automatically; you can also re-run it from the **Actions** tab
(“Build and deploy” → **Run workflow**).
