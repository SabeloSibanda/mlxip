# MLX Website

Dark, scroll-driven one-pager for MLX — an IP commercialisation house.
Built with vendored GSAP + ScrollTrigger + Lenis. No build step, no npm install.

## Run

Any static file server works:

    cd website
    python3 -m http.server 8080

Then open http://localhost:8080

(Opening index.html directly from the filesystem also works — the only
network-independent fetch is a HEAD check for the optional background video,
which fails gracefully to the procedural canvas.)

## Structure

    index.html          — all nine sections
    css/styles.css      — design system (dark deep-tech, amber signal accent)
    css/fonts/          — vendored Space Grotesk / Inter / JetBrains Mono
    js/vendor/          — vendored gsap.min.js, ScrollTrigger.min.js, lenis.min.js
    js/background.js    — procedural scroll-scrubbed canvas background (3 phases)
    js/main.js          — Lenis smooth scroll, pinned Engine reveal, video slot
    copy/brand-kit.md   — strategy / identity reference
    assets/videos/      — drop MLX-scroll-background.mp4 here (auto-detected)

## Behavior

- Full-page fixed background. Without a video file it is a procedural canvas:
  hero dam-at-dusk → abstract signal light → infrastructure grid, blended by
  scroll progress. Drop `assets/videos/MLX-scroll-background.mp4` into place and
  the site swaps to scrubbing the video instead — no code changes.
- The Engine section pins while its six stages (Source → Scale) reveal in
  sequence, lighting the funnel bars one by one.
- Reveals, parallax and hero fade are GSAP/ScrollTrigger; Lenis drives smooth scroll.
- Respects prefers-reduced-motion.

## Notes

- Portfolio is seeded only with "Predict" + a "Future IP" placeholder, per the brief.
- Contact CTAs are mailto placeholders (technologies@ / partners@ — replace with real addresses).
