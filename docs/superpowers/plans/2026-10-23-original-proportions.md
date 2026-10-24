# Restore original section proportions

User wants About, My Education and What People Say restored close to their initial design, with full viewport presence and one section gesture instead of internal scrolling.

- [x] Compare original c141552 UI and capture current files. Remove accumulated compaction layers instead of stacking overrides.
- [x] Add regression checks for original desktop widths/fonts, original-like tall-mobile proportions, and one-gesture wheel/key/touch navigation in both directions.
- [x] Restore Education1024px timeline/20px card titles/24px padding and Testimonials450px cards/20px quote/96px portraits on tall screens. Keep original About240px portrait and typography. Use height-specific moderate adjustments only where required to fit. Restore larger phone typography/photo when the height allows.
- [x] Explicitly mark indexes1,4,5 as viewport-only panels; never scroll them internally or enter at their bottom, while preserving momentum and immediate reversal behavior, tall Contact scrolling, and all existing animations.
- [x] Verify every text/control fits at100% zoom on desktop, phone and short landscape; visually inspect screenshots; run full regression, lint/build and independent review.

Do not change Hero, Skills, Projects, Contact or navbar. Keep current content and mouse/touch testimonial interaction. No commits or deployment.

Verification: all five restoration groups pass, existing five viewport/interaction groups pass, extra740/840px breakpoint checks pass, lint/build pass, independent reviews found no important regressions. Integrated run passed 26/28 groups; two timing-dependent tests were fixed to wait for actual readiness and both passed in targeted rerun. All 28 groups validated across runs; see docs/portfolio-viewport-fit.md.
