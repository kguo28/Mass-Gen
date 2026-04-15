# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`ban-project-clean/index.html` is a single-file SPA — the "BAN Living Field Guide" — for onboarding clinical sites into the Bipolar Action Network (BAN). No build tools, no dependencies beyond Google Fonts CDN.

To preview: open `ban-project-clean/index.html` directly in a browser (no server needed).

## Architecture

Everything lives in one file:

- **Lines 1–498**: All CSS (CSS variables, sidebar, pages, cards, modal, AI chat styles)
- **Lines 499–709**: HTML markup — sidebar nav + 7 `<div class="page" id="page-*">` sections
- **Lines 710–828**: Data — `phases[]`, `c22s[]`, `roles[]`, `docs[]` JS arrays hardcoded inline
- **Lines 829–end**: JS functions that render and wire up the UI

### Pages / sections

| id | Purpose |
|---|---|
| `page-phases` | 4-phase onboarding checklist (Joining → Training → Registering → Activation) |
| `page-catch22` | Catch-22 dependency loops that stall onboarding |
| `page-roles` | Four required site roles |
| `page-bizcase` | Business case / talking points generator |
| `page-docs` | Document library (filterable) |
| `page-ai` | "Ask the guide" chat (keyword-matched simulated responses, no API) |
| `page-dash` | Progress dashboard |

### Key patterns

- **Navigation**: `nav(id, el)` swaps `.active` class on `.page` divs and `.nav-item` links
- **State**: `checks` object (in-memory only, not persisted) tracks task checkbox state; `updateBadges()` / `updateDash()` recompute derived counts
- **Rendering**: each section has a `render*()` function (`renderPhase`, `renderC22`, `renderRoles`, `renderDocs`, `renderBanView`) called on init
- **PDF embed**: `PDF_DATA` variable holds a base64-encoded PDF; `openDoc(i)` injects it into a modal iframe
- **AI chat**: `sendAI()` does keyword matching against `simulated{}` map — no real API calls
