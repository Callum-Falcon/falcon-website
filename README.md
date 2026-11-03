# falcon-website

The public website for **Falcon Reports**, the trading name of Falcon Data Analytics Ltd. It is live at <https://www.falconreports.com>.

It is a plain static site (HTML, CSS and a little JavaScript) with no build step. The code lives on GitHub (it replaced the older `falcon-home` repo on GitLab in November 2026), and Netlify deploys it automatically every time you push to `main`.

## Pages

| File | Page |
|---|---|
| `index.html` | Home, including the interactive data-flow diagram |
| `platform.html` | Platform: how the data platform works, and how pupil data is protected |
| `ai-ready-data.html` | AI-ready data, including the compliance panels |
| `reports.html` | Reports, with the four demo videos |
| `uk-schools.html` | Schools → UK schools |
| `international-schools.html` | Schools → International schools |
| `about.html` | About |
| `_redirects` | Netlify redirects for moved/removed pages (`/projects`, `/education`, `/finance`, `/public-sector`) |

Falcon Reports works only with UK and international independent schools, so the site has no other sector pages.

## Other files

| Path | What it is |
|---|---|
| `style.css` | All styles. Colours are set once at the top (`--gold` for data going in, `--sky` for data coming out). |
| `script.js` | Mobile menu, the "Schools" dropdown, the home page diagram, and the expandable compliance panels. |
| `assets/fonts/` | Inter and Manrope, self-hosted so no visitor data goes to a font service. SIL Open Font Licence (licence files alongside). |
| `assets/falcon-logo-white.png` | Logo for the navy header. |
| `assets/falcon-logo-navy.png` | Logo for white backgrounds (footer, platform card). |
| `assets/video/` | Report demo videos and their poster images. Only publish clips recorded with the Kestrelmoor demo data. |

## Editing the home page diagram

Each pill in `index.html` is a `<button>`. The lines and moving dots are drawn by `script.js` from where the pills sit on the page, so you can add, remove or reorder pills without touching any coordinates.

- A source needs `data-source`, a unique `data-id` and a `data-text` (shown underneath when clicked).
- Add `data-print="1"` to a source that also feeds **Printable reports**. Every other source feeds every output.
- An output needs `data-output`, a unique `data-id` and a `data-text`.

## Showcase videos on the UK schools page

`uk-schools.html` still has a "See it in action" section that is commented out (`<!-- SHOWCASE VIDEOS ... -->`). The Reports page now shows the demo videos, so you may not need it.

## Editing shared parts

There is no templating, so the header nav and the footer are copied into every page. When you change one of them, update all seven pages. On each page, the current nav link carries `aria-current="page"` (on the UK and International pages, the "Schools" button carries the `is-current` class instead).

## Preview locally

```bash
cd ~/projects/falcon/falcon-website
python3 -m http.server 8000
# then open http://localhost:8000 in a browser (Ctrl+C to stop)
```

`_redirects` only works on Netlify, not in this local preview.
