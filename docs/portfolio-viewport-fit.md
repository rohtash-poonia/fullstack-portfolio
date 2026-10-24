# About and What People Say: saved Astra layout restoration

Latest request: restore these two sections to the Astra version from before the 100vh compaction changes. Education is outside this correction.

Reference: the saved portfolio-viewport-before-Z5U4ix snapshot. The conversation timeline confirms that it precedes the switch from Astra and the viewport-compaction task. The current files were backed up separately to portfolio-astra-restore-q1yLfK before editing.

## Files changed

- src/index.css: restored About's desktop positioning and 48px content offset. Restored the saved desktop testimonial dimensions: 360px cards, 25.6px padding, 76.8px portraits, 16px quotes, and 51.2px heading/control gaps. Shorter desktop screens retain navbar clearance; screens below 750px height use smaller outer gaps. Existing mobile/landscape fit rules and exact 100vh section heights remain.
- src/sections/Testimonial.jsx: restored the saved 200px desktop / 250px mobile spacing between stacked cards. Existing springs, blur, mouse dragging, touch swiping, selectable text, and arrow buttons remain.
- scripts/verify-restoration.mjs: updated the testimonial size check to the requested saved version.
- This report: supersedes the previous restoration size targets.

About content and animations, Education, and all CSS outside these two sections were verified unchanged against the pre-edit snapshot. The shared scrolling coordinator was not modified.

## Verification

- Compared the saved reference and restored screenshots at 1366x768. About matches the saved desktop composition. Testimonials use the saved proportions and gaps with a small downward offset for navbar clearance on short desktops.
- Browser viewport matrix checked 14 desktop, tablet, phone, and landscape sizes, including every testimonial card. The initial run identified a heading-clearance issue at 768x740. After the breakpoint correction, all three section geometry groups passed again at the four boundary sizes (1024x840, 1366x840, 768x740, 390x740). The entire 14-size matrix was not repeated after that breakpoint-only correction.
- Mouse drag in both directions, cancelled/vertical drags, text selection, and the combined Node.js/NestJS hero line passed.
- Final focused browser run passed all five selected groups: native mobile horizontal swipes, saved desktop dimensions, readable phone dimensions, 24 one-wheel/key cases, and 6 vertical-touch cases. No runtime errors were reported.
- npm run lint and the final npm run build passed. Existing large Spline chunk and Node deprecation warnings remain.

Screenshots: portfolio-astra-restore-q1yLfK/restored-about-1366x768.png and restored-testimonials-1366x768.png in the system temporary directory.

Checks used Chromium at normal zoom. No commit or deployment was made.
