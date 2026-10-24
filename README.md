# Rohtash Poonia — Full Stack Developer

A responsive React/Vite portfolio with the existing dark theme, gradient accents, interactive robot, project showcase, education and experience timeline, testimonials, and EmailJS contact form.

Full Stack Developer | React • Next.js • Node.js • NestJS • JavaScript • TypeScript • Python • Django • MongoDB • PostgreSQL • REST APIs • API Integration • Docker • AWS • DevOps • GitHub

## Development

Requires Node.js compatible with Vite 7 (20.19+ or 22.12+).

```sh
npm ci
npm run dev
```

The portfolio is a client-rendered frontend. There is no active backend, authentication service, or database to configure. Next.js files under `src/backup` and older unused components are not part of the running Vite application.

## Contact form

Copy `.env.example` to `.env` and supply your EmailJS service ID, template ID, and public key. Existing environment settings are preserved. The template receives `from_name`, `from_email`, `service`, and `message`.

Only EmailJS public configuration belongs in these `VITE_` variables. Private keys and server credentials must never be added to client-side environment variables.

## Verification

```sh
npm run lint
npm run build
npx playwright install chromium
npm test
```

The browser suite starts and stops a local Vite server. It verifies full-screen section transitions, small wheel gestures, immediate reversals, backward entry into tall sections, project wheel/touch navigation, the skills marquee, stacked testimonials, cursor-responsive stars, menu focus and landscape access, responsive layouts, the resume, and contact success/failure/duplicate handling. Dummy EmailJS configuration and intercepted HTTP responses prevent real email delivery. Screenshots are saved in the system temporary directory.

There is no separate configured TypeScript checking command; Vite transpiles the existing TSX components.

## Production

```sh
npm run build
npm run preview
```

Publish `dist`. The included `vercel.json` preserves direct section URLs such as `/projects` on Vercel. Other static hosts need an equivalent SPA fallback to `index.html`.

The original intro, typewriter, Spline robot, star canvas, GSAP cursor, and full-screen transitions are restored from Git commit `c141552`. The robot retains its original desktop-only loading policy and dark gradient fallback for mobile/reduced-motion settings. The astronaut belongs only to the contact section. Music loads after selecting **Play Music**.

## Images

Original artwork is retained in the restored components. Additional optimized WebP variants are available under `src/assets/images/optimized`; originals remain intact. To regenerate them, install Sharp separately and run `node scripts/optimize-images.mjs`. Sharp is not a runtime dependency.

Project links and descriptions come from this repository. The three original projects are available again; IcyTales links to https://icylates.vercel.app/. The genuine historical Frontend Developer job title and education entries are preserved.

See [the latest targeted-update report](docs/portfolio-oct23.md) for verification results and limitations. The earlier restoration report remains in docs/portfolio-upgrade.md.
