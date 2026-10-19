# AQAR web

The Aqar Dyafa marketing site: a single bilingual page (English `/en`, Arabic `/ar`, full RTL) built around a WebGL model of the AQAR mark.

Next.js 16 (App Router, Cache Components) · React 19 · TypeScript · Tailwind CSS 4 · Motion · Lenis · Three.js / React Three Fiber / Drei.

```bash
npm install
npm run dev      # http://localhost:3000 → redirects to /en or /ar from the browser language
npm run build && npm start
```

## How the page works

A fixed WebGL layer (`components/three/SceneLayer.tsx`) sits behind the page. Sections are either **windows** (transparent, they reveal the 3D scene) or **rooms** (opaque, built over it):

| Section | Type | What happens |
| --- | --- | --- |
| Hero | window | Camera orbits the model, the sun moves, the statement hands over to a second line |
| About | room | Heading darkens word by word; photograph opens like a doorway |
| Services | room | Tabbed disciplines; image wipes, background tone shifts |
| Dive | window | Camera flies into the louvred tower; the louvres open onto the first asset photo |
| Assets we manage | room | Pinned; each asset unmasks horizontally over the last |
| Approach | room | Four stages; the AQAR mark is drawn, then built, stage by stage |
| Why AQAR / Ecosystem | rooms | Typographic |
| Contact | window | The model again, in evening light; enquiry dialog |

Windows register with `useSceneChapter`, which writes scroll progress into `lib/scene-store.ts`. The render loop reads that store every frame, so scrolling never re-renders React. The canvas stops rendering when no window is on screen.

The model is procedural (`components/three/Building.tsx`), so there is no model file to download. Fins and louvres are instanced meshes.

## Other pages

| Route | What it is | Content lives in |
| --- | --- | --- |
| `/[lang]/insights` | Article index: the latest article leads, the rest follow as rows | `src/content/insights.ts` |
| `/[lang]/insights/[slug]` | Article: lead image, body, two related articles | same file; add an article by appending to `articles` |
| `/[lang]/contact` | Visitors first choose who they are (owner, tenant, corporate, resident, developer), then fill in the enquiry form; the choice is sent with it | `contactPage` in `src/i18n/*.ts`; channels in `src/content/site.ts` |
| `/[lang]/cookies` | Cookie Policy | `cookiePolicy` in `src/i18n/*.ts` |

**Cookie consent** (`src/lib/consent.ts`, `components/ui/CookieConsent.tsx`): a banner with *Allow cookies* and *Essential only*. The choice is stored in one first-party cookie, `aqar_consent` (`all` or `essential`), for twelve months. *Cookie settings* in the footer reopens the banner. The site loads no analytics yet. When you add some, load them only when `getConsent() === "all"`, and listen for the `aqar:consent` event to react to a change without a reload.

## Website assistant (AI)

A floating **Ask AQAR** / **اسأل عقار** button on every page opens a chat panel. It answers questions about the services, approach and how to get in touch, and hands visitors to the Contact page for anything that needs the team: proposals, fees, viewings, maintenance or account-specific questions.

- **API route** `src/app/api/assistant/route.ts` streams replies from **Claude Opus 5.5** (`claude-opus-5-5`) at `low` effort, which suits short support answers. Refusal fallback is on (`fallbacks: "default"`, beta `server-side-fallback-2026-07-01`): if a safety check declines a request, the API retries it on Anthropic's recommended model in the same call. If the whole chain declines, the visitor sees a polite handoff to the Contact page.
- **Knowledge and rules** `src/lib/assistant/knowledge.ts`: the system prompt is generated from the site's own content (services, approach, Why AQAR, ecosystem, Insights, contact flow), so it always matches the pages. Brand rules are enforced there: no guarantees, prices or invented numbers, no legal or investment advice, no collecting personal details in chat, emergencies sent to emergency services first, replies in the visitor's language. The prompt is identical on every request and marked for prompt caching.
- **Safety limits:** the conversation is validated (alternating turns, at most 20, 2,000 characters per message), with a simple per-IP limit of 30 requests per 10 minutes. That limit lives in memory on one server, so use your host's rate limiting or a shared store in production.
- **Setup:** add `ANTHROPIC_API_KEY` to `.env.local` (see `.env.example`). Without it the widget still opens, and visitors are pointed to the Contact page.
- The conversation is stored only in the visitor's tab (`sessionStorage`). Nothing is logged server-side, and chats are not seen by staff; the panel says so.

