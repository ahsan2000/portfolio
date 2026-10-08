# Ahsan Nawaz — DevOps Engineer Portfolio

A static portfolio featuring cloud infrastructure, Kubernetes operations, infrastructure as code, CI/CD automation, and production reliability.

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

- `styles.css` and `devops-theme.css`: responsive layout, technical typography, and visual styling.
- `script.js`: reveal behavior, navigation, ticker measurement, and opening layout.
- `portfolio-atmosphere.js`: brief terminal loading screen and drifting tool marks.
- `visual-effects.js`: deferred desktop graphics loading; mobile, reduced-motion, and data-saving visitors retain the static background.
- `devops-scene.js` and `vendor/three.min.js`: desktop infrastructure scene, limited to 30 FPS.
- `tile-cloth.js`: desktop card surface effects.
- `scroll-story.js`: scroll-driven scene positioning.
- `section-effects.js`: pause decorative animations outside the viewport.
- `stack-explorer.js`: accessible engineering stack tabs and optional tour.
- `delivery-flow.js`: responsive delivery diagram connections.
- `page-mascot.js`: fox companion, messages, and interaction-triggered reaction loading.
- `contact-form.js`: AJAX enquiry submission and confirmation navigation.
- `assets/`: active project previews, tool icons, optimized fox sprites, sharing thumbnail, résumé, and attribution notices.

The main page defers optional graphics until the page has loaded. The Upwork page loads its scene directly. Both pages share styling and optimized fox assets.

## Contact form

The main page submits through FormSubmit to `productsbyahsan@gmail.com`. Inbox delivery requires the service's one-time email activation. The keyboard-accessible slider is an interaction check, not a server-verified CAPTCHA. Failed submissions preserve the draft; API acceptance does not guarantee inbox delivery.

## Deployment

The site uses GitHub Pages. Publish the updated files and rerun PageSpeed Insights to measure deployed performance.

## Attribution and license

The DevOps scene and cloth effects were adapted from the supplied ThreeUI Kage reference. The active Three.js runtime is retained in `vendor/three.min.js` with its license notice.

The fox sprites are from Koboyo page-mascot by Kamran Ahmed. Their MIT license is preserved in `assets/page-mascot-LICENSE.txt`. Tool icon sources are documented in `assets/tools/README.md`.

This portfolio is licensed under the [Apache License 2.0](LICENSE).
