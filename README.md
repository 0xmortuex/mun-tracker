# MUN TR — Turkish Model UN Conference Tracker

A static, mobile-first website that displays Model UN conferences happening in Turkey with real-time filtering, searching, and shareable filtered views.

**Live Demo:** https://0xmortuex.github.io/mun-tracker/

## Overview

MUN TR solves the problem of scattered Model UN conference information in Turkey. Instead of checking multiple websites or social media accounts, Turkish high school students can now find all upcoming conferences in one place with powerful filtering options.

### Key Features

- **43 Turkish MUN Conferences** — Comprehensive, community-sourced database
- **Real-time Filtering** — Filter by location, status, date range, fee, level, language, and beginner-friendliness
- **Search** — Find conferences by name or acronym instantly
- **Shareable URLs** — Share filtered views with friends via URL hash
- **Dark Academic Theme** — Oxford blue and charcoal design inspired by classical institutions
- **Mobile-first Responsive** — Works seamlessly on desktop, tablet, and mobile
- **No Backend Required** — Static site deployable to GitHub Pages
- **Accessibility** — WCAG AA color contrast, keyboard navigation, semantic HTML

## Project Structure

```
mun-tracker/
├── index.html          # Main HTML structure
├── style.css           # Dark academic theme styling
├── app.js              # Vanilla JavaScript application logic
├── conferences.json    # Conference data (43 entries)
└── README.md          # This file
```

## Technical Stack

- **HTML5** — Semantic markup
- **CSS3** — Grid, flexbox, CSS variables
- **Vanilla JavaScript** — No frameworks or build tools
- **Google Fonts** — Inter (UI) + JetBrains Mono (dates/numbers)
- **Static Deployment** — GitHub Pages compatible

## Deployment

### GitHub Pages (Recommended)

1. Push to GitHub repository
2. Enable GitHub Pages from `main` branch root
3. Site will be available at `https://username.github.io/mun-tracker/`

No build step required — just push and deploy!

### Local Testing

```bash
# Start a simple HTTP server
python3 -m http.server 8000

# Open in browser
open http://localhost:8000
```

## Data Schema

Conference data is stored in `conferences.json` with the following structure:

```json
{
  "last_updated": "2026-05-20",
  "conferences": [
    {
      "id": "munb-2026",
      "acronym": "MUNB",
      "name": "Beşiktaş Anadolu Lisesi Model United Nations",
      "host": "Beşiktaş Anadolu Lisesi",
      "city": "Istanbul",
      "venue": "Istanbul (Beşiktaş)",
      "edition": 5,
      "edition_label": "5th annual session",
      "dates": "2026-06-12 to 2026-06-14",
      "dates_display": "12-14 June 2026",
      "status": "open",
      "application_deadline": null,
      "fee_try": null,
      "fee_usd": null,
      "fee_display": "Not disclosed",
      "fee_range": "unknown",
      "level": "high_school",
      "languages": ["English"],
      "language_display": "English",
      "rop": null,
      "beginner_friendly": null,
      "size": "medium",
      "committees": null,
      "website": "https://www.munbesiktas.com/",
      "instagram": "@munbesiktas",
      "instagram_url": "https://instagram.com/munbesiktas",
      "email": "munbpr@gmail.com",
      "character": "Public high school MUN, English-language, established 2017",
      "notes": null,
      "verified_date": "2026-05-20"
    }
  ]
}
```

### Status Enum
- `open` — Applications currently open
- `past` — Conference has already occurred
- `postponed` — Conference postponed/rescheduled
- `dormant` — Conference inactive or no recent editions
- `unknown` — Status unclear

### Level Enum
- `high_school` — High school students only
- `high_school_university` — Both high school and university students

### Fee Range Enum
- `free` — No registration fee
- `under_2000` — Under ₺2,000
- `over_2000` — ₺2,000 or more
- `unknown` — Fee not disclosed

## Filtering Logic

All filters use **AND logic** — a conference must match all selected criteria to appear.

### Filter Categories

| Filter | Options | Default |
|--------|---------|---------|
| Location | All, Istanbul, Other Turkey | All |
| Status | All, Open, Past, Postponed, Dormant | All |
| Date Range | All, Next 30/60/90 days | All |
| Fee Range | All, Free, Under ₺2000, ₺2000+ | All |
| Level | All, High school only, HS + University | All |
| Language | All, English only, English + other | All |
| Beginner-friendly | Toggle | Off |

## URL Hash Format

Filter state is encoded in the URL hash for sharing:

```
https://0xmortuex.github.io/mun-tracker/#search=munb&status=open&location=istanbul
```

Supported parameters:
- `search` — Search term
- `location` — istanbul, other
- `status` — open, past, postponed, dormant
- `daterange` — 30, 60, 90
- `feerange` — free, under_2000, over_2000
- `level` — high_school, high_school_university
- `language` — english_only, english_other
- `beginner` — true

## Design System

### Color Palette

| Element | Color | Hex |
|---------|-------|-----|
| Background | Near-black | `#0a0a0a` |
| Surface | Charcoal | `#131316` |
| Border | Subtle | `#27272a` |
| Text Primary | Off-white | `#fafafa` |
| Text Secondary | Muted gray | `#a1a1aa` |
| Accent | Oxford Blue | `#002147` |
| Accent Hover | Lifted Oxford | `#0a3a8a` |
| Status: Open | Green | `#22c55e` |
| Status: Past | Gray | `#71717a` |
| Status: Postponed | Orange | `#f59e0b` |
| Status: Dormant | Red | `#dc2626` |

### Typography

- **UI Font:** Inter (Google Fonts)
  - Body: 14px
  - Secondary: 12px
  - Card titles: 24px
  - Page title: 32px

- **Mono Font:** JetBrains Mono (Google Fonts)
  - Dates, fees, numbers: 14px

### Responsive Breakpoints

- **Desktop:** 1200px+ (3-column grid)
- **Tablet:** 768px–1024px (2-column grid)
- **Mobile:** <768px (1-column grid, collapsible filters)

## Accessibility

- ✅ WCAG AA color contrast (4.5:1 minimum)
- ✅ Semantic HTML (`<article>`, `<nav>`, `<header>`, `<footer>`)
- ✅ Keyboard navigation (Tab, Enter, Space)
- ✅ Focus indicators on all interactive elements
- ✅ ARIA labels on form controls
- ✅ Screen reader friendly

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

This is a community-sourced project. To add or update conferences:

1. Edit `conferences.json` with new conference data
2. Ensure all required fields are populated
3. Update `last_updated` date
4. Submit a pull request

## License

This project is open source and available under the MIT License.

## Author

Created by **0xmortuex** (Fadi Raad) — 9th-grade student in Istanbul

---

**Disclaimer:** This is a community-sourced database. Always verify conference information on official websites before applying.