## Accounts

Sign up (`/[lang]/signup`), Sign in (`/[lang]/login`) and Account (`/[lang]/account`) run on this site. Visitors choose an account type (owner or investor, resident, corporate client); the Account page shows their details and the next step for that type.

- **Storage:** `src/lib/auth/db.ts` uses Node's built-in SQLite, one file at `data/aqar.db` (git-ignored; override the folder with `AQAR_DATA_DIR`). That is fine on a single server. On serverless hosting the file system doesn't persist, so swap this module for a hosted database or the Laravel API before deploying there.
- **Passwords:** hashed with scrypt and a per-user salt (`src/lib/auth/password.ts`), never stored in plain text. They must be at least 10 characters.
- **Sessions:** a random token in the httpOnly `aqar_session` cookie; only its SHA-256 hash is stored. Without Remember me the cookie ends with the browser session; with it, after 30 days. Sign out deletes the session.
- **Protection:** Server Actions (`src/lib/auth/actions.ts`) get Next.js's built-in origin check. Sign-in is throttled to 8 failed attempts per IP and email every 15 minutes, errors don't reveal whether an email is registered, and unknown emails take the same time to check as real ones.
- **Not built yet:** password reset by email (the form points people to customer service and the Contact page), email verification, and Terms acceptance (there is no Terms page yet).

## Performance and accessibility

- The 3D bundle is code-split and loads after first paint. Without WebGL the static mark is shown instead.
- Quality depends on the device. Phones and low-core machines get fewer instances, no shadow maps and a lower pixel ratio, and `PerformanceMonitor` drops the pixel ratio further if frames slow down. On portrait screens the camera uses its own framing.
- `prefers-reduced-motion`: Lenis is off, the camera has no easing, drift or pointer parallax, and entrance animations become fades.
- Tabs use the ARIA tab pattern and arrow keys. There is a skip link, focus rings are visible, and the enquiry dialog is a native `<dialog>`.

### Measured (production build, local)

| Check | Result |
| --- | --- |
| LCP, desktop | 0.6–0.8 s |
| LCP, mobile with 4× CPU throttle | 1.2–1.9 s |
| CLS | 0 |
| 3D frame rate, integrated Intel Arc GPU | 60 fps at the hero and during the dive, desktop quality with shadows at 2× DPR |
| 3D bundle | ~238 KB gzip, loaded after first paint; drei's HDR loaders are avoided by a baked PMREM studio (`StudioEnvironment.tsx`) |
| axe-core (WCAG 2 A/AA + best practice) | 0 violations on `/en`, `/ar` and the open enquiry dialog |

Language switching runs as a client navigation behind a curtain. Next keeps the previous locale in a hidden `<Activity>`, so the scene unmounts while hidden and only one WebGL context is ever live.

## Before launch: replace placeholders

1. **Photography** (`src/content/media.ts`): these are Unsplash placeholders. Replace them with AQAR's own photography of managed assets.
2. **Assets we manage** (`src/i18n/en.ts`, `src/i18n/ar.ts` → `assets.items`): asset types from the official company description, paired with cities from the Locations list. When you have named projects to show, put them here.
3. **Enquiries**: set `CONTACT_WEBHOOK_URL` (CRM, Make/Zapier or an email relay). Without it, development logs each enquiry to the console and production returns 503, so enquiries are never silently dropped.
4. **Insights articles** (`src/content/insights.ts`): four articles drafted in English and Arabic from the brand reference's content pillars. Review them, or replace them with your published articles and photos.
5. **Contact channels** (`src/content/site.ts`): phone 0562890415, customer service 920066655 and info@dyafa.com, taken from the Aqar Dyafa contact page, along with the six cities. WhatsApp and office address are empty and so hidden. Confirm the details; they appear on the Contact page and in the footer, and the assistant gives them out.
6. **Dyafa group entities** (`ecosystem.members`): confirm the names and roles with Dyafa Holding.

## Design system

The tokens live in `src/app/globals.css`. The palette comes from the AQAR brief, plus the logo's bronze, which is used only as an accent. Fonts are Bodoni Moda (English display), Reem Kufi (Arabic display) and IBM Plex Sans / Plex Sans Arabic (text). Motion durations are in `src/lib/motion.ts`. Copy follows the Aqar Dyafa tone-of-voice rules: no superlatives, no guarantees and no unverified numbers.
