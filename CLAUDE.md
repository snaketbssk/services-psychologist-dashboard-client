# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start development server
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint
```

There is no test runner configured. Set `NEXT_PUBLIC_API_URL` in `.env.local` before running locally (see `.env.example`).

## Architecture

**Next.js 16 App Router** with React 19 — a psychologist marketing/booking site with multi-language support.

### Routing

All routes live under `src/app/[locale]/` where `locale` is `en | ru | am`. The middleware in `src/proxy.ts` handles locale-prefix routing via next-intl. Routes:
- `/[locale]/` — homepage (single-page with multiple section components)
- `/[locale]/blogs/` — paginated blog listing
- `/[locale]/blogs/[id]/` — blog detail
- `/[locale]/book-consultation/` — standalone consultation form page

### Component Model

Default to **Server Components**; use `"use client"` only for interactive elements (forms, animations, modals). Page sections are composed in `src/app/[locale]/page.tsx`.

### API Layer

- `src/lib/ApiClient.ts` — `ServiceApi` class wrapping Axios; auto-injects `X-Language` header from the URL locale on the client
- `src/lib/service-psychologist.ts` — typed endpoint functions (`postConsultation`, `getLaunch`, `getBlogs`, `getBlogById`, `getVideos`) and all data interfaces
- Base URL from `NEXT_PUBLIC_API_URL` env var

### State Management

- **TanStack React Query** for async data/mutations (`src/providers/QueryProvider.tsx`)
- Local `useState` for form state; no global store
- Form validation logic mirrors the C# backend validators (comments in code note equivalence)

### i18n

- **next-intl** with message files in `messages/en.json`, `messages/ru.json`, `messages/am.json`
- Server components: `getTranslations()` from `next-intl/server`
- Client components: `useTranslations()` from `next-intl`
- Typed helper: `src/i18n/useT.ts` for dot-notation access to common strings

### Styling

- **Tailwind CSS 4** with custom CSS variables and `cn()` utility (`src/lib/utils.ts`) combining clsx + tailwind-merge
- **shadcn/ui** components (Base Nova style) in `src/components/ui/`
- Custom fonts: Playfair Display (headings), Roboto Slab (body), Inter (sans)
- Scroll animations via `AnimateIn` component using Intersection Observer

### Path Aliases

`@/*` resolves to `src/*` — use this for all imports.

### Deployment

`output: "standalone"` in `next.config.ts` — built for Docker containerization.
