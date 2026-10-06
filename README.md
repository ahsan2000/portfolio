# Ahsan Nawaz — DevOps Engineer Portfolio

A responsive personal portfolio showcasing my DevOps experience, technical capabilities, and selected contributions to production platforms. The site focuses on cloud infrastructure, Kubernetes operations, infrastructure as code, CI/CD automation, observability, and reliable production delivery.

## Live Portfolio

- [Main portfolio](https://ahsan2000.github.io/portfolio/)
- [Upwork portfolio](https://ahsan2000.github.io/portfolio/upwork.html)
- [Upwork profile](https://www.upwork.com/freelancers/~0110eb49d43b69795a)
- [LinkedIn](https://www.linkedin.com/in/ahsannz/)

## Highlights

- Responsive layout for desktop, tablet, and mobile devices
- Persistent DevOps scene, layered parallax scrolling, and scrolling technology ticker
- Selected production work across banking, AI services, technology, and membership platforms
- DevOps capabilities covering AWS, Azure, GCP, Kubernetes, Terraform, Ansible, Jenkins, and Bitbucket Pipelines
- Dedicated Upwork version that keeps client communication on the Upwork platform
- Accessible navigation with reduced-motion support
- Lightweight static implementation suitable for GitHub Pages

## Selected Production Work

The portfolio presents selected projects I contributed to as an employee, including:

- **Bank AL Habib Digital Banking** — highly available Kubernetes backend operations and production support
- **Bank AL Habib DigiMate** — Azure AKS infrastructure and automated deployments
- **TekRevol** — AWS production environment support and CI/CD automation
- **Rise Up Kings** — AWS deployment operations and automated delivery

Only public project links and high-level descriptions of my own contributions are included. Employer source code, credentials, internal architecture, and confidential information are not part of this repository.

## Technology

The site is built with semantic HTML, modern CSS, and vanilla JavaScript. It uses a locally bundled Three.js runtime and has no build step.

```text
portfolio/
├── index.html       # Main portfolio and contact page
├── upwork.html      # Upwork-focused portfolio page
├── assets/          # Portfolio thumbnail and delivery visuals
├── styles.css       # Responsive design and animations
├── script.js        # Navigation and interactive behavior
├── LICENSE          # Apache License 2.0
└── README.md
```

## Run Locally

Clone the repository and start a local static server:

```bash
git clone https://github.com/ahsan2000/portfolio.git
cd portfolio
python3 -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000) in a browser.

## Deployment

The portfolio is deployed from the `main` branch with GitHub Pages. Updates pushed to `main` are published automatically.

## License

Licensed under the [Apache License 2.0](LICENSE).

## Contact

For DevOps consulting, deployment automation, cloud infrastructure, or production support:

- [Upwork](https://www.upwork.com/freelancers/~0110eb49d43b69795a)
- [LinkedIn](https://www.linkedin.com/in/ahsannz/)
- [Email](mailto:ahsannawaz2000@gmail.com)

## DevOps visual theme

The main and Upwork pages use a dark vermilion theme adapted from the supplied Kage source. A custom Three.js scene depicts a Kubernetes cluster, cloud infrastructure, and commit/build/verify/deploy delivery stages. It supports pointer movement, pausing, reduced motion, offscreen suspension, and GPU resource cleanup.

- `devops-theme.css`: responsive visual theme
- `devops-scene.js`: DevOps scene geometry and interactions
- `vendor/three.min.js`: runtime copied from the supplied source
- `reference/threeui/`: complete extracted source for reference; the original temple renderer is not the active portfolio scene

The original Kage source includes remotely hosted scene images and fonts. The adapted portfolio does not load these temple assets.

## Parallax scroll

Both pages use a persistent DevOps world behind naturally scrolling content. Cloud infrastructure and Kubernetes geometry move slowly with the scroll position; foreground server details move faster to create depth. The introduction, cloud, Kubernetes, CI/CD, and observability chapters remain in normal document flow, followed by full project details. Reduced-motion mode disables parallax. The illustrated delivery gallery has been removed.

## Client-focused layout and brand assets

The opening view brings project, hiring, and résumé actions above the fold. Production projects follow the experience summary and continuously animated skills ticker. Capabilities and the working approach come before the deeper engineering story. The camera eases through approach, orbit, and retreat as visitors scroll.

Matching assets generated with the built-in image generation tool:

- `assets/ahsan-nawaz-linkedin-cover-remote.png`: LinkedIn cover exported at 1584 × 396, with profile-photo clearance and worldwide remote project availability. Upload this file with minimum zoom.
- `assets/devops-portfolio-social-services.jpg`: 1200 × 630 sharing thumbnail, referenced by static Open Graph and Twitter metadata on both pages. A new filename avoids the old image cache. Changes must be published before external sharing previews can fetch them; previously shared links may keep cached previews.
- `assets/brand-image-prompts.md`: exact prompts for regenerating both images.

## Immersive infrastructure journey

The background is a continuous 3D aisle through a cloud gateway, networked Kubernetes server racks, Jenkins delivery gates, and an automation control room. Page scroll moves the camera forward through the actual geometry. The hero scrolls naturally without blur or retreat; pointer movement adds heading depth and spring-driven hanging-card sway. Reduced-motion preferences disable these effects.

The card surfaces now use the cloth shaders and top-pinned wave simulation from the supplied Kage reference (`tile-cloth.js`), while text and links remain accessible HTML. All five project cards, including OneView, have a light continuous breeze and a gentle pointer response; expertise and contact tiles use a red gradient sweeping from left to right with slight inward copy movement. reduced motion and unavailable WebGL retain readable cards. `portfolio-atmosphere.js` adds a bounded opening loader and drifting local DevOps SVG marks from Simple Icons, synchronized with the scene pause control.

### Project enquiries and live delivery diagram

The main portfolio has Upwork and LinkedIn buttons and a project enquiry form that posts to FormSubmit for `productsbyahsan@gmail.com`. The visitor's email is included for replies. FormSubmit keeps its default CAPTCHA, and the form also includes a honeypot. After submission, visitors return to `thank-you.html` on the GitHub Pages site.

**Activation:** Submit the deployed form once and confirm the activation link sent to `productsbyahsan@gmail.com`. Inbox delivery requires this one-time confirmation. Update the form's `_next` URL if moving to a different domain. No Gmail password or secret is stored in the site.

`delivery-flow.js` draws SVG connections between HTML lifecycle cards using their actual positions. The flow includes a production feedback loop, animated connectors, a pause control, a single-column mobile layout, and reduced-motion support. This is an illustrative architecture assembled from the listed tool stack, rather than a live production status display.
