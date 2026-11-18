# Learning Institutions by Design

A responsive, accessible research experience (Phase III) where students and faculty imagine possible institutions for learning.
Built from the designer brief v0.5 (13 November 2026). It is a research experience, not a university builder, a prediction or a ranking.

Stack: React 19 + JavaScript (JSX), Vite, React Router (hash routes), plain CSS. Serverless functions in `api/` (Vercel), Postgres (Neon) over HTTP.
Identity: taken from elespacio.net (off-black `#201e1f`, off-white `#f4efe8`, pink/orange/purple/green/blue/ochre, Bricolage Grotesque with Instrument Serif accents, pill buttons, sticker chips).

## Run it

```bash
npm install
npm run dev        # http://localhost:5173  (the functions in api/ run locally too)
npm run build
npm run lint
npm run check      # headless checks: sanitising, flattening, profile, route guard, dashboard maths
```

## The journey (brief section 2)

| Stage | Screen(s) | Notes |
|---|---|---|
| 1 Entry | `/` | Welcome and route choice. Route is not a score. |
| 2 Dimensions | Route A: `/imagine`, `/experience` · Route B: `/dimensions`, `/dimension/:id` | A: required description, then **Build one learning experience** (the six prompts of brief 4.1, all optional). B: six required, six optional dimensions. |
| 3 Shared activities | `/activities`, `/activity/:id` | Resource Allocation (required, 100 points). Optional: Rethinking practices, Signature practice, Institutional tensions, Purpose. Shown as a menu. |
| 4 Your institution | `/institution`, `/profile` | Participant-written formation and change, then an organised, editable profile that the participant approves. |
| 5 Reflection | `/reflection`, `/done` | Three optional prompts (frozen wording), submit, participant code. |

Researcher: `/researcher` (sign-in, then the dashboard).

The dashboard has filters (period, route, status, find a participant) and seven tabs: Overview (headline figures, starts per day, funnel, devices), Dimensions, Activities,
Profiles, In their words (searchable verbatim answers), Participants (open anyone to read everything they did, download their report, or delete them) and Download.
Downloads are made in the browser from the filtered view: Excel workbook (.xlsx, one sheet per topic plus a read-me), Word report (.docx), PDF report (opens the print dialog, choose Save as PDF),
and CSV / JSON. The Word and Excel files are written by hand as zipped XML (`src/export/office.js`), so any script survives and nothing heavy is shipped; they load only when asked for.

## Folder map

```
src/
  config/        what the researchers own: dimensions + choices, activities, stages  (edit wording here)
  state/         the session model, SessionContext (save/resume, sync), localStorage, sync to the server
  flow/          the route map (flow.js: paths, next/back, guards) and what counts as answered (validate.js)
  components/    shared UI: Shell, Rail, ActionBar, ChoiceList, PointsAllocator, TensionSlider, StepList, Dialog …
  screens/       one file per screen; dimensions/ and activities/ hold the per-kind bodies
  profile/       organise.js (the organiser), versions.js (draft → edited → approved), ProfileVisual.jsx
  export/        flatten.js: a session as long rows with provenance, plus CSV
  researcher/    sign-in, dashboard, metrics, exports, sample data
  styles/        tokens.css (identity), base.css, components.css, screens.css
api/             session.js (sign-in), sessions.js (save/read/delete), _auth.js, _db.js (Postgres), _record.js (cleaning)
scripts/         check-flow.mjs
```

## Data (brief section 9)

- Anonymous participant code (`LID-XXXXXX`) and route. Route is never a score.
- Dimension and option IDs, custom text, allocations, tension slider values, activity responses, profile versions, reflections, timestamps.
- Statuses stay distinct: `answered`, `skipped`, `na` (not applicable), `unanswered`, and a points value of `0` is its own answer.
- Provenance on export: `researcher-provided`, `participant-selected`, `participant-generated`, `participant-modified`, `system-organised`, `participant-approved`.
- Profile versions are stored as linked records (`draft` → `edited` → `approved`, each with `parentId`), alongside the participant's own input (the session itself).
- Save/resume: this browser (localStorage). Progress is also sent to the shared database at each stage, on submit and when the tab is hidden.

## Environment variables (set in the host, never in the repo)

`RESEARCHER_USER`, `RESEARCHER_PASSWORD` (at least 8 characters), `SESSION_SECRET`, and `DATABASE_URL` (or `DATABASE_URL_POOLED` / `POSTGRES_URL`). See `.env.example`.
The table is created on first use. Without a database the experience still works; the dashboard says nothing is connected and offers the sample preview.
Run locally with an in-memory database: `LID_LOCAL_DB=1 npm run dev`.

Data controls: participants can withdraw their own answers from the footer (instant on screen; the delete finishes in the background and is retried until the server confirms); researchers can delete a participant from the dashboard; a withdrawn session id is remembered so a late save cannot bring it back; saving is rate limited per IP. The functions run in `iad1` (next to a Neon database in us-east-2), because every database round trip across an ocean is slow. If your database is elsewhere, change `regions` in `vercel.json` to match.

## Feel and motion

Screens glide in the direction you are travelling; headings and cards rise in one after another; buttons press down like stickers; choices nudge, pop and draw their tick;
sliders have a filled track, a big thumb and a value bubble; the points total celebrates when the last point is placed; steps slide when reordered; the entry screen has
floating shapes, cards that lean toward the pointer and a soft glow that trails it; the finish screen throws confetti; a thin bar across the top shows overall progress.
All of it lives in `src/styles/motion.css`, `src/hooks/motion.js` and `src/components/Confetti.js`, and all of it switches off for `prefers-reduced-motion`.

## Accessibility

Keyboard operation everywhere; real labels; focus moves to the main area on each screen; visible focus rings; no colour-only meaning; 16px minimum text;
points set by typing or plus/minus (never drag-only); steps reordered with buttons; status messages announced; reduced-motion respected; reflows at 320px.

## Still open (from brief section 10, and mine)

- Choice wording is PROPOSED except where the brief marks FROZEN. Governance "by decision area" and Membership's participation map are not built (note fields instead).
- **Placeholders to confirm:** the eight tension pairs, the familiar practices list, the study / AI and data / accessibility wording (marked in the dialogs), Resource Allocation categories.
- The profile is organised by rules in the browser (`src/profile/organise.js`): it only rearranges the participant's own words. A language model can be put behind the same function; provenance would then read `AI-organised`.
- Whether Technology and AI stays a standalone dimension; fixed order vs menu for optional activities (menu used); profile visual style (simple bars used).
