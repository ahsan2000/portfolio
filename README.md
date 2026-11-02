# Ahsan Nawaz — DevOps Engineer Portfolio

A static portfolio led by cloud and DevOps engineering, with full-stack website development, Kotlin Multiplatform apps, domains, DNS, hosting, SSL, and delivery from idea to launch. OneView demonstrates independent ownership of the app, website, and launch.

## Pages

- [Main portfolio](https://ahsan2000.github.io/portfolio/): production work, services, engineering stack, résumé, and contact form.
- [Upwork portfolio](https://ahsan2000.github.io/portfolio/upwork.html): dedicated page for Upwork clients.
- `thank-you.html`: confirmation page opened after the contact API accepts a submission.

## Run locally

```bash
python3 -m http.server 8000
```

Open http://localhost:8000. No build step is required.

## Active files

- `styles.css` and `devops-theme.css`: shared responsive layout and visual styling.
- `clarity-theme.css`: midnight navy, teal, and soft blue theme and service overview.
- `script.js`: reveal behavior, navigation, ticker measurement, and opening layout.
- `cinematic.css` and `cinematic.js`: responsive centered hero, assembling skill lettering, section background labels, scroll perspective, and lightweight background atmosphere.
- `portfolio-atmosphere.js`: brief terminal loading screen before the hero animation.
- `section-effects.js`: pause decorative animations outside the viewport.
- `stack-explorer.js`: accessible engineering stack tabs, mobile swipe gestures, and optional tour.
- `ai-diagram.js`: interactive AI and delivery architecture diagrams with motion controls.
- `page-mascot.js`: original riso fox and AI drone, viewport-based section and project messages, randomized dwell messages, and interaction-triggered reaction loading.
- `contact-form.js`: AJAX enquiry submission and confirmation navigation.
- `assets/`: active project previews, tool icons, optimized fox sprites, sharing thumbnail, résumé, and attribution notices.

Both pages use the cinematic navy-and-mint hero, responsive portrait, animated skill lettering, and CSS perspective effects. The opening loader runs on page load and refresh. Effects respect system reduced-motion settings; background activity pauses when the page is hidden. The old WebGL scene and its Three.js runtime are no longer shipped.

## Contact form

The main page submits through FormSubmit to `productsbyahsan@gmail.com`. Inbox delivery requires the service's one-time email activation. The keyboard-accessible slider is an interaction check, not a server-verified CAPTCHA. Failed submissions preserve the draft; API acceptance does not guarantee inbox delivery.

## Deployment

The site uses GitHub Pages. Publish the updated files and rerun PageSpeed Insights to measure deployed performance.

## Attribution and license

The earlier visual design drew on the supplied ThreeUI Kage reference; the current cinematic layout adapts the supplied Renando portfolio reference to Ahsan’s own content and assets.

The fox sprites are from Koboyo page-mascot by Kamran Ahmed. Their MIT license is preserved in `assets/page-mascot-LICENSE.txt`. Tool icon sources are documented in `assets/tools/README.md`.

This portfolio is licensed under the [Apache License 2.0](LICENSE).

Typography uses locally hosted Inter, Space Grotesk, and Caveat fonts. Their SIL Open Font License files are included in `assets/fonts/`.
