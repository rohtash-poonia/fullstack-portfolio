# Viewport fit and testimonial mouse gestures

Goal: Keep About, Education and Testimonials exactly 100vh with all content visible, retaining existing design and transitions. Combine Node.js Developer and NestJS Developer in one typewriter entry.

Constraints: Existing React/Framer architecture, no dependencies, global zoom, whole-site scaling, or redesign. Preserve all prior changes. User explicitly requests direct implementation.

- [x] Add failing browser geometry checks at 320x568, 390x600, 768x1024, 1024x768, 1366x768, 1440x900 and 844x390. Check actual section height, all text/buttons within bounds, and no panel scrolling. Add combined-role and mouse swipe checks.
- [x] Home.jsx: combine the two titles, retain timing and use scoped responsive sizing only for the longer entry.
- [x] About.jsx, Experience.jsx, Testimonial.jsx and index.css: replace minimum heights with exact heights; reduce scoped gaps/padding and use small-screen sizing as needed. Preserve content and motions. Measure testimonial deck from card content instead of a fixed minimum.
- [x] Testimonial.jsx: mouse dragging on card surfaces/portraits with horizontal threshold, pointer capture/cancel cleanup, interactive-control exclusion and selectable text. Keep touch and arrow controls.
- [x] Update tests whose prior expectation was tall About scrolling; run focused checks, full browser suite, lint and build; inspect screenshots.

Review focus: long quotes across all six cards, portrait/heading overlap with navbar, short landscape screens, both-direction section navigation, selection and cancelled drags.

Owner correction: restore breathing room after initial spacing was too tight. Desktop About keeps 40px image/text gap, 16px stat padding, 24px action spacing and 36px before About Me. Education cards regain 20px padding and roughly 54px gaps at 768px height. Desktop testimonial cards are 400px wide with 28px padding. Mobile portrait increased to 80–96px. Compact sizing remains limited to short/small screens. Latest five focused groups pass across nine viewport sizes, all six testimonials, pointer cancellation/selection, and the combined hero title. Full 23-group suite passed before the final spacing-only correction.
